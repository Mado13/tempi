defmodule Tempi.Profiles.EmployerProfile do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @derive {Jason.Encoder, except: [:__meta__, :user, :jobs]}

  schema "employer_profiles" do
    field :company_name, :string
    field :business_type, :string
    field :description, :string
    field :location, :string

    belongs_to :user, Tempi.Accounts.User
    has_many :jobs, Tempi.Job

    timestamps(type: :utc_datetime)
  end

  def changeset(employer_profile, attrs) do
    employer_profile
    |> cast(attrs, [:company_name, :business_type, :description, :location, :user_id])
    |> validate_required([:user_id])
    |> unique_constraint(:user_id)
  end
end
