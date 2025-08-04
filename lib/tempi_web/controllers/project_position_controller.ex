defmodule TempiWeb.ProjectPositionController do
  use TempiWeb, :controller

  alias Tempi.ProjectPositions

  def index(conn, params) do
    positions = ProjectPositions.list_positions(params)
    render(conn, :index, positions: positions)
  end
end
