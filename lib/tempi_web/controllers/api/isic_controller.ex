defmodule TempiWeb.Api.IsicController do
  use TempiWeb, :controller
  alias Tempi.JobCatalog

  def index(conn, _params) do
    json(conn, JobCatalog.list_flattened_isic_classes())
  end
end
