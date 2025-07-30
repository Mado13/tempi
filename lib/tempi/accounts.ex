defmodule Tempi.Accounts do
  @moduledoc """
  The Accounts context for phone-based authentication.
  """

  import Ecto.Query, warn: false
  alias Ecto.Multi
  alias Tempi.Repo
  alias Tempi.Accounts.{User, UserToken, PhoneHelper}
  alias Tempi.Profiles.{WorkerProfile, EmployerProfile}

  ## User functions

  @doc """
  Returns the list of users.
  """
  def list_users do
    Repo.all(User)
  end

  @doc """
  Gets a single user.
  Raises `Ecto.NoResultsError` if the User does not exist.
  """
  def get_user!(id), do: Repo.get!(User, id)

  @doc """
  Gets a user by phone number.
  Returns `nil` if no user exists with that phone number.
  """

  def get_user_by_phone_number(phone_number) when is_binary(phone_number) do
    case PhoneHelper.normalize_phone_number(phone_number) do
      {:ok, normalized} ->
        Repo.get_by(User, phone_number: normalized)

      {:error, _} ->
        nil
    end
  end

  @doc """
  Creates a user.
  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a user.
  """
  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a user.
  """
  def delete_user(%User{} = user) do
    Repo.delete(user)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking user changes.
  """
  def change_user(%User{} = user, attrs \\ %{}) do
    User.changeset(user, attrs)
  end

  ## Phone Authentication functions

  @doc """
  Finds an existing user by phone number or creates a new one.
  """
  def find_or_create_user_by_phone(phone_number) when is_binary(phone_number) do
    case get_user_by_phone_number(phone_number) do
      nil ->
        {:ok, user} = create_user(%{phone_number: phone_number})
        user

      user ->
        user
    end
  end

  ## API Token functions

  @doc """
  Creates a new API token for a user.
  The token returned must be saved somewhere safe.
  This token cannot be recovered from the database.
  """
  def create_user_api_token(user) do
    {encoded_token, user_token} = UserToken.build_api_token(user)
    Repo.insert!(user_token)
    encoded_token
  end

  @doc """
  Fetches the user by API token.
  Returns `{:ok, user}` if the token is valid, `:error` otherwise.
  """
  def fetch_user_by_api_token(token) do
    with {:ok, query} <- UserToken.verify_api_token_query(token),
         %User{} = user <- Repo.one(query) do
      preloaded_user = Repo.preload(user, [:employer_profile, :worker_profile])
      {:ok, preloaded_user}
    else
      _ -> :error
    end
  end

  @doc """
  Deletes a specific API token.
  """
  def delete_user_api_token(token) do
    case Base.url_decode64(token, padding: false) do
      {:ok, decoded_token} ->
        hashed_token = :crypto.hash(:sha256, decoded_token)

        case Repo.get_by(UserToken, token: hashed_token, context: "api-token") do
          %UserToken{} = user_token -> Repo.delete(user_token)
          nil -> :error
        end

      :error ->
        :error
    end
  end

  @doc """
  Deletes all API tokens for the given user.
  """
  def delete_all_user_api_tokens(user) do
    {count, nil} =
      UserToken.by_user_query(user)
      |> where([t], t.context == "api-token")
      |> Repo.delete_all()

    count
  end

  def update_user_role(user, attrs) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
  end

  def create_user_profile(user, "worker") do
    Multi.new()
    |> Multi.insert(
      :worker_profile,
      WorkerProfile.changeset(%WorkerProfile{}, %{user_id: user.id})
    )
    |> Multi.update(:user, User.changeset(user, %{current_role: :worker}))
    |> Repo.transaction()
    |> case do
      {:ok, %{user: updated_user}} -> {:ok, updated_user}
      {:error, _op, changeset, _changes} -> {:error, changeset}
    end
  end

  def create_user_profile(user, "employer") do
    Multi.new()
    |> Multi.insert(
      :employer_profile,
      EmployerProfile.changeset(%EmployerProfile{}, %{user_id: user.id})
    )
    |> Multi.update(:user, User.changeset(user, %{current_role: :employer}))
    |> Repo.transaction()
    |> case do
      {:ok, %{user: updated_user}} -> {:ok, updated_user}
      {:error, _op, changeset, _changes} -> {:error, changeset}
    end
  end

  def create_user_profile(user, "both") do
    Multi.new()
    |> Multi.insert(
      :worker_profile,
      WorkerProfile.changeset(%WorkerProfile{}, %{user_id: user.id})
    )
    |> Multi.insert(
      :employer_profile,
      EmployerProfile.changeset(%EmployerProfile{}, %{user_id: user.id})
    )
    |> Multi.update(:user, User.changeset(user, %{current_role: :worker}))
    |> Repo.transaction()
    |> case do
      {:ok, %{user: updated_user}} -> {:ok, updated_user}
      {:error, _failed_operation, changeset, _changes} -> {:error, changeset}
    end
  end
end
