defmodule Tempi.Profiles.CompanyProfile do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "company_profiles" do
    field :name, :string
    field :business_number, :string
    field :logo_key, :string

    belongs_to :address, Tempi.Address
    belongs_to :employer_profile, Tempi.Profiles.EmployerProfile

    # A company will eventually have many jobs and many job agreements.
    # We will add those associations later when we define those schemas.

    timestamps()
  end

  @doc """
  Builds a changeset for a company profile.
  """
  def changeset(company_profile, attrs) do
    company_profile
    |> cast(attrs, [:name, :business_number, :logo_key, :address_id, :employer_profile_id])
    |> validate_required([:name, :employer_profile_id, :business_number])
    |> validate_length(:name, min: 2, max: 255)
    |> unique_constraint(:business_number)
    |> foreign_key_constraint(:address_id)
    |> foreign_key_constraint(:employer_profile_id)
    |> assoc_constraint(:employer_profile)
  end
end
