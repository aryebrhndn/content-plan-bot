FROM python:3.10-slim

# Install dependencies sistem, FFmpeg, Node.js 20, & Chromium libraries untuk Remotion render
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    fonts-freefont-ttf \
    fonts-liberation \
    curl \
    chromium \
    procps \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libgtk-3-0 \
    libpango-1.0-0 \
    libcairo2 \
    libx11-xcb1 \
    libxcursor1 \
    libxi6 \
    libxtst6 \
    libxss1 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Buat non-root user untuk Hugging Face Spaces & Railway (UID 1000)
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Salin dan install dependencies Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Salin dan install dependencies Node.js & Remotion
COPY package*.json ./
RUN npm install --no-audit

# Salin seluruh kode proyek
COPY . .

# Buat direktori temp, cache, serta berikan hak akses penuh ke appuser
RUN mkdir -p /app/temp /app/assets/fonts /app/assets/footages /home/appuser/.cache /app/node_modules/.remotion && \
    chmod -R 777 /app/temp /home/appuser/.cache && \
    chown -R appuser:appuser /app /home/appuser

USER appuser

# Unduh Chrome Headless Shell Remotion sebagai appuser
RUN npx remotion browser ensure || true

# Hugging Face Spaces port default adalah 7860
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
