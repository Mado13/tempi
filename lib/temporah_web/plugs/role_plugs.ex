defmodule TemporahWeb.RolePlugs do
  import Plug.Conn
  import Phoenix.Controller

  def require_worker_role(conn, _opts) do
    user = conn.assigns.current_user

    if user.worker do
      conn
    else
      conn
      |> put_flash(:error, "You must be a worker to access this page.")
      |> redirect(to: "/")
      |> halt()
    end
  end

  def require_employer_role(conn, _opts) do
    user = conn.assigns.current_user

    if user.employer do
      conn
    else
      conn
      |> put_flash(:error, "You must be an employer to access this page.")
      |> redirect(to: "/")
      |> halt()
    end
  end

  def redirect_root_based_on_role(conn, _opts) do
    if conn.request_path == "/" do
      if conn.assigns[:current_user] do
        active_role = get_session(conn, :active_role)
        redirect_path = redirect_path_for_role(active_role)

        conn
        |> redirect(to: redirect_path)
        |> halt()
      else
        conn
      end
    else
      conn
    end
  end

  def redirect_path_for_role(role) do
    case role do
      "worker" -> "/worker/agenda"
      "employer" -> "/employer/agenda"
      _ -> "/choose-role"
    end
  end
end
