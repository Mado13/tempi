defmodule TempiWeb.ProjectJSON do
  def index(%{projects: projects}) do
    for project <- projects, do: data(project)
  end

  def show(%{project: project}) do
    data(project)
  end

  defp data(project) do
    total_favorites = Enum.sum(Enum.map(project.positions, & &1.favorites_count))

    %{
      id: project.id,
      name: project.name,
      status: project.status,
      notes: project.notes,
      meta: project.meta,
      company_id: project.company_profile.id,
      address: %{
        formatted_address: project.address.formatted_address,
        locality: project.address.locality,
        district: project.address.district
      },
      date: %{
        start: project.start_date,
        end: project.end_date
      },
      favorites_count: total_favorites,
      created_at: project.inserted_at
    }
  end

  defp format_position(position) do
    %{
      id: position.id,
      title: position.title,
      status: position.status,
      payment: %{
        rate: position.rate,
        rate_type: position.rate_type
      },
      number_of_employees: position.number_of_employees,
      classification_code: position.classification_code,
      applications_count: position.applications_count,
      favorites_count: position.favorites_count,
      notes: position.notes
    }
  end
end
