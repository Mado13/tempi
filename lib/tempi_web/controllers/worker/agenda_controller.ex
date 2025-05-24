defmodule TempiWeb.Worker.AgendaController do
  use TempiWeb, :controller
  alias Tempi.Jobs

  def index(conn, _params) do
    conn |> render_inertia("worker/Agenda")
  end
end
