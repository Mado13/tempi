defmodule Tempi.ProjectPositions do
  import Ecto.Query
  alias(Tempi.Repo)

  alias Tempi.ProjectPosition

  def list_positions(%{"project_id" => project_id}) do
    ProjectPosition
    |> where([p], p.project_id == ^project_id)
    |> Repo.all()
  end

  def list_positions(_params) do
    Repo.all(ProjectPosition)
  end

  def create_positions_for_project(project_id, positions_list) do
    now = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)

    positions =
      Enum.map(positions_list, fn position ->
        %{
          project_id: project_id,
          title: position["job_classification"]["label"],
          rate: position["payment"]["rate"],
          rate_type: String.to_existing_atom(position["payment"]["rate_type"]),
          number_of_employees: position["number_of_employees"],
          classification_code: position["job_classification"]["id"],
          notes: position["notes"] || "",
          inserted_at: now,
          updated_at: now
        }
      end)

    case Repo.insert_all(ProjectPosition, positions) do
      {count, _} -> {:ok, count}
      error -> {:error, "Failed to create positions: #{inspect(error)}"}
    end
  end
end
