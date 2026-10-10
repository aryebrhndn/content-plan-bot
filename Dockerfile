FROM python:3.10-slim

# Install dependencies sistem, FFmpeg, Node.js 20, & Chromium untuk Remotion render
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    fonts-freefont-ttf \
    curl \
    chromium \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Buat non-root user untuk Hugging Face Spaces (UID 1000)
RUN useradd -m -u 1000 appuser

WORKDIR /app

# Salin dan install dependencies Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Salin dan install dependencies Node.js & Remotion
COPY package*.json ./
RUN npm install --no-audit && \
    (npx remotion browser ensure || true)

# Salin seluruh kode proyek
COPY . .

# Buat direktori temp & aset serta berikan izin akses ke appuser
RUN mkdir -p /app/temp /app/assets/fonts /app/assets/footages /home/appuser/.cache && \
    chown -R appuser:appuser /app /home/appuser

USER appuser

# Hugging Face Spaces port default adalah 7860
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
