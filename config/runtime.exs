import Config
import Dotenvy

# === ENVIRONMENT SETUP ===
env_dir_prefix = System.get_env("RELEASE_ROOT") || Path.expand(".")

Dotenvy.source!([
  Path.absname(".env", env_dir_prefix),
  System.get_env()
])

# === SHARED CONFIGURATION ===
jwt_secret = env!("SUPABASE_JWT_SECRET", :string!)
config :tempi, :supabase_jwt_secret, jwt_secret
config :tempi, env: config_env()

# Always enable server in release mode
if env!("PHX_SERVER", :boolean, false) do
  config :tempi, TempiWeb.Endpoint, server: true
end

# === PRODUCTION-SPECIFIC CONFIGURATION ===
if config_env() == :prod do
  # Database configuration
  database_url = env!("DATABASE_URL", :string!)

  maybe_ipv6 = if env!("ECTO_IPV6", :boolean, false), do: [:inet6], else: []

  config :tempi, Tempi.Repo,
    url: database_url,
    pool_size: env!("POOL_SIZE", :integer, 10),
    socket_options: maybe_ipv6,
    ssl: [
      verify: :verify_peer,
      cacertfile: "/app/ssl/supabase-ca.pem",
      server_name_indication: ~c"db.dwmjxflsgedzlazsfowu.supabase.co"
    ]

  # Endpoint configuration
  secret_key_base = env!("SECRET_KEY_BASE", :string!)
  host = env!("PHX_HOST", :string, "tempi.fly.dev")
  port = env!("PORT", :integer, 8080)

  config :tempi, TempiWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [
      # Bind to all IPv4 interfaces
      ip: {0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base

  # Additional services

  config :tempi, :dns_cluster_query, env!("DNS_CLUSTER_QUERY", :string, nil)
end
