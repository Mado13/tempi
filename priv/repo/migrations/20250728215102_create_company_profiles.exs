defmodule Tempi.Repo.Migrations.CreateCompanyProfiles do
  use Ecto.Migration

  def change do
    create table(:company_profiles, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string, null: false
      add :business_number, :string, null: false

      add :address_id, references(:addresses, type: :binary_id, on_delete: :nothing)

      add :employer_profile_id,
          references(:employer_profiles, type: :binary_id, on_delete: :delete_all)

      timestamps()
    end

    create index(:company_profiles, [:employer_profile_id])
    create unique_index(:company_profiles, [:business_number])
  end
end
