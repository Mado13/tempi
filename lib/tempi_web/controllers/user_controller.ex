defmodule TempiWeb.UserController do
  use TempiWeb, :controller

  alias Tempi.{Accounts, Repo}

  @doc "GET /api/user/me"
  def show(conn, _params) do
    user = current_user(conn)
    render_user_with_profiles(conn, user)
  end

  @doc "PATCH /api/user/me"
  def update(conn, %{"user" => user_params}) do
    user = current_user(conn)

    with {:ok, updated_user} <- Accounts.update_user(user, user_params) do
      render_user_with_profiles(conn, updated_user)
    else
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(:changeset_errors, changeset: changeset)
    end
  end

  @doc "POST /api/user/profiles"
  def create_profile(conn, %{"role" => role}) do
    with {:ok, updated_user} <- Accounts.create_user_profile(current_user(conn), role) do
      render_user_with_profiles(conn, updated_user)
    else
      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render(:changeset_errors, changeset: changeset)
    end
  end

  def create_role(conn, %{"current_role" => role}) do
    with {:ok, updated_user} <- Accounts.create_user_profile(current_user(conn), role) do
      updated_user =
        Repo.preload(updated_user, [:worker_profile, employer_profile: :company_profiles])

      render(conn, :current_user, user: updated_user)
    end
  end

  def update_role(conn, %{"current_role" => new_role}) do
    user = current_user(conn)

    with {:ok, updated_user} <- Accounts.update_user_role(user, %{current_role: new_role}) do
      preloaded_user =
        Repo.preload(updated_user, [:worker_profile, employer_profile: :company_profiles])

      render(conn, :current_user, user: preloaded_user)
    end
  end

  def current_user(conn, _params) do
    user = current_user(conn)

    render(conn, :current_user, user: user)
  end

  defp render_user_with_profiles(conn, user) do
    preloaded_user =
      Repo.preload(user, [:worker_profile, employer_profile: :company_profiles])

    render(conn, :current_user, user: preloaded_user)
  end
end
