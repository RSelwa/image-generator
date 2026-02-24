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

# Copy root workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy libs needed by video-capture
COPY libs/common/package.json libs/common/
COPY libs/common/dist/ libs/common/dist/

# Copy video-capture package
COPY functions/video-capture/package.json functions/video-capture/

# Install dependencies (workspace resolves @repo/common)
RUN pnpm install --filter @repo/video-capture

# Copy video-capture source
COPY functions/video-capture/ functions/video-capture/

# Build TypeScript
RUN pnpm --filter @repo/video-capture build

# Remove devDependencies after build
RUN CI=true pnpm install --filter @repo/video-capture --prod

WORKDIR /app/functions/video-capture

# Run the compiled capture script
CMD ["node", "dist/index.js"]
