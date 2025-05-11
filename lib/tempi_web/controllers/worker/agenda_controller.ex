defmodule TempiWeb.Worker.AgendaController do
  use TempiWeb, :controller

  alias Tempi.Contexts.Jobs.Jobs

  def index(conn, params) do
    cursor = params["cursor"]
    limit = if params["limit"], do: String.to_integer(params["limit"]), else: nil

    {jobs, next_cursor} = Jobs.list_jobs(cursor, limit)

    conn
    |> render_inertia("Worker/Agenda", %{
      jobs: jobs,
      next_cursor: next_cursor
    })
  end
end
