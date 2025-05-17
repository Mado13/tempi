defmodule Tempi.JobCatalog.ISICGroup do
  @moduledoc """
  Defines the schema for an ISIC group
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "isic_groups" do
    field :code, :string
    field :name, :string

    belongs_to :isic_division, Tempi.JobCatalog.ISICDivision, type: :binary_id
    has_many :isic_classes, Tempi.JobCatalog.ISICClass

    timestamps()
  end

  def changeset(group, attrs) do
    group
    |> cast(attrs, [:code, :name, :isic_division_id])
    |> validate_required([:code, :name, :isic_division_id])
    |> unique_constraint(:code)
  end
end
