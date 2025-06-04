#!/usr/bin/env bash

VITE_HOST=$(ipconfig getifaddr en0)
[ -z "$VITE_HOST" ] && VITE_HOST=$(ipconfig getifaddr en1)

export VITE_HOST
echo "→ Using VITE_HOST=$VITE_HOST"

exec iex -S mix phx.server
