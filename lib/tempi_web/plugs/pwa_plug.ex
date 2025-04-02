defmodule TempiWeb.PwaPlugs do
  import Plug.Conn
  import Phoenix.Controller

  def require_pwa(conn, _opts) do
    case conn.cookies["pwa_installed"] do
      # Cookie present, let the request through
      "true" ->
        conn

      _ ->
        # No cookie, redirect to install
        conn
        |> redirect(to: "/install")
        |> halt()
    end
  end
end
