defmodule Tempi.Contexts.Jobs.JobAgreement do
  alias Tempi.Repo
  alias Tempi.Schemas.Jobs.JobAgreement

  def create_job_agreement(attrs) do
    %JobAgreement{}
    |> JobAgreement.changeset(attrs)
    |> Repo.insert()
  end
end
