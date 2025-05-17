defmodule Tempi.JobCatalog.ISICDivision do
  @moduledoc """
  Defines the schema for an ISIC division
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "isic_divisions" do
    field :code, :string
    field :name, :string

    belongs_to :isic_section, Tempi.JobCatalog.ISICSection, type: :binary_id
    has_many :isic_groups, Tempi.JobCatalog.ISICGroup

    timestamps()
  end

  def changeset(division, attrs) do
    division
    |> cast(attrs, [:code, :name, :isic_section_id])
    |> validate_required([:code, :name, :isic_section_id])
    |> unique_constraint(:code)
  end
end
