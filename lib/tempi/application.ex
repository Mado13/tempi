defmodule Tempi.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application
  @env Mix.env()

  @impl true
  def start(_type, _args) do
    import Dotenvy
    source!([".env", ".#{@env}.env", System.get_env()])

    credentials =
      "GOOGLE_APPLICATION_CREDENTIALS_JSON"
      |> Dotenvy.env!(:string!)
      |> Jason.decode!()

    source = {:service_account, credentials}

    children = [
      TempiWeb.Telemetry,
      Tempi.Repo,
      {DNSCluster, query: Application.get_env(:tempi, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Tempi.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: Tempi.Finch},
      # Start a worker by calling: Tempi.Worker.start_link(arg)
      # {Tempi.Worker, arg},
      # Start to serve requests, typically the last entry
      TempiWeb.Endpoint,
      Tempi.AuthCodeServer,
      Tempi.Supabase.Client,
      {Tempi.RateLimit, clean_period: :timer.minutes(10)},
      {Goth, name: Tempi.Goth, source: source},
      Tempi.FCM
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Tempi.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    TempiWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
