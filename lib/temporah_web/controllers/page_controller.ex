defmodule TemporahWeb.PageController do
  use TemporahWeb, :controller

  def home(conn, _params) do
    conn
    |> render_inertia("Dashboard")
  end
end
