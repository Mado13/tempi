defmodule Temporah.Contexts.Accounts.Account do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "accounts" do
    field :type, :string
    belongs_to :user, Temporah.Contexts.Accounts.User, type: :binary_id
    # Still has_one due to unique constraint
    has_one :worker_profile, Temporah.Contexts.Profiles.WorkerProfile
    has_one :employer_profile, Temporah.Contexts.Profiles.EmployerProfile
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
