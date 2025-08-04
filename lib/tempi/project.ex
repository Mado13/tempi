defmodule Tempi.Project do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @statuses [:published, :in_progress, :completed, :canceled, :archived]

  schema "projects" do
    field :name, :string
    field :start_date, :date
    field :end_date, :date
    field :notes, :string
    field :status, Ecto.Enum, values: @statuses, default: :published
    field :meta, :map, default: %{}

    belongs_to :address, Tempi.Address
    belongs_to :employer_profile, Tempi.Profiles.EmployerProfile
    belongs_to :company_profile, Tempi.Profiles.CompanyProfile

    has_many :positions, Tempi.ProjectPosition, on_delete: :delete_all

    timestamps()
  end

  def changeset(project, attrs) do
    project
    |> cast(attrs, [
      :name,
      :start_date,
      :end_date,
      :notes,
      :status,
      :address_id,
      :employer_profile_id,
      :company_profile_id,
      :meta
    ])
    |> validate_required([
      :name,
      :start_date,
      :end_date,
      :employer_profile_id,
      :company_profile_id
    ])
    |> validate_date_range()
  end

  defp validate_date_range(changeset) do
    start_date = get_field(changeset, :start_date)
    end_date = get_field(changeset, :end_date)

    if start_date && end_date && Date.compare(end_date, start_date) == :lt do
      add_error(changeset, :end_date, "cannot be before start date")
    else
      changeset
    end
  end
end
