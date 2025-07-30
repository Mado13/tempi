defmodule Tempi.Repo.Migrations.AddCompanyAndCountersToJobs do
  use Ecto.Migration

  def change do
    alter table(:jobs) do
      add :company_profile_id, references(:company_profiles, type: :binary_id)

      add :applications_count, :integer, null: false, default: 0
      add :favorites_count, :integer, null: false, default: 0
    end

    create index(:jobs, [:company_profile_id])
  end
end
