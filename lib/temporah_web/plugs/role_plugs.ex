defmodule TemporahWeb.RolePlugs do
  import Plug.Conn
  import Phoenix.Controller

  def require_employee_role(conn, _opts) do
    user = conn.assigns.current_user

    if user.role == "employee" do
      conn
    else
      conn
      |> put_flash(:error, "You must be an employee to access this page.")
      |> redirect(to: "/")
      |> halt()
    end
  end

  def require_employer_role(conn, _opts) do
    user = conn.assigns.current_user

    if user.role == "employer" do
      conn
    else
      conn
      |> put_flash(:error, "You must be an employer to access this page.")
      |> redirect(to: "/")
      |> halt()
    end
  end
end
