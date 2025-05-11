defmodule Tempi.Contexts.Jobs.Jobs do
  import Ecto.Query
  alias Tempi.Repo
  alias Tempi.Schemas.Jobs.Job

  def create_job(attrs) do
    %Job{}
    |> Job.changeset(attrs)
    |> Repo.insert()
  end

  def update_job(job, attrs) do
    job
    |> Job.changeset(attrs)
    |> Repo.update()
  end

  def list_jobs do
    Repo.all(Job)
  end

  def list_jobs(%DateTime{} = datetime) do
    start_date = Timex.beginning_of_month(datetime)
    end_date = Timex.end_of_month(datetime)

    from(j in Job, where: j.inserted_at >= ^start_date and j.inserted_at <= ^end_date)
    |> Repo.all()
  end
end
