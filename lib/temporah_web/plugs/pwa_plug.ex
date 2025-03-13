defmodule TemporahWeb.PwaPlugs do
  import Plug.Conn
  import Phoenix.Controller

  def require_pwa(conn, _opts) do
    # Check for the cookie
    pwa_installed_cookie = conn.cookies["pwa_installed"]

    # Also look for a special query param that could be set via JS redirect
    # if cookies fail but localStorage works
    pwa_param = conn.query_params["pwa_installed"]

    cond do
      # Skip check for installation page itself
      String.starts_with?(conn.request_path, "/install") ||
          String.starts_with?(conn.request_path, "/assets") ->
        conn

      # PWA is installed according to cookie or param
      pwa_installed_cookie == "true" || pwa_param == "true" ->
        conn

      # Default case: redirect to install
      true ->
        conn
        |> redirect(to: "/install")
        |> halt()
    end
  end
end
