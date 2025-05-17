defmodule Tempi.Repo.Migrations.CreateIsicCatalog do
  use Ecto.Migration

  def change do
    create table(:isic_sections, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :code, :string, null: false
      add :name, :string, null: false

      timestamps()
    end

    create unique_index(:isic_sections, [:code])

    create table(:isic_divisions, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :code, :string, null: false
      add :name, :string, null: false

      add :isic_section_id, references(:isic_sections, type: :binary_id, on_delete: :delete_all),
        null: false

      timestamps()
    end

    create unique_index(:isic_divisions, [:code])

    create table(:isic_groups, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :code, :string, null: false
      add :name, :string, null: false

      add :isic_division_id,
          references(:isic_divisions, type: :binary_id, on_delete: :delete_all),
          null: false

      timestamps()
    end

    create unique_index(:isic_groups, [:code])

    create table(:isic_classes, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :code, :string, null: false
      add :name, :string, null: false

      add :isic_group_id, references(:isic_groups, type: :binary_id, on_delete: :delete_all),
        null: false

      timestamps()
    end

    create unique_index(:isic_classes, [:code])
  end
end
