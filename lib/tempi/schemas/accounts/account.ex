defmodule Tempi.Schemas.Accounts.Account do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @derive {Jason.Encoder, only: [:id, :type, :worker_profile, :employer_profile]}
  schema "accounts" do
    field :type, :string
    belongs_to :user, Tempi.Schemas.Accounts.User, type: :binary_id
    has_one :worker_profile, Tempi.Schemas.Profiles.WorkerProfile
    has_one :employer_profile, Tempi.Schemas.Profiles.EmployerProfile
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
