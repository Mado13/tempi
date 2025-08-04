FROM oven/bun:1.1.18-alpine AS build

WORKDIR /app

COPY tsconfig.json ./
COPY package.json ./
COPY frontend/package.json ./frontend/
COPY mobile/package.json ./mobile/

RUN bun install

COPY frontend/ ./frontend/

WORKDIR /app/frontend

RUN --mount=type=secret,id=VITE_BASE_URL \
   --mount=type=secret,id=VITE_SUPABASE_URL \
   VITE_BASE_URL="$(cat /run/secrets/VITE_BASE_URL)" \
   VITE_SUPABASE_URL="$(cat /run/secrets/VITE_SUPABASE_URL)" \
   bun run build

# --- serve with Caddy (was nginx) ---
FROM caddy:2.8-alpine

WORKDIR /srv
COPY --from=build /app/frontend/dist /srv/dist
COPY frontend/Caddyfile /etc/caddy/Caddyfile

# Optional: cheap health endpoint file (if you switch Fly check to /health)
RUN echo "ok" > /srv/dist/health.txt

EXPOSE 8080

