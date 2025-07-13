defmodule Tempi.Repo do
  use Ecto.Repo,
    otp_app: :tempi,
    adapter: Ecto.Adapters.Postgres
end
