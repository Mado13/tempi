import Config
import Dotenvy

source!([
  ".env",
  ".#{config_env()}.env",
  System.get_env()
])

config :tempi, :supabase_jwt_secret, Dotenvy.env!("SUPABASE_JWT_SECRET", :string!)

config :tempi, Tempi.Supabase.Client,
  base_url: Dotenvy.env!("SUPABASE_URL", :string!),
  api_key: Dotenvy.env!("SUPABASE_SECRET_KEY", :string!)

config :tempi, env: config_env()

# The function name is env!/3 for optional values
if Dotenvy.env!("PHX_SERVER", :boolean, false) do
  config :tempi, TempiWeb.Endpoint, server: true
end

# === PRODUCTION-SPECIFIC CONFIGURATION ===
if config_env() == :prod do
  # Database configuration
  database_url = Dotenvy.env!("DATABASE_URL", :string!)
  ecto_ipv6? = Dotenvy.env!("ECTO_IPV6", :boolean, false)
  maybe_ipv6 = if ecto_ipv6?, do: [:inet6], else: []

  config :tempi, Tempi.Repo,
    url: database_url,
    pool_size: Dotenvy.env!("POOL_SIZE", :integer, 10),
    socket_options: maybe_ipv6,
    ssl: [
      verify: :verify_peer,
      cacertfile: "/app/ssl/supabase-ca.pem",
      server_name_indication: ~c"db.dwmjxflsgedzlazsfowu.supabase.co"
    ]

  # Endpoint configuration
  secret_key_base = Dotenvy.env!("SECRET_KEY_BASE", :string!)
  host = Dotenvy.env!("PHX_HOST", :string, "tempi.fly.dev")
  port = Dotenvy.env!("PORT", :integer, 8080)

  config :tempi, TempiWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [ip: {0, 0, 0, 0}, port: port],
    secret_key_base: secret_key_base

  # Additional services
  # Use a default of `nil` for an optional string variable
  config :tempi, :dns_cluster_query, Dotenvy.env!("DNS_CLUSTER_QUERY", :string, nil)
end
