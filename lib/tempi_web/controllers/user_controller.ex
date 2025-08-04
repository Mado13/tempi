defmodule TempiWeb.UserController do
  use TempiWeb, :controller

  alias Tempi.{Accounts, Repo, Profiles}

  @doc "GET /api/user/me"
  def show(conn, _params) do
    user = current_user(conn)
    render_user_with_profiles(conn, user)
  end

  @doc "GET /api/user/me/worker-profile"
  def show_worker_profile(conn, _params) do
    user = current_user(conn)

    case Repo.preload(user, :worker_profile).worker_profile do
      nil -> {:error, :not_found}
      profile -> render(conn, :show, worker_profile: profile)
    end
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

  @doc "PATCH /api/user/me/worker-profile/:id"
  def update_worker_profile(conn, params) do
    user = current_user(conn)

    with {:ok, worker_profile} <- Profiles.get_worker_profile_for_user(user),
         {:ok, _updated_profile} <- Profiles.update_worker_profile(worker_profile, params) do
      render_user_with_profiles(conn, user)
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

  defp render_user_with_profiles(conn, user) do
    preloaded_user =
      Repo.preload(user, [:worker_profile, employer_profile: :company_profiles])

    render(conn, :current_user, user: preloaded_user)
  end
end
