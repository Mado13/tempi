defmodule Temporah.Repo do
  use Ecto.Repo,
    otp_app: :temporah,
    adapter: Ecto.Adapters.Postgres
end
