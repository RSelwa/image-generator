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


def get_video_dimensions(path: str) -> tuple[int, int]:
    result = subprocess.run(
        [
            "ffprobe",
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "csv=p=0",
            path,
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    parts = result.stdout.strip().split(",")
    return int(parts[0]), int(parts[1])


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


def wrap_text(text: str, font, max_width: int, draw) -> list[str]:
    words = text.split()
    lines = []
    current_line = ""

    for word in words:
        test_line = f"{current_line} {word}".strip() if current_line else word
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word

    if current_line:
        lines.append(current_line)

    return lines


def create_text_overlay(hook: str, video_width: int, video_height: int, output_path: str):
    from PIL import Image, ImageDraw, ImageFont
    from pilmoji import Pilmoji

    img = Image.new("RGBA", (video_width, video_height), (0, 0, 0, 0))

    if not hook.strip():
        img.save(output_path, "PNG")
        return

    font_size = 42
    font = ImageFont.truetype(FONT_PATH, font_size)
    padding_x = 20
    padding_y = 12
    max_text_width = int(video_width * 0.85)

    temp_draw = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    lines = wrap_text(hook, font, max_text_width, temp_draw)

    line_bboxes = [temp_draw.textbbox((0, 0), line, font=font) for line in lines]
    line_heights = [bb[3] - bb[1] for bb in line_bboxes]
    line_widths = [bb[2] - bb[0] for bb in line_bboxes]
    line_spacing = 8

    text_w = max(line_widths)
    text_h = sum(line_heights) + line_spacing * (len(lines) - 1)

    box_w = text_w + padding_x * 2
    box_h = text_h + padding_y * 2
    box_x = (video_width - box_w) // 2
    box_y = int(video_height * 0.85) - box_h // 2

    draw = ImageDraw.Draw(img)
    draw.rectangle([box_x, box_y, box_x + box_w, box_y + box_h], fill=(255, 255, 255, 230))

    with Pilmoji(img) as pilmoji_obj:
        y = box_y + padding_y
        for i, line in enumerate(lines):
            line_w = line_widths[i]
            x = box_x + (box_w - line_w) // 2
            pilmoji_obj.text((x, y), line, fill=(0, 0, 0, 255), font=font)
            y += line_heights[i] + line_spacing

    img.save(output_path, "PNG")


def run_post_production(input_path: str, output_path: str, hook: str):
    duration = get_video_duration(input_path)
    video_width, video_height = get_video_dimensions(input_path)

    text_overlay_path = f"/tmp/text_overlay_{SOCIAL_DOC_ID}.png"
    create_text_overlay(hook, video_width, video_height, text_overlay_path)

    has_music = os.path.exists(MUSIC_PATH)
    has_logo = os.path.exists(LOGO_PATH)

    try:
        if has_music and has_logo:
            filter_complex = (
                f"[0:v][1:v]overlay=0:0[v_text];"
                f"[v_text][3:v]overlay=W-w-20:20[v_out];"
                f"[2:a]volume=0.3,atrim=0:{duration},asetpts=PTS-STARTPTS[audio_out]"
            )
            cmd = [
                "ffmpeg", "-y",
                "-i", input_path,
                "-i", text_overlay_path,
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
                f"[0:v][1:v]overlay=0:0[v_text];"
                f"[v_text][2:v]overlay=W-w-20:20[v_out]"
            )
            cmd = [
                "ffmpeg", "-y",
                "-i", input_path,
                "-i", text_overlay_path,
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
                f"[0:v][1:v]overlay=0:0[v_out];"
                f"[2:a]volume=0.3,atrim=0:{duration},asetpts=PTS-STARTPTS[audio_out]"
            )
            cmd = [
                "ffmpeg", "-y",
                "-i", input_path,
                "-i", text_overlay_path,
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
            filter_complex = "[0:v][1:v]overlay=0:0[v_out]"
            cmd = [
                "ffmpeg", "-y",
                "-i", input_path,
                "-i", text_overlay_path,
                "-filter_complex", filter_complex,
                "-map", "[v_out]",
                "-map", "0:a?",
                "-c:v", "libx264", "-preset", "fast", "-crf", "23",
                "-c:a", "aac", "-b:a", "128k",
                output_path,
            ]

        subprocess.run(cmd, check=True)
    finally:
        if os.path.exists(text_overlay_path):
            os.unlink(text_overlay_path)


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
