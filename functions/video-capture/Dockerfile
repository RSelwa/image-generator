# Use official Playwright image (includes Chromium + system dependencies)
FROM mcr.microsoft.com/playwright:v1.58.0-jammy

# Install FFmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm globally using npm
RUN npm install -g pnpm@10.28.2

# Set working directory
WORKDIR /app

# Copy package file
COPY package.json ./

# Install dependencies
RUN pnpm install --prod

# Copy application code
COPY . .

# Run the capture script
CMD ["node", "src/index.js"]
