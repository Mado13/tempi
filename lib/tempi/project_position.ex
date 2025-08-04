defmodule Tempi.ProjectPosition do
  use Ecto.Schema
  import Ecto.Changeset
  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @statuses [:open, :filled, :closed, :canceled]
  @rates [:daily, :hourly]

  schema "project_positions" do
    belongs_to :project, Tempi.Project
    field :title, :string
    field :rate, :decimal
    field :rate_type, Ecto.Enum, values: @rates, default: :hourly
    field :currency, :string, default: "NIS"
    field :status, Ecto.Enum, values: @statuses, default: :open
    field :number_of_employees, :integer, default: 1
    field :applications_count, :integer, default: 0
    field :classification_code, :string
    field :favorites_count, :integer, default: 0
    field :notes, :string
    timestamps()
  end

  def changeset(position, attrs) do
    position
    |> cast(attrs, [
      :project_id,
      :title,
      :rate,
      :rate_type,
      :currency,
      :number_of_employees,
      :status,
      :applications_count,
      :favorites_count,
      :notes,
      :classification_code
    ])
    |> validate_required([
      :project_id,
      :title,
      :rate,
      :rate_type,
      :currency,
      :number_of_employees,
      :classification_code
    ])
    |> validate_number(:number_of_employees, greater_than: 0)
    |> validate_number(:rate, greater_than: 0)
  end
end
