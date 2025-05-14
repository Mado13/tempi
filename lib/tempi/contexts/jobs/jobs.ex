defmodule Tempi.Contexts.Jobs.Jobs do
  import Ecto.Query
  import Tempi.Utils.DateHelpers, only: [parse_date!: 1]

  alias Tempi.Schemas.Jobs.Job
  alias Tempi.Schemas.Locations.Address
  alias Tempi.Contexts.Locations.AddressBuilder
  alias Ecto.Multi
  alias Tempi.Repo

  @job_keys ~w(start_date end_date title name)
  @address_keys ~w(address_id formatted_address location address_components)

  def create_job(employer_profile_id, params) do
    IO.inspect(params)
    {job_attrs, address_attrs} = split_job_and_address_params(params)
    IO.inspect(job_attrs)

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

    from(j in Job, where: j.inserted_at >= ^start_date and j.inserted_at <= ^end_date)
    |> Repo.all()
  end

  defp split_job_and_address_params(params) do
    job_attrs =
      params
      |> Map.take(@job_keys)
      |> Map.update("start_date", nil, &parse_date!/1)
      |> Map.update("end_date", nil, &parse_date!/1)

    address_attrs =
      params
      |> Map.get("location", %{})
      |> Map.take(@address_keys)

    {job_attrs, address_attrs}
  end
end
