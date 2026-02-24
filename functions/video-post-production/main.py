import datetime
import json
import os
import subprocess
import tempfile

import google.auth
import google.auth.transport.requests
import requests
import firebase_admin
from firebase_admin import credentials, firestore, storage

SOCIAL_DOC_ID = os.environ["SOCIAL_DOC_ID"]
PROJECT_ID = os.environ.get("FIREBASE_PROJECT_ID", "tiktok-generator-fa261")
STORAGE_BUCKET = os.environ.get("FIREBASE_STORAGE_BUCKET", f"{PROJECT_ID}.firebasestorage.app")

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")
MUSIC_PATH = os.path.join(ASSETS_DIR, "music.mp3")
LOGO_PATH = os.path.join(ASSETS_DIR, "logo.png")

FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

SOCIALS_STATUS_ERROR = "error"
SOCIALS_STATUS_READY_TO_POST = "ready_to_post"


def init_firebase():
    service_account_key = os.environ.get("SERVICE_ACCOUNT_KEY")
    credentials_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")

    if service_account_key:
        cred = credentials.Certificate(json.loads(service_account_key))
    elif credentials_path:
        cred = credentials.Certificate(credentials_path)
    else:
        cred = credentials.ApplicationDefault()

    firebase_admin.initialize_app(cred, {"storageBucket": STORAGE_BUCKET})


def get_video_duration(path: str) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "csv=p=0",
            path,
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(result.stdout.strip())


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


def escape_drawtext(text: str) -> str:
    return text.replace("\\", "\\\\").replace("'", "\\'").replace(":", "\\:")


def run_post_production(input_path: str, output_path: str, hook: str):
    duration = get_video_duration(input_path)
    hook_escaped = escape_drawtext(hook)

    has_music = os.path.exists(MUSIC_PATH)
    has_logo = os.path.exists(LOGO_PATH)

    if has_music and has_logo:
        filter_complex = (
            f"[0:v]drawtext=text='{hook_escaped}':fontfile={FONT_PATH}:fontsize=42:"
            f"fontcolor=white:x=(w-text_w)/2:y=h*0.85:"
            f"shadowcolor=black@0.8:shadowx=2:shadowy=2[v_text];"
            f"[v_text][2:v]overlay=W-w-20:20[v_out];"
            f"[1:a]volume=0.3,atrim=0:{duration},asetpts=PTS-STARTPTS[audio_out]"
        )
        cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-stream_loop", "-1", "-i", MUSIC_PATH,
            "-i", LOGO_PATH,
            "-filter_complex", filter_complex,
            "-map", "[v_out]",
            "-map", "[audio_out]",
            "-c:v", "libx264", "-preset", "fast", "-crf", "23",
            "-c:a", "aac", "-b:a", "128k",
            "-shortest",
            output_path,
        ]
    elif has_logo:
        filter_complex = (
            f"[0:v]drawtext=text='{hook_escaped}':fontfile={FONT_PATH}:fontsize=42:"
            f"fontcolor=white:x=(w-text_w)/2:y=h*0.85:"
            f"shadowcolor=black@0.8:shadowx=2:shadowy=2[v_text];"
            f"[v_text][1:v]overlay=W-w-20:20[v_out]"
        )
        cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-i", LOGO_PATH,
            "-filter_complex", filter_complex,
            "-map", "[v_out]",
            "-map", "0:a?",
            "-c:v", "libx264", "-preset", "fast", "-crf", "23",
            "-c:a", "aac", "-b:a", "128k",
            output_path,
        ]
    elif has_music:
        filter_complex = (
            f"[0:v]drawtext=text='{hook_escaped}':fontfile={FONT_PATH}:fontsize=42:"
            f"fontcolor=white:x=(w-text_w)/2:y=h*0.85:"
            f"shadowcolor=black@0.8:shadowx=2:shadowy=2[v_out];"
            f"[1:a]volume=0.3,atrim=0:{duration},asetpts=PTS-STARTPTS[audio_out]"
        )
        cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-stream_loop", "-1", "-i", MUSIC_PATH,
            "-filter_complex", filter_complex,
            "-map", "[v_out]",
            "-map", "[audio_out]",
            "-c:v", "libx264", "-preset", "fast", "-crf", "23",
            "-c:a", "aac", "-b:a", "128k",
            "-shortest",
            output_path,
        ]
    else:
        filter_complex = (
            f"[0:v]drawtext=text='{hook_escaped}':fontfile={FONT_PATH}:fontsize=42:"
            f"fontcolor=white:x=(w-text_w)/2:y=h*0.85:"
            f"shadowcolor=black@0.8:shadowx=2:shadowy=2[v_out]"
        )
        cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-filter_complex", filter_complex,
            "-map", "[v_out]",
            "-map", "0:a?",
            "-c:v", "libx264", "-preset", "fast", "-crf", "23",
            "-c:a", "aac", "-b:a", "128k",
            output_path,
        ]

    subprocess.run(cmd, check=True)


def main():
    init_firebase()

    db = firestore.client()
    bucket = storage.bucket()

    social_ref = db.collection("socials").document(SOCIAL_DOC_ID)
    social_doc = social_ref.get()

    if not social_doc.exists:
        raise RuntimeError(f"Social doc {SOCIAL_DOC_ID} not found")

    social_data = social_doc.to_dict()
    url_spherical = social_data.get("urlSphericalVideoStorage")
    hook = social_data.get("hook") or ""

    if not url_spherical:
        raise RuntimeError(f"Social doc {SOCIAL_DOC_ID} has no urlSphericalVideoStorage")

    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp_input:
        input_path = tmp_input.name
        response = requests.get(url_spherical, timeout=120)
        response.raise_for_status()
        tmp_input.write(response.content)

    output_path = f"/tmp/{SOCIAL_DOC_ID}_customized.mp4"
    storage_path = f"socials/{SOCIAL_DOC_ID}_customized.mp4"

    run_post_production(input_path, output_path, hook)

    blob = bucket.blob(storage_path)
    blob.upload_from_filename(output_path, content_type="video/mp4")

    signed_url = generate_signed_url(blob)

    social_ref.update({
        "urlCustomizedVideoStorage": signed_url,
        "status": SOCIALS_STATUS_READY_TO_POST,
    })

    print(f"Post-production complete for social {SOCIAL_DOC_ID}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error during post-production for social {SOCIAL_DOC_ID}: {e}")

        try:
            db = firestore.client()
            db.collection("socials").document(SOCIAL_DOC_ID).update({
                "status": SOCIALS_STATUS_ERROR,
                "errorInfo": str(e),
            })
        except Exception as update_err:
            print(f"Failed to update error status: {update_err}")

        raise
