defmodule TempiWeb.CompanyController do
  use TempiWeb, :controller
  alias Tempi.Profiles

  def index(conn, _params) do
    user_id = current_user(conn).id
    company_profiles = Profiles.get_company_profiles_for_user(user_id)

    conn
    |> render(:index, company_profiles: company_profiles)
  end

  def create(conn, %{"name" => name, "business_number" => business_number}) do
    current_user = current_user(conn)

    attrs = %{
      "name" => name,
      "business_number" => business_number,
      "employer_profile_id" => current_user.employer_profile.id
    }

    with {:ok, company_profile} <- Profiles.create_company_profile(attrs) do
      conn
      |> put_status(:created)
      |> render(:show, company_profile: company_profile)
    end
  end
end
