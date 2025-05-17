defmodule Tempi.JobCatalog.ISICClass do
  @moduledoc """
  Defines the schema for an ISIC class
  """
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  schema "isic_classes" do
    field :code, :string
    field :name, :string

    belongs_to :isic_group, Tempi.JobCatalog.ISICGroup, type: :binary_id

    timestamps()
  end

  def changeset(isic_class, attrs) do
    isic_class
    |> cast(attrs, [:code, :name, :isic_group_id])
    |> validate_required([:code, :name, :isic_group_id])
    |> unique_constraint(:code)
  end
end
