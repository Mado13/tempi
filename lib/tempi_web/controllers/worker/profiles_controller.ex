defmodule TempiWeb.Worker.ProfilesController do
  use TempiWeb, :controller

  def show(conn, params) do
    user = conn.assigns.current_user

    conn
    |> render_inertia("worker/Profile")
  end

  def update(conn, params) do
  end
end
