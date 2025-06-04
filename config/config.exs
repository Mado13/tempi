# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :inertia,
  endpoint: TempiWeb.Endpoint,
  static_paths: ["/frontend/app/app.js"],
  default_version: "1",
  history: [encrypt: false],
  camelize_props: true,
  ssr: false,
  raise_on_ssr_failure: config_env() != :prod

config :elixir, :time_zone_database, Tz.TimeZoneDatabase
config :tzdata, :autoupdate, :disabled

config :bun,
  version: "1.2.1",
  dev: [
    args: ~w(x --bun vite --host 0.0.0.0),
    cd: Path.expand("../frontend", __DIR__),
    env: %{
      "VITE_HOST" => System.get_env("VITE_HOST") || "localhost"
    }
  ],
  install: [
    args: ~w(i),
    cd: Path.expand("../frontend", __DIR__),
    env: %{}
  ],
  build: [
    args: ~w(x --bun vite build),
    cd: Path.expand("../frontend", __DIR__),
    env: %{}
  ]

config :tempi,
  ecto_repos: [Tempi.Repo],
  generators: [timestamp_type: :utc_datetime]

# Configures the endpoint
config :tempi, TempiWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [html: TempiWeb.ErrorHTML, json: TempiWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: Tempi.PubSub

# Configures the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :tempi, Tempi.Mailer, adapter: Swoosh.Adapters.Local

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

config :ex_twilio,
  account_sid: {:system, "TWILIO_ACCOUNT_SID"},
  auth_token: {:system, "TWILIO_AUTH_TOKEN"}

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
