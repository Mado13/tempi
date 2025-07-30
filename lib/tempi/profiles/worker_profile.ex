defmodule Tempi.Profiles.WorkerProfile do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @availabilities [:full_time, :part_time, :contract]

  @derive {Jason.Encoder,
           except: [
             :__meta__,
             :user,
             :job_applications,
             :worker_favorite_jobs,
             :favorite_jobs
           ]}

  schema "worker_profiles" do
    field :full_name, :string
    field :skills, {:array, :string}, default: []
    field :experience_years, :integer
    field :bio, :string
    field :hourly_rate, :decimal
    field :availability, Ecto.Enum, values: @availabilities

    belongs_to :user, Tempi.Accounts.User

    has_many :job_applications, Tempi.JobApplication
    has_many :worker_favorite_jobs, Tempi.WorkerFavoriteJob

    many_to_many :favorite_jobs, Tempi.Job, join_through: Tempi.WorkerFavoriteJob

    timestamps(type: :utc_datetime)
  end

  def changeset(worker_profile, attrs) do
    worker_profile
    |> cast(attrs, [
      :full_name,
      :skills,
      :experience_years,
      :bio,
      :hourly_rate,
      :availability,
      :user_id
    ])
    |> validate_required([:user_id])
    |> validate_number(:experience_years, greater_than_or_equal_to: 0)
    |> validate_number(:hourly_rate, greater_than: 0)
    |> unique_constraint(:user_id)
  end
end
