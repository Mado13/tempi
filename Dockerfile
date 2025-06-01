# ---- Stage 1: Build ----
FROM hexpm/elixir:1.18.3-erlang-27.3-debian-buster-20240612 AS build

RUN apt-get update && apt-get install -y \
  build-essential \
  git \
  curl \
  unzip \
  ca-certificates

# Install Bun (includes JS runtime with ESM support)
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Limit memory and concurrency to avoid OOM during Vite build
ENV BUN_INSTALL_CONCURRENCY=4
ENV NODE_OPTIONS=--max_old_space_size=512

# Set environment and working directory
ENV MIX_ENV=prod
WORKDIR /app

# Install Hex & Rebar
RUN mix local.hex --force && mix local.rebar --force

# Install Elixir dependencies
COPY mix.exs mix.lock ./
COPY config config
RUN mix deps.get --only prod && mix deps.compile

# Copy full source and build frontend
COPY . .

# Build Phoenix digest and release
RUN mix assets.deploy && mix release

# ---- Stage 2: Runtime ----
FROM debian:buster-slim

RUN apt-get update && apt-get install -y \
  libssl-dev \
  ncurses-bin \
  libstdc++6 \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV HOME=/app
WORKDIR /app

COPY --from=build /app/_build/prod/rel/tempi ./
RUN mkdir -p /app/ssl
COPY priv/supabase-ca.pem /app/ssl/supabase-ca.pem

CMD ["bin/tempi", "start"]

