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

# Install all dependencies (including devDependencies for build)
RUN pnpm install

# Copy application code
COPY . .

# Build TypeScript
RUN pnpm build

# Remove devDependencies after build
RUN pnpm install --prod

# Run the compiled capture script
CMD ["node", "dist/index.js"]
