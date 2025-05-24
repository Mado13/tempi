defmodule TempiWeb.AuthController do
  use TempiWeb, :controller

  import Tempi.Utils.I18n

  alias Tempi.Repo
  alias Tempi.Accounts
  alias Tempi.Utils.Verification
  alias TempiWeb.UserAuth
  alias TempiWeb.UserRole

  def register_form(conn, _params), do: conn |> render_inertia("auth/Register")
  def login_form(conn, _params), do: conn |> render_inertia("auth/Login")

  def request_login_code(conn, %{"phone_number" => phone_number}),
    do: request_verification_code(conn, phone_number, ~p"/login/verify")

  def request_register_code(conn, %{"phone_number" => phone_number}),
    do: request_verification_code(conn, phone_number, ~p"/register/verify")

  def login_verify_form(conn, _params), do: verify_form(conn, "/login/verify")
  def register_verify_form(conn, _params), do: verify_form(conn, "/register/verify")

  def toggle_role(conn, _params) do
    user = conn.assigns.current_user

    case UserRole.toggle_role(conn, user) do
      {:ok, conn} ->
        active_role = UserRole.get_active_role(conn)
        redirect_path = UserRole.get_redirect_path(active_role)

        conn
        |> redirect(to: redirect_path)

      {:error, _message} ->
        conn
        |> redirect(to: "/")
    end
  end

  def verify_login_code(conn, %{"phone_number" => phone_number, "code" => code}) do
    case Accounts.get_user_by_phone_number(phone_number) do
      nil ->
        render_verify_error(
          conn,
          phone_number,
          %{"code" => t("errors", "verification_code_invalid")},
          "/login/verify"
        )

      user ->
        case Verification.verify_code(phone_number, code) do
          {:ok, "verification_success"} ->
            complete_auth(conn, user)

          {:error, errors} ->
            render_verify_error(conn, phone_number, errors, "/login/verify")
        end
    end
  end

  def verify_register_code(conn, %{"phone_number" => phone_number, "code" => code}) do
    case Verification.verify_code(phone_number, code) do
      {:ok, "verification_success"} ->
        case Accounts.register_user(%{phone_number: phone_number}) do
          {:ok, user} ->
            complete_auth(conn, user)

          {:error, _changeset} ->
            error_message = %{"registration" => "Unable to complete registration. Please try again or contact support."}
            render_verify_error(conn, phone_number, error_message, "/register/verify")
        end

      {:error, errors} ->
        render_verify_error(conn, phone_number, errors, "/register/verify")
    end
  end

  def role_form(conn, _params) do
    user = conn.assigns.current_user

    case Accounts.get_account_for_user(user) do
      nil ->
        conn |> render_inertia("auth/ChooseRole")

      _account ->
        conn
        |> redirect(to: TempiWeb.UserAuth.signed_in_path(conn))
    end
  end

  def set_role(conn, %{"role" => role}) when role in ["worker", "employer", "both"] do
    user = conn.assigns.current_user

    case Accounts.create_account_for_user(user, %{type: role}) do
      {:ok, %{account: _account, profiles: _profiles}} ->
        conn
        |> UserRole.set_active_role(role)
        |> redirect(to: TempiWeb.UserAuth.signed_in_path(conn))

      {:error, _changeset} ->
        conn
        |> assign_errors("account_creation_failed")
        |> render_inertia("auth/ChooseRole")
    end
  end

  def delete(conn, _params), do: conn |> put_flash(:info, "Logged out successfully.") |> UserAuth.log_out_user()

  # Private

  defp request_verification_code(conn, phone_number, redirect_path) do
    code = Verification.generate_code(phone_number)
    IO.inspect(code, label: "Generated Code")

    case Mix.env() do
      :dev ->
        conn
        |> put_session(:phone_number, phone_number)
        |> redirect(to: redirect_path)

      _ ->
        case Verification.send_verification_code(code) do
          {:ok, _message} ->
            conn
            |> put_session(:phone_number, phone_number)
            |> redirect(to: ~p"/users/code")

          {:error, _message, _error_code} ->
            conn
            |> assign_errors("Failed to send verification code. Please try again.")
            |> render_inertia("auth/Login")
        end
    end
  end

  defp verify_form(conn, post_path) do
    phone_number = get_session(conn, :phone_number)

    conn
    |> assign_prop(:post_path, post_path)
    |> assign_prop(:phone_number, phone_number)
    |> render_inertia("auth/VerifyToken")
  end

  defp render_verify_error(conn, phone_number, errors, post_path) do
    conn
    |> assign_prop(:phone_number, phone_number)
    |> assign_prop(:post_path, post_path)
    |> assign_errors(errors)
    |> render_inertia("auth/VerifyToken")
  end

  defp complete_auth(conn, user) do
    user = Repo.preload(user, :account)
    active_role = UserRole.determine_active_role(user)

    conn
    |> UserAuth.log_in_user(user, %{remember: true})
    |> delete_session(:phone_number)
    |> UserRole.set_active_role(active_role)
    |> redirect(to: TempiWeb.UserAuth.signed_in_path(conn))
  end
end
