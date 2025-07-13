import Config

config :tempi, env: config_env()

# Always enable server in release mode
if System.get_env("PHX_SERVER") do
  config :tempi, TempiWeb.Endpoint, server: true
end

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      """

  maybe_ipv6 = if System.get_env("ECTO_IPV6") in ~w(true 1), do: [:inet6], else: []

  config :tempi, Tempi.Repo,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
    socket_options: maybe_ipv6,
    ssl: [
      verify: :verify_peer,
      cacertfile: "/app/ssl/supabase-ca.pem",
      server_name_indication: ~c"db.dwmjxflsgedzlazsfowu.supabase.co"
    ]

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  host = System.get_env("PHX_HOST") || "tempi.fly.dev"
  port = String.to_integer(System.get_env("PORT") || "8080")

  config :tempi, :dns_cluster_query, System.get_env("DNS_CLUSTER_QUERY")

  config :tempi, TempiWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [
      # Bind to all IPv4 interfaces
      ip: {0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base

  # If you're using email authentication, configure your mailer here
  # config :tempi, Tempi.Mailer,
  #   adapter: Swoosh.Adapters.Postmark,
  #   api_key: System.get_env("POSTMARK_API_KEY")
end
