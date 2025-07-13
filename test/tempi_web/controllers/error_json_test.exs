defmodule TempiWeb.ErrorJSONTest do
  use TempiWeb.ConnCase, async: true

  test "renders 404" do
    assert TempiWeb.ErrorJSON.render("404.json", %{}) == %{errors: %{detail: "Not Found"}}
  end

  test "renders 500" do
    assert TempiWeb.ErrorJSON.render("500.json", %{}) ==
             %{errors: %{detail: "Internal Server Error"}}
  end
end
