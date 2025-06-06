defmodule Tempi.Jobs.Job do
  @moduledoc "Job schema with details, status, employer, and address."
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  use Tempi.Encoders.CamelCaseJsonEncoder,
    only: [:id, :title, :description, :start_date, :end_date, :pay_rate, :status, :address]

  schema "jobs" do
    field :title, :string
    field :description, :string
    field :start_date, :utc_datetime
    field :end_date, :utc_datetime
    field :pay_rate, :decimal
    field :pay_type, Ecto.Enum, values: [:daily, :hourly]
    field :status, Ecto.Enum, values: [:open, :filled, :completed, :canceled], default: :open

    belongs_to :employer_profile, Tempi.Profiles.EmployerProfile
    belongs_to :address, Tempi.Locations.Address

    has_many :job_applications, Tempi.Jobs.JobApplication
    has_many :worker_profiles, through: [:job_applications, :worker_profile]

    timestamps(type: :utc_datetime)
  end

  @doc """
  Changeset for creating and updating jobs
  """
  def changeset(job, attrs) do
    job
    |> cast(attrs, [
      :title,
      :description,
      :start_date,
      :end_date,
      :pay_rate,
      :pay_type,
      :status,
      :employer_profile_id,
      :address_id
    ])
    |> validate_required([:title, :start_date, :end_date, :employer_profile_id, :address_id, :pay_rate, :pay_type])
    |> validate_datetime_range()
    |> foreign_key_constraint(:employer_profile_id)
    |> foreign_key_constraint(:address_id)
  end

  # Validate that end_date is after start_date
  defp validate_datetime_range(changeset) do
    start_date = get_field(changeset, :start_date)
    end_date = get_field(changeset, :end_date)

    if start_date && end_date && DateTime.compare(end_date, start_date) == :lt do
      add_error(changeset, :end_date, "must be after start_date")
    else
      changeset
    end
  end
end
