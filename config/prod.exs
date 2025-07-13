import Config

# API-only endpoint configuration
config :tempi, TempiWeb.Endpoint,
  cache_static_manifest: "priv/static/cache_manifest.json",
  # Force SSL in production
  force_ssl: [rewrite_on: [:x_forwarded_proto], hsts: true]

# Configures Swoosh API Client
config :swoosh, api_client: Swoosh.ApiClient.Finch, finch_name: Tempi.Finch

# Disable Swoosh Local Memory Storage
config :swoosh, local: false

# Production logging
config :logger, level: :info

config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id, :remote_ip, :user_id]

# API-specific: only JSON errors
config :tempi, TempiWeb.Endpoint,
  render_errors: [
    formats: [json: TempiWeb.ErrorJSON],
    layout: false
  ]
