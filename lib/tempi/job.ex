defmodule Tempi.Job do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @statuses [:open, :filled, :finished, :canceled]
  @rates [:daily, :hourly]

  schema "jobs" do
    field :start_date, :date
    field :end_date, :date
    field :number_of_employees, :integer
    field :rate, :decimal
    field :rate_type, Ecto.Enum, values: @rates, default: :daily
    field :status, Ecto.Enum, values: @statuses, default: :open
    field :applications_count, :integer, default: 0
    field :favorites_count, :integer, default: 0

    belongs_to :address, Tempi.Address
    belongs_to :employer_profile, Tempi.Profiles.EmployerProfile
    belongs_to :company_profile, Tempi.Profiles.CompanyProfile

    has_many :job_classifications, Tempi.JobClassification, on_delete: :delete_all
    has_many :job_applications, Tempi.JobApplication, on_delete: :delete_all
    has_many :worker_favorite_jobs, Tempi.WorkerFavoriteJob, on_delete: :delete_all

    timestamps()
  end

  def changeset(job, attrs) do
    job
    |> cast(attrs, [
      :start_date,
      :end_date,
      :number_of_employees,
      :rate,
      :rate_type,
      :status,
      :address_id,
      :employer_profile_id,
      :company_profile_id
    ])
    |> validate_required([
      :start_date,
      :end_date,
      :number_of_employees,
      :rate,
      :rate_type,
      :address_id,
      :employer_profile_id,
      :company_profile_id
    ])
    |> validate_number(:number_of_employees, greater_than: 0)
    |> validate_number(:rate, greater_than: 0)
    |> validate_inclusion(:rate_type, @rates)
    |> validate_inclusion(:status, @statuses)
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
