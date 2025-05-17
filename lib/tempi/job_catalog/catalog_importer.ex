defmodule Tempi.JobCatalog.ISICImporter do
  @moduledoc """
  Imports ISIC data from CSV files into the database.
  """

  alias Tempi.Repo
  alias Tempi.JobCatalog.{ISICSection, ISICDivision, ISICGroup, ISICClass}

  NimbleCSV.define(MyCSV, separator: ",", escape: "\"")

  @section_lookup_path "priv/data/ISICSectionLookup.csv"
  @isic_path "priv/data/ISIC.csv"

  # Entry point
  def import_all(section_lookup_path \\ @section_lookup_path, isic_path \\ @isic_path) do
    section_map = import_sections(section_lookup_path)
    import_isic(isic_path, section_map)
  end

  # Step 1: Import Sections
  defp import_sections(path) do
    path
    |> File.stream!()
    |> MyCSV.parse_stream()
    |> Enum.reduce(%{}, fn [code, name], acc ->
      section =
        Repo.get_by(ISICSection, code: code) ||
          %ISICSection{}
          |> ISICSection.changeset(%{code: code, name: name})
          |> Repo.insert!()

      Map.put(acc, code, section.id)
    end)
  end

  # Step 2: Import ISIC Hierarchy
  defp import_isic(path, section_map) do
    # Keep track of created divisions and groups to avoid duplicates
    divisions = %{}
    groups = %{}

    path
    |> File.stream!()
    |> MyCSV.parse_stream()
    |> Enum.reduce({divisions, groups}, fn
      [section_code, division_code, group_code, class_code, name], {div_acc, grp_acc} ->
        # Insert Division
        div_acc =
          if division_code != "" and not Map.has_key?(div_acc, division_code) do
            division =
              Repo.get_by(ISICDivision, code: division_code) ||
                %ISICDivision{}
                |> ISICDivision.changeset(%{
                  code: division_code,
                  name: name,
                  isic_section_id: Map.fetch!(section_map, section_code)
                })
                |> Repo.insert!()

            Map.put(div_acc, division_code, division.id)
          else
            div_acc
          end

        # Insert Group
        grp_acc =
          if group_code != "" and not Map.has_key?(grp_acc, group_code) do
            # Find parent division
            division_id =
              if division_code != "" do
                Map.fetch!(div_acc, division_code)
              else
                # Some groups may not have division_code on this row, so find the last division for this section
                div_acc |> Map.values() |> List.last()
              end

            group =
              Repo.get_by(ISICGroup, code: group_code) ||
                %ISICGroup{}
                |> ISICGroup.changeset(%{
                  code: group_code,
                  name: name,
                  isic_division_id: division_id
                })
                |> Repo.insert!()

            Map.put(grp_acc, group_code, group.id)
          else
            grp_acc
          end

        # Insert Class
        if class_code != "" do
          group_id =
            if group_code != "" do
              Map.fetch!(grp_acc, group_code)
            else
              # Find last group for this division
              grp_acc |> Map.values() |> List.last()
            end

          unless Repo.get_by(ISICClass, code: class_code) do
            %ISICClass{}
            |> ISICClass.changeset(%{
              code: class_code,
              name: name,
              isic_group_id: group_id
            })
            |> Repo.insert!()
          end
        end

        {div_acc, grp_acc}
    end)
  end
end
