defmodule TempiWeb.ProjectApplicantJSON do
  def index(%{applicants: applicants}) do
    for applicant <- applicants, do: data(applicant)
  end

  defp data(applicant) do
    %{
      id: applicant.id,
      full_name: applicant.full_name
    }
  end
end
