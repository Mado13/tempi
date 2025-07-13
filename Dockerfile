# ---- Stage 1: Build ----
FROM hexpm/elixir:1.18.3-erlang-27.3-alpine-3.21.3 AS build

# Install build dependencies
RUN apk add --no-cache build-base git

# Set environment
ENV MIX_ENV=prod

WORKDIR /app

# Install Hex & Rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Install dependencies
COPY mix.exs mix.lock ./
COPY config config
RUN mix deps.get --only prod && \
    mix deps.compile

# Copy source code
COPY lib lib
COPY priv priv

# Compile and build release
RUN mix compile && \
    mix release

# ---- Stage 2: Runtime ----
FROM alpine:3.21.3

# Install runtime dependencies
RUN apk add --no-cache libstdc++ openssl ncurses-libs ca-certificates

WORKDIR /app

# Copy release from build stage
COPY --from=build /app/_build/prod/rel/tempi ./

# Copy Supabase SSL certificate
COPY priv/supabase-ca.pem /app/ssl/supabase-ca.pem

# Create non-root user for security
RUN addgroup -g 1000 -S tempi && \
    adduser -u 1000 -S tempi -G tempi && \
    chown -R tempi:tempi /app

USER tempi

# Set HOME for Erlang cookie
ENV HOME=/app

CMD ["bin/tempi", "start"]
