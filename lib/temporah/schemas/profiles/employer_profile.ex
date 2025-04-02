defmodule Temporah.Schemas.Profiles.EmployerProfile do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @derive {Jason.Encoder, only: [:id, :account_id, :updated_at]}
  schema "employer_profiles" do
    field :company_name, :string
    belongs_to :account, Temporah.Schemas.Accounts.Account
    timestamps(updated_at: :updated_at, inserted_at: false)
  end

  def changeset(employer_profile, attrs) do
    employer_profile
    |> cast(attrs, [:account_id, :company_name])
    |> validate_required([:account_id])
    |> foreign_key_constraint(:account_id)
    |> unique_constraint(:account_id)
  end
end
