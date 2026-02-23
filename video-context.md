# 📝 CONTEXT MANIFEST:

GameGuessr Video AutomationProject Overview: A GeoGuessr-style game for video games using 360° spherical images.

The goal is to automate the creation of viral TikTok/Instagram/Reels content from these assets.

Architecture established:Frontend/Rendu: ReactSphere (Three.js) used to render the $360^{\circ}$ equirectangular images.

Capture: Cloud Run running Puppeteer/Playwright to record a portrait-mode (9:16) screencast of the Three.js scene.

Storage/DB: Google Cloud Storage (for .mp4 files) and Firestore (for metadata: game_name, year, difficulty, video_status).

Post-Production: A Python Cloud Function/Cloud Run instance using MoviePy to add overlays.
Distribution: Automated posting via Instagram Graph API.
Video Specs & Logic:Layout: 9:16 vertical. Background is a blurred, scaled version of the capture. Foreground is the crisp 16:9/square capture.
Gamification:Hooks: Randomly selected from a bank (Challenge, Nostalgia, Expert, Engagement).
Visual Cues: A countdown progress bar at the bottom to drive retention.
Dynamic Overlay: Text displaying the hook and the game's release year.
Tone: Authentic, witty, and engaging "Gamer" vibe.
Python Processing Logic (MoviePy):
Background: clip.resize(height=1920).fx(gaussian_blur, 15)
Foreground: clip.resize(width=1000).set_position("center")
Progress Bar: An animated ColorClip moving from $x=0$ to $x=-1080$ over duration.

Strategy for Social Media:
Captions: Automated templates using placeholders for game name and year.
Engagement: First comment automation to ask for "Score out of 10" or "Best memory."
