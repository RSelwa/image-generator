# Use official Playwright image (includes Chromium + system dependencies)
FROM mcr.microsoft.com/playwright:v1.58.0-jammy

# Install FFmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Run the capture script
CMD ["node", "src/index.js"]
