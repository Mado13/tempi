defmodule Temporah.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      TemporahWeb.Telemetry,
      Temporah.Repo,
      {DNSCluster, query: Application.get_env(:temporah, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Temporah.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: Temporah.Finch},
      # Start a worker by calling: Temporah.Worker.start_link(arg)
      # {Temporah.Worker, arg},
      # Start to serve requests, typically the last entry
      TemporahWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Temporah.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    TemporahWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
