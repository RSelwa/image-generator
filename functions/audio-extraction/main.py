import datetime
import json
import os
import re
import subprocess

import google.auth
import google.auth.transport.requests
import firebase_admin
from firebase_admin import credentials, firestore, storage
from flask import Flask, jsonify, request

PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "tiktok-generator-fa261")
STORAGE_BUCKET = os.environ.get("FIREBASE_STORAGE_BUCKET", f"{PROJECT_ID}.firebasestorage.app")

COOKIES_PATH = "/tmp/cookies.txt"
PROXY_URL = f"socks5://{os.environ.get('PROXY_KEY', '')}@161.77.142.146:50101"

app = Flask(__name__)

_firebase_initialized = False


def init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return
    service_account_key = os.environ.get("SERVICE_ACCOUNT_KEY")
    credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")

    if service_account_key:
        cred = credentials.Certificate(json.loads(service_account_key))
    elif credentials_path:
        cred = credentials.Certificate(credentials_path)
    else:
        cred = credentials.ApplicationDefault()

    firebase_admin.initialize_app(cred, {"storageBucket": STORAGE_BUCKET})
    _firebase_initialized = True


def write_cookies_file():
    cookies_content = os.environ.get("YOUTUBE_COOKIES")
    if not cookies_content:
        raise RuntimeError("YOUTUBE_COOKIES environment variable is not set")
    with open(COOKIES_PATH, "w") as f:
        f.write(cookies_content)


def extract_youtube_id(youtube_url: str) -> str:
    patterns = [
        r"(?:v=|/v/|youtu\.be/)([a-zA-Z0-9_-]{11})",
        r"(?:embed/)([a-zA-Z0-9_-]{11})",
        r"(?:shorts/)([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, youtube_url)
        if match:
            return match.group(1)
    raise RuntimeError(f"Could not extract YouTube ID from: {youtube_url}")


def extract_audio_from_youtube(youtube_url: str, youtube_id: str) -> tuple[str, str]:
    """Extract audio from YouTube via yt-dlp through ISP proxy + cookies + ffmpeg.
    Returns (audio_path, youtube_title)."""
    write_cookies_file()
    output_path = f"/tmp/{youtube_id}_youtube_audio"

    subprocess.run([
        "yt-dlp", "--list-formats",
        "--proxy", PROXY_URL,
        "--cookies", COOKIES_PATH,
        youtube_url,
    ])

    title_result = subprocess.run([
        "yt-dlp", "--print", "title",
        "--proxy", PROXY_URL,
        "--cookies", COOKIES_PATH,
        "--no-playlist",
        youtube_url,
    ], capture_output=True, text=True, check=True)
    youtube_title = title_result.stdout.strip()

    subprocess.run([
        "yt-dlp", "-f", "bestaudio*/best",
        "--proxy", PROXY_URL,
        "--cookies", COOKIES_PATH,
        "--no-playlist",
        "-x", "--audio-format", "mp3",
        "-o", f"{output_path}.%(ext)s",
        youtube_url,
    ], check=True)

    return f"{output_path}.mp3", youtube_title


def generate_signed_url(blob, expiration_days: int = 7) -> str:
    creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
    auth_req = google.auth.transport.requests.Request()
    creds.refresh(auth_req)
    return blob.generate_signed_url(
        expiration=datetime.timedelta(days=expiration_days),
        method="GET",
        version="v4",
        service_account_email=creds.service_account_email,
        access_token=creds.token,
    )


def process_audio(youtube_link: str) -> str:
    """Extract audio from YouTube, store it, and return the sound document ID."""
    db = firestore.client()
    bucket = storage.bucket()

    youtube_id = extract_youtube_id(youtube_link)
    print(f"YouTube ID: {youtube_id}")

    # Set all matching sounds to pending at the start of the job
    pending_sounds = db.collection("sounds").where("youtubeId", "==", youtube_id).get()
    for doc in pending_sounds:
        doc.reference.update({"status": "pending"})

    existing_sounds = db.collection("sounds").where("youtubeId", "==", youtube_id).limit(1).get()
    existing_sound_doc = existing_sounds[0] if existing_sounds else None

    # Fallback: the doc may have been created with only youtubeLink (youtubeId not yet indexed)
    if not existing_sound_doc:
        existing_by_link = db.collection("sounds").where("youtubeLink", "==", youtube_link).limit(1).get()
        existing_sound_doc = existing_by_link[0] if existing_by_link else None
        if existing_sound_doc:
            print(f"Found existing sound doc by youtubeLink for YouTube ID {youtube_id}, pre-populating youtubeId")
            existing_sound_doc.reference.update({"youtubeId": youtube_id, "status": "pending"})

    if existing_sound_doc:
        sound_data = existing_sound_doc.to_dict()
        audio_signed_url = sound_data.get("storagePath") or ""
        if audio_signed_url:
            print(f"Sound document already exists for YouTube ID {youtube_id}, reusing it")
            existing_sound_doc.reference.update({"status": "processed"})
            return existing_sound_doc.id

    print(f"Extracting audio from YouTube: {youtube_link}")
    audio_path, youtube_title = extract_audio_from_youtube(youtube_link, youtube_id)
    print(f"YouTube title: {youtube_title}")

    audio_storage_path = f"sounds/{youtube_id}_audio.mp3"
    audio_blob = bucket.blob(audio_storage_path)
    audio_blob.upload_from_filename(audio_path, content_type="audio/mpeg")
    audio_signed_url = generate_signed_url(audio_blob)

    if existing_sound_doc:
        existing_sound_doc.reference.update({
            "updatedAt": firestore.SERVER_TIMESTAMP,
            "storagePath": audio_signed_url,
            "youtubeId": youtube_id,
            "youtubeTitle": youtube_title,
            "status": "processed",
        })
        sound_id = existing_sound_doc.id
        print(f"Sound document updated for YouTube ID {youtube_id}")
    else:
        _, new_sound_ref = db.collection("sounds").add({
            "createdAt": firestore.SERVER_TIMESTAMP,
            "updatedAt": firestore.SERVER_TIMESTAMP,
            "status": "processed",
            "storagePath": audio_signed_url,
            "youtubeLink": youtube_link,
            "youtubeId": youtube_id,
            "youtubeTitle": youtube_title,
        })
        sound_id = new_sound_ref.id
        print(f"Sound document created for YouTube ID {youtube_id}")

    if os.path.exists(audio_path):
        os.unlink(audio_path)

    return sound_id


@app.route("/", methods=["POST"])
def extract_audio():
    data = request.get_json(silent=True)
    youtube_link = data.get("youtubeLink") if data else None

    if not youtube_link:
        return jsonify({"error": "youtubeLink is required"}), 400

    init_firebase()
    sound_id = process_audio(youtube_link)
    return jsonify({"soundId": sound_id})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
