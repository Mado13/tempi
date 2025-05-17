defmodule Tempi.Accounts.Account do
  @moduledoc """
  Ecto schema for user accounts, supporting worker and employer profiles.

  Associates each account with a user and enforces type constraints.
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @derive {Jason.Encoder, only: [:id, :type, :worker_profile, :employer_profile]}
  schema "accounts" do
    field :type, :string
    belongs_to :user, Tempi.Accounts.User, type: :binary_id
    has_one :worker_profile, Tempi.Profiles.WorkerProfile
    has_one :employer_profile, Tempi.Profiles.EmployerProfile
    timestamps()
  end

  def changeset(account, attrs) do
    account
    |> cast(attrs, [:type, :user_id])
    |> validate_required([:type, :user_id])
    |> validate_inclusion(:type, ["worker", "employer", "both"])
    |> foreign_key_constraint(:user_id)
  end
end
