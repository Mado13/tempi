defmodule TempiWeb.UserRole do
  @moduledoc """
  Manages user role selection, persistence, and redirection logic.
  """

  import Plug.Conn

  @default_role "worker"

  def set_active_role(conn, role) when role in ["worker", "employer"] do
    put_session(conn, :active_role, role)
  end

  def set_active_role(conn, "both") do
    put_session(conn, :active_role, @default_role)
  end

  def set_active_role(conn, _) do
    put_session(conn, :active_role, nil)
  end

  def determine_active_role(user) do
    account_type = get_account_type(user)

    case account_type do
      "both" -> @default_role
      nil -> nil
      type -> type
    end
  end

  def get_account_type(user) do
    if user && user.account, do: user.account.type, else: nil
  end

  def get_redirect_path(active_role) do
    case active_role do
      "worker" -> "/worker/agenda"
      "employer" -> "/employer/agenda"
      _ -> "/choose-role"
    end
  end

  def toggle_role(conn, user) do
    account_type = get_account_type(user)

    if account_type == "both" do
      current_role = get_session(conn, :active_role)
      new_role = if current_role == "worker", do: "employer", else: "worker"
      {:ok, put_session(conn, :active_role, new_role)}
    else
      {:error, "User does not have multiple roles"}
    end
  end

  def get_active_role(conn) do
    get_session(conn, :active_role)
  end
end
