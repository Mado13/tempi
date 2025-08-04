defmodule TempiWeb.CompanyJSON do
  def index(%{company_profiles: company_profiles}) do
    for(company_profile <- company_profiles, do: data(company_profile))
  end

  def show(%{company_profile: company_profile}) do
    data(company_profile)
  end

  defp data(company) do
    %{
      id: company.id,
      name: company.name,
      business_number: company.business_number,
      logo_key: company.logo_key
    }
  end
end
