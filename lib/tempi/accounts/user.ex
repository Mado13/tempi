defmodule Tempi.Accounts.User do
  @moduledoc """
  User schema with phone-based authentication and account association.

  Handles phone normalization, confirmation, and links to profiles.
  """
  use Ecto.Schema
  import Ecto.Changeset

  alias Tempi.Utils.PhoneUtils

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @derive {Jason.Encoder, only: [:id, :phone_number, :confirmed_at, :account, :worker, :employer]}
  schema "users" do
    field :phone_number, :string
    field :confirmed_at, :utc_datetime

    has_one :account, Tempi.Accounts.Account

    has_one :worker, through: [:account, :worker_profile]
    has_one :employer, through: [:account, :employer_profile]

    timestamps(type: :utc_datetime)
  end

  @doc """
  Basic changeset for user creation.
  Assumes the phone number is already normalized.
  """
  def registration_changeset(user, attrs) do
    user
    |> cast(attrs, [:phone_number])
    |> normalize_phone_number()
    |> validate_required([:phone_number])
    |> unique_constraint(:phone_number)
  end

  @doc """
  Mark user as confirmed (after phone number is verified).
  """
  def confirm_changeset(user) do
    change(user, confirmed_at: DateTime.utc_now() |> DateTime.truncate(:second))
  end

  # Private

  defp normalize_phone_number(changeset) do
    case get_change(changeset, :phone_number) do
      nil ->
        changeset

      phone_number ->
        case PhoneUtils.normalize(phone_number) do
          {:ok, normalized} -> put_change(changeset, :phone_number, normalized)
          {:error, _} -> changeset
        end
    end
  end
end
