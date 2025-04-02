defmodule Temporah.Schemas.Profiles.WorkerProfile do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @derive {Jason.Encoder, only: [:id, :full_name, :account_id, :updated_at]}
  schema "worker_profiles" do
    field :full_name, :string
    belongs_to :account, Temporah.Accounts.Account
    timestamps(updated_at: :updated_at, inserted_at: false)
  end

  def changeset(worker_profile, attrs) do
    worker_profile
    |> cast(attrs, [:account_id, :full_name])
    |> validate_required([:account_id])
    |> foreign_key_constraint(:account_id)
    |> unique_constraint(:account_id)
  end
end
