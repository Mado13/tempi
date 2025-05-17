defmodule Tempi.JobCatalog.ISICSection do
  @moduledoc """
  Defines the schema for an ISIC section
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "isic_sections" do
    field :code, :string
    field :name, :string

    has_many :isic_divisions, Tempi.JobCatalog.ISICDivision

    timestamps()
  end

  def changeset(section, attrs) do
    section
    |> cast(attrs, [:code, :name])
    |> validate_required([:code, :name])
    |> unique_constraint(:code)
  end
end
