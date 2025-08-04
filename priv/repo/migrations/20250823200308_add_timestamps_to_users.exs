defmodule Tempi.Repo.Migrations.AddTimestampsToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :last_dashboard_visit_at, :utc_datetime
      add :last_active_at, :utc_datetime
    end
  end
end
