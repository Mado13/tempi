# lib/temporah/accounts.ex
defmodule Temporah.Contexts.Accounts do
  @moduledoc """
  The Accounts context.
  """

  import Ecto.Query, warn: false
  alias Temporah.Schemas.Accounts.{User, UserToken, UserNotifier, Account}
  alias Temporah.Schemas.Profiles.{WorkerProfile, EmployerProfile}
  alias Temporah.Utils.PhoneUtils
  alias Temporah.Repo
  alias Ecto.Multi

  ## Database getters

  def get_user_by_phone_number(phone_number) when is_binary(phone_number) do
    case PhoneUtils.normalize(phone_number) do
      {:ok, normalized_number} ->
        Repo.get_by(User, phone_number: normalized_number)
        |> Repo.preload(:account)

      {:error, _reason} ->
        nil
    end
  end

  def get_user!(id) do
    Repo.get!(User, id)
  end

  ## User registration

  def register_user(attrs) do
    %User{}
    |> User.registration_changeset(attrs)
    |> Repo.insert()
  end

  def get_account_for_user(user) do
    Repo.preload(user, :account).account
  end

  def create_account_for_user(user, attrs) do
    Multi.new()
    |> Multi.insert(:account, Account.changeset(%Account{}, Map.put(attrs, :user_id, user.id)))
    |> Multi.run(:profiles, fn _repo, %{account: account} ->
      case account.type do
        "worker" ->
          %WorkerProfile{}
          |> WorkerProfile.changeset(%{account_id: account.id})
          |> Repo.insert()
          |> case do
            {:ok, worker_profile} -> {:ok, %{worker: worker_profile}}
            error -> error
          end

        "employer" ->
          %EmployerProfile{}
          |> EmployerProfile.changeset(%{account_id: account.id})
          |> Repo.insert()
          |> case do
            {:ok, employer_profile} -> {:ok, %{employer: employer_profile}}
            error -> error
          end

        "both" ->
          with {:ok, worker_profile} <-
                 %WorkerProfile{}
                 |> WorkerProfile.changeset(%{account_id: account.id})
                 |> Repo.insert(),
               {:ok, employer_profile} <-
                 %EmployerProfile{}
                 |> EmployerProfile.changeset(%{account_id: account.id})
                 |> Repo.insert() do
            {:ok, %{worker: worker_profile, employer: employer_profile}}
          end

        _ ->
          {:error, "Invalid account type"}
      end
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{account: account, profiles: profiles}} -> {:ok, %{account: account, profiles: profiles}}
      {:error, _op, error, _changes} -> {:error, error}
    end
  end

  def change_user_registration(%User{} = user, attrs \\ %{}) do
    User.registration_changeset(user, attrs)
  end

  ## Session

  def generate_user_session_token(user) do
    {token, user_token} = UserToken.build_session_token(user)
    Repo.insert!(user_token)
    token
  end

  def get_user_by_session_token(token) do
    {:ok, query} = UserToken.verify_session_token_query(token)
    Repo.one(query)
  end

  def delete_user_session_token(token) do
    Repo.delete_all(UserToken.by_token_and_context_query(token, "session"))
    :ok
  end

  def deliver_user_confirmation_instructions(%User{} = user, confirmation_url_fun)
      when is_function(confirmation_url_fun, 1) do
    if user.confirmed_at do
      {:error, :already_confirmed}
    else
      # Rename to build_phone_token?
      {encoded_token, user_token} = UserToken.build_email_token(user, "confirm")
      Repo.insert!(user_token)
      UserNotifier.deliver_confirmation_instructions(user, confirmation_url_fun.(encoded_token))
    end
  end

  def confirm_user(token) do
    # Rename to verify_phone_token_query?
    with {:ok, query} <- UserToken.verify_email_token_query(token, "confirm"),
         %User{} = user <- Repo.one(query),
         {:ok, %{user: user}} <- Repo.transaction(confirm_user_multi(user)) do
      {:ok, user}
    else
      _ -> :error
    end
  end

  defp confirm_user_multi(user) do
    Ecto.Multi.new()
    |> Ecto.Multi.update(:user, User.confirm_changeset(user))
    |> Ecto.Multi.delete_all(:tokens, UserToken.by_user_and_contexts_query(user, ["confirm"]))
  end
end
