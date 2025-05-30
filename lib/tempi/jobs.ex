defmodule Tempi.Jobs do
  alias Ecto.Multi
  alias Tempi.Repo

  import Ecto.Query
  import Tempi.Utils.DateHelpers, only: [parse_date!: 1]

  alias Tempi.Locations.{Address, AddressBuilder}
  alias Tempi.Jobs.{Job, JobApplication, JobAgreement}

  @job_keys ~w(start_date end_date title name pay_rate pay_type)
  @address_keys ~w(address_id formatted_address location address_components)

  def create_job(employer_profile_id, params) do
    {job_attrs, address_attrs} = split_job_and_address_params(params)

    Multi.new()
    |> Multi.insert(:address, fn _changes ->
      Address.changeset(%Address{}, AddressBuilder.build(address_attrs))
    end)
    |> Multi.insert(:job, fn %{address: address} ->
      job_data =
        job_attrs
        |> Map.put("address_id", address.id)
        |> Map.put("employer_profile_id", employer_profile_id)

      Job.changeset(%Job{}, job_data)
    end)
    |> Repo.transaction()
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

    Job
    |> where([j], j.start_date <= ^end_date and j.end_date >= ^start_date)
    |> preload(:address)
    |> Repo.all()
  end

  defp split_job_and_address_params(params) do
    pay = Map.get(params, "pay", %{})

    job_attrs =
      params
      |> Map.take(@job_keys)
      |> Map.update("start_date", nil, &parse_date!/1)
      |> Map.update("end_date", nil, &parse_date!/1)
      |> Map.put("pay_rate", pay["rate"])
      |> Map.put("pay_type", pay["type"])

    address_attrs =
      params
      |> Map.get("location", %{})
      |> Map.take(@address_keys)

    {job_attrs, address_attrs}
  end

  def get_job_application(id) do
    Repo.get!(JobApplication, id) |> Repo.preload(:job)
  end

  def create_job_application(attrs) do
    %JobApplication{}
    |> JobApplication.changeset(attrs)
    |> Repo.insert()
  end

  def update_job_application(job_application, attrs) do
    multi =
      Multi.new()
      |> Multi.update(:job_application, JobApplication.changeset(job_application, attrs))

    multi =
      if attrs[:status] == :completed and job_application.status != :completed do
        Multi.run(multi, :job_agreement, fn _repo, %{job_application: updated_app} ->
          create_job_agreement(%{
            job_id: updated_app.job_id,
            worker_profile_id: updated_app.worker_profile_id,
            employer_profile_id: updated_app.job.employer_profile_id,
            job_application_id: updated_app.id,
            completed_at: DateTime.utc_now()
          })
        end)
      else
        multi
      end

    Repo.transaction(multi)
  end

  def create_job_agreement(attrs) do
    %JobAgreement{}
    |> JobAgreement.changeset(attrs)
    |> Repo.insert()
  end
end
