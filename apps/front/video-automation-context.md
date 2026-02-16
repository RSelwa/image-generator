# Video Automation Project Context

## Project Overview

Automated video generation pipeline for TikTok/Instagram content. The system captures 360° images from a Three.js viewer, generates videos with camera animations, and uploads them to social platforms.

## Tech Stack

- **Frontend**: Next.js + React + Three.js
- **Automation**: Playwright (already in project)
- **Video Encoding**: FFmpeg
- **Storage**: Firebase Storage
- **Database**: Firestore
- **Compute**: Cloud Run Job (for capture service)

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Trigger     │────▶│ Capture     │────▶│ Upload to   │────▶│ Create doc  │
│ (cron/HTTP) │     │ (Playwright)│     │ Firebase    │     │ in Firestore│
│             │     │             │     │ Storage     │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │ Cloud Func  │
                                                            │ (onWrite)   │
                                                            │ - effects   │
                                                            │ - audio     │
                                                            │ - upload    │
                                                            └─────────────┘
```

---

## Components to Build

### 1. Capture Page (`/capture`)

A dedicated Next.js page that:
- Accepts `?image=URL` query parameter
- Renders 360° equirectangular image in fullscreen Three.js sphere
- Exposes `window.setCamera(yaw, pitch)` for Playwright control
- Sets `window.sceneReady = true` when texture loaded

**Three.js setup:**
- SphereGeometry with inverted normals (scale -1,1,1) for inside view
- MeshBasicMaterial with equirectangular texture
- PerspectiveCamera with exposed rotation control

### 2. Capture Script

Node.js script that:
- Launches headless Chromium via Playwright
- Sets viewport to 1080x1920 (vertical for TikTok/Reels)
- Navigates to capture page with image URL
- Waits for `window.sceneReady`
- Animates camera by calling `window.setCamera(yaw, pitch)` in loop
- Captures frames via `page.screenshot()`
- Pipes frames directly to FFmpeg (avoids disk I/O)
- Outputs MP4 file

**Camera animation ideas:**
- Slow pan (90° rotation over 5 seconds)
- Subtle vertical wave (sine function)
- Keyframe-based movements
- Random/organic motion

**FFmpeg command (piped input):**
```bash
ffmpeg -y -f image2pipe -framerate 30 -i - -c:v libx264 -pix_fmt yuv420p -preset fast output.mp4
```

### 3. Cloud Run Job

Docker container that runs the capture script.

**Dockerfile:**
```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy
RUN apt-get update && apt-get install -y ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node", "capture.js"]
```

**Deploy command:**
```bash
gcloud run jobs create video-capture \
  --image gcr.io/your-project/capture \
  --memory 2Gi \
  --task-timeout 10m
```

**Trigger options:**
- Cloud Scheduler (cron)
- HTTP trigger
- Eventarc (Firestore trigger)

### 4. Firestore Document Structure

Collection: `videos/{id}`

```json
{
  "imageId": "string",
  "rawVideoUrl": "gs://bucket/raw-videos/{id}.mp4",
  "status": "raw | processing | ready | published",
  "createdAt": "timestamp",
  "finalVideoUrl": "string (optional)"
}
```

### 5. Cloud Functions (downstream processing)

**onVideoCreated** (Firestore trigger on `status === "raw"`):
- Download raw video from Storage
- Add effects, text overlays, audio
- Upload final video to Storage
- Update doc: `status = "ready"`, add `finalVideoUrl`

**onVideoReady** (Firestore trigger on `status === "ready"`):
- POST video to TikTok/Instagram APIs
- Update doc: `status = "published"`

---

## Implementation Order

1. Build `/capture` page with Three.js 360° viewer
2. Create capture script with Playwright + FFmpeg
3. Test locally end-to-end
4. Dockerize capture script
5. Deploy to Cloud Run Job
6. Set up Cloud Scheduler or HTTP trigger
7. Add Firebase Storage upload logic
8. Create Firestore document on completion
9. Build Cloud Functions for post-processing

---

## Key Technical Notes

- **Why not Cloud Functions for capture?** Memory limits (~4GB max), no browser included, Chromium bundle exceeds deployment limits (~400MB)
- **Why Cloud Run Job?** Supports Docker, up to 32GB RAM, 60 min timeout, Firebase-native billing
- **Frame piping**: Stream screenshots directly to FFmpeg stdin to avoid writing thousands of temp files
- **Resolution**: 1080x1920 vertical for TikTok/Reels optimal format
- **FPS**: 30fps recommended (33ms between frames)

---

## Existing Project Context

- Next.js + React project
- Playwright already installed
- Previous experience with Python + pygame for video generation (frames → audio → mp4 → POST upload)
- Three.js for 360° image rendering
