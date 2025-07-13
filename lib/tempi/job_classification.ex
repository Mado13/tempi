# lib/tempi/job_classification.ex
defmodule Tempi.JobClassification do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "job_classifications" do
    field :classification_code, :string

    belongs_to :job, Tempi.Job

    timestamps()
  end

  def changeset(job_classification, attrs) do
    job_classification
    |> cast(attrs, [:classification_code, :job_id])
    |> validate_required([:classification_code, :job_id])
  end
end
