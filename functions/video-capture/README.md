# Video Capture Cloud Run Job

Captures 360° panorama videos using Playwright and FFmpeg, designed to run as a Cloud Run Job.

## Local Development

```bash
# Install dependencies
pnpm install

# Run locally
IMAGE_URL="https://example.com/360.jpg" node src/index.js
```

## Docker Build & Test

```bash
# Build the Docker image
docker build -t video-capture .

# Run locally with Docker
docker run -e IMAGE_URL="https://example.com/360.jpg" video-capture
```

## Deploy to Cloud Run Job

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/video-capture

# Create Cloud Run Job
gcloud run jobs create video-capture \
  --image gcr.io/YOUR_PROJECT_ID/video-capture \
  --region us-central1 \
  --memory 2Gi \
  --task-timeout 10m \
  --set-env-vars CAPTURE_URL=https://your-app.web.app/capture

# Execute the job
gcloud run jobs execute video-capture \
  --region us-central1 \
  --set-env-vars IMAGE_URL=https://example.com/360.jpg
```

## Trigger with Cloud Scheduler

```bash
# Create a scheduler job to run daily
gcloud scheduler jobs create http video-capture-daily \
  --location us-central1 \
  --schedule "0 2 * * *" \
  --uri "https://YOUR_REGION-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/YOUR_PROJECT_ID/jobs/video-capture:run" \
  --http-method POST \
  --oauth-service-account-email YOUR_SERVICE_ACCOUNT@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

## Environment Variables

- `IMAGE_URL` (required) - URL of the 360° equirectangular image
- `CAPTURE_URL` - URL of the capture page (default: http://localhost:3000/capture)
- `OUTPUT_PATH` - Output video file path (default: output.mp4)
- `FIREBASE_PROJECT_ID` - Firebase project ID (for uploading to Storage)
- `FIREBASE_STORAGE_BUCKET` - Storage bucket name

## Next Steps

1. Add Firebase Admin SDK for Storage upload
2. Create Firestore document after capture
3. Integrate with existing image collection
4. Add Cloud Function triggers for post-processing


## Commands to not forget 
Execute job : gcloud run jobs execute video-capture   --region us-central1  
