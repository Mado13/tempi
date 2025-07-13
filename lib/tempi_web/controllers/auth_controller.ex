defmodule TempiWeb.AuthController do
  use TempiWeb, :controller

  alias Tempi.{Accounts, AuthCodeServer, RateLimit, Repo}
  alias Tempi.Accounts.PhoneHelper

  action_fallback TempiWeb.FallbackController

  require Logger

  @doc """
  POST /api/auth/send_code

  Expects: %{"phone_number" => "+1234567890"}
  Returns: %{"message" => "Code sent", "code" => "123456", "expires_in_minutes" => 5}
  """
  def send_code(conn, %{"phone_number" => phone_number}) do
    with {:ok, normalized_phone} <- PhoneHelper.normalize_phone_number(phone_number),
         {:ok, _} <- check_rate_limit("send_code:#{normalized_phone}", 300_000, 3) do
      code = AuthCodeServer.generate_code(normalized_phone)

      json(conn, %{
        message: "Authentication code generated",
        code: code,
        expires_in_minutes: 5
      })
    end
  end

  def send_code(_conn, _params) do
    {:error, :missing_params, "phone_number"}
  end

  @doc """
  POST /api/auth/verify_code

  Expects: %{"phone_number" => "+1234567890", "code" => "123456"}
  Returns: %{"token" => "bearer_token", "user" => %{...}} or error
  """
  def verify_code(conn, %{"phone_number" => phone_number, "code" => code}) do
    with {:ok, normalized_phone} <- PhoneHelper.normalize_phone_number(phone_number),
         {:ok, _} <- check_rate_limit("verify_code:#{normalized_phone}", 600_000, 5),
         {:ok, :valid} <- AuthCodeServer.verify_code(normalized_phone, code) do
      user =
        Accounts.find_or_create_user_by_phone(phone_number)
        |> Repo.preload([:worker_profile, :employer_profile])

      token = Accounts.create_user_api_token(user)

      render(conn, :user_with_token, user: user, token: token)
    end
  end

  def verify_code(_conn, _params) do
    {:error, :missing_params, "phone_number and code"}
  end

  @doc """
  DELETE /api/auth/logout

  Deletes the current bearer token (requires bearer token)
  """
  def logout(conn, _params) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         {:ok, _deleted_token} <- Accounts.delete_user_api_token(token) do
      json(conn, %{message: "Successfully logged out"})
    else
      [] -> {:error, :missing_auth_header}
      :error -> {:error, :logout_failed}
    end
  end

  defp check_rate_limit(bucket_id, window_ms, limit) do
    case RateLimit.hit(bucket_id, window_ms, limit) do
      {:allow, _count} -> {:ok, :allowed}
      {:deny, _timeout} -> {:error, :rate_limit, div(window_ms, 1000)}
    end
  end
end
