import Config

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================

config :tempi, Tempi.Repo,
  username: "postgres",
  password: "postgres",
  hostname: "localhost",
  database: "tempi_dev",
  log: :debug,
  stacktrace: true,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

# =============================================================================
# WEB ENDPOINT CONFIGURATION  
# =============================================================================

# For development, we disable any cache and enable
# debugging and code reloading.
#
# The watchers configuration can be used to run external
# watchers to your application. For example, we can use it
# to bundle .js and .css sources.
# Binding to loopback ipv4 address prevents access from other machines.
config :tempi, TempiWeb.Endpoint,
  # change to `ip: {0, 0, 0, 0}` to allow access from other machines.
  http: [ip: {127, 0, 0, 1}, port: 4000],
  check_origin: false,
  code_reloader: true,
  debug_errors: true,
  watchers: []

# =============================================================================
# DEVELOPMENT TOOLS
# =============================================================================

# Enable dev routes for dashboard and mailbox
config :tempi, dev_routes: true

# Do not include metadata nor timestamps in development logs
config :logger, :console,
  format: "$time [$level] $metadata$message\n",
  metadata: [:request_id, :domain, :error_reason],
  colors: [
    debug: :cyan,
    info: :normal,
    warn: :yellow,
    error: [:red, :bright]
  ]

config :phoenix, :logger, false

config :phoenix, :filter_parameters, ["password", "token", "secret"]

# Set a higher stacktrace during development. Avoid configuring such
# in production as building large stacktraces may be expensive.
config :phoenix, :stacktrace_depth, 20

# Initialize plugs at runtime for faster development compilation
config :phoenix, :plug_init_mode, :runtime

# Disable swoosh api client as it is only required for production adapters.
config :swoosh, :api_client, false
