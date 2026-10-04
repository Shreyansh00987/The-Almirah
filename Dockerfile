# Multi-stage production container for The Almirah (Next.js + FastAPI)
# Stage 1: Build Next.js application
FROM node:20-alpine AS next-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production runner with Python 3.11 and Node.js 20
FROM python:3.11-slim AS runner
WORKDIR /app

# Install Node.js 20 and system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application files and built assets
COPY . .
COPY --from=next-builder /app/.next ./.next
COPY --from=next-builder /app/node_modules ./node_modules

# Ensure data directory exists
RUN mkdir -p /app/data/documents

ENV NODE_ENV=production
ENV PORT=3000
ENV BACKEND_INTERNAL_URL=http://127.0.0.1:8000
ENV DEMO_MODE=true

EXPOSE 3000

# Start FastAPI in background on internal port 8000 and Next.js on $PORT
CMD ["sh", "-c", "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 & npm run start -- -p ${PORT:-3000}"]
