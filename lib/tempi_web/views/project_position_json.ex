defmodule TempiWeb.ProjectPositionJSON do
  def index(%{positions: positions}) do
    for position <- positions, do: data(position)
  end

  def show(%{position: position}) do
    data(position)
  end

  defp data(position) do
    %{
      id: position.id,
      project_id: position.project_id,
      title: position.title,
      status: position.status,
      payment: %{
        rate: position.rate,
        rate_type: position.rate_type,
        currency: position.currency
      },
      number_of_employees: position.number_of_employees,
      classification_code: position.classification_code,
      applications_count: position.applications_count,
      favorites_count: position.favorites_count,
      notes: position.notes,
      created_at: position.inserted_at
    }
  end
end
