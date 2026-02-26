FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
  ffmpeg \
  curl \
  && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
  && apt-get install -y nodejs \
  unzip \
  && rm -rf /var/lib/apt/lists/*

RUN node --version

RUN curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh

RUN deno --version

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN pip install --no-cache-dir --upgrade "yt-dlp[default]" && python -c "import yt_dlp; print('yt-dlp version:', yt_dlp.version.__version__)"

COPY . .

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app
