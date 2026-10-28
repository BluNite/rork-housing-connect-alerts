# syntax=docker/dockerfile:1

# ---------- Build stage ----------
# Lockfile-frozen install; only the public EXPO_PUBLIC_* vars are passed in
# (Supabase URL + anon key are public client values by design and are already
# visible in the deployed bundle). NEVER pass STRIPE_SECRET_KEY or
# STRIPE_WEBHOOK_SECRET here — server keys never enter the image.
FROM oven/bun:1.2-alpine AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG EXPO_PUBLIC_SUPABASE_URL
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY
ENV EXPO_PUBLIC_SUPABASE_URL="$EXPO_PUBLIC_SUPABASE_URL" \
    EXPO_PUBLIC_SUPABASE_ANON_KEY="$EXPO_PUBLIC_SUPABASE_ANON_KEY"

RUN bun run build

# ---------- Runtime stage ----------
# nginx-unprivileged: official nginx build patched to run as UID 101 (non-root)
# on port 8080. Final image contains only the compiled static files and nginx.
FROM nginxinc/nginx-unprivileged:1.27-alpine

USER 101

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html

# Strictly static: no env vars are read at runtime, no secrets are baked in.
ENV NGINX_ENTRYPOINT_QUIET_LOGS=1

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- --no-keepalive http://127.0.0.1:8080/healthz || exit 1
