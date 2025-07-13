defmodule TempiWeb.ErrorJSON do
  def render("400.json", %{error_code: "INVALID_PHONE_FORMAT"}) do
    %{errors: %{phone_number: ["INVALID_PHONE_FORMAT"]}}
  end

  def render("401.json", %{error_code: "INVALID_AUTH_CODE"}) do
    %{errors: %{code: ["INVALID_AUTH_CODE"]}}
  end

  def render("400.json", %{error_code: "MISSING_PARAMETERS"}) do
    %{errors: %{_all: ["MISSING_PARAMETERS"]}}
  end

  def render("401.json", %{error_code: "MISSING_AUTH_HEADER"}) do
    %{errors: %{_all: ["MISSING_AUTH_HEADER"]}}
  end

  def render("422.json", %{error_code: error_code}) when is_binary(error_code) do
    %{errors: %{_all: [error_code]}}
  end

  def render("422.json", %{changeset: changeset}) do
    %{errors: changeset_to_error_codes(changeset)}
  end

  def render("429.json", %{error_code: code, retry_after: retry_after}) do
    %{errors: %{_all: [code]}, retry_after_seconds: retry_after}
  end

  def render("500.json", %{error_code: code}) do
    %{errors: %{_all: [code]}}
  end

  # Generic handlers still use the code
  def render(_template, %{error_code: code}) do
    %{errors: %{_all: [code]}}
  end

  defp changeset_to_error_codes(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {_msg, opts} ->
      # Map validation types to error codes
      case opts[:validation] do
        :required ->
          "FIELD_REQUIRED"

        :length ->
          cond do
            opts[:min] && opts[:max] -> "FIELD_LENGTH_RANGE"
            opts[:min] -> "FIELD_TOO_SHORT"
            opts[:max] -> "FIELD_TOO_LONG"
            true -> "FIELD_INVALID_LENGTH"
          end

        :number ->
          cond do
            opts[:greater_than] -> "FIELD_TOO_SMALL"
            opts[:less_than] -> "FIELD_TOO_LARGE"
            opts[:greater_than_or_equal_to] -> "FIELD_TOO_SMALL"
            opts[:less_than_or_equal_to] -> "FIELD_TOO_LARGE"
            true -> "FIELD_INVALID_NUMBER"
          end

        :inclusion ->
          "FIELD_INVALID_CHOICE"

        :exclusion ->
          "FIELD_NOT_ALLOWED"

        :format ->
          "FIELD_INVALID_FORMAT"

        :confirmation ->
          "FIELD_CONFIRMATION_MISMATCH"

        :acceptance ->
          "FIELD_MUST_BE_ACCEPTED"

        :unique ->
          "FIELD_ALREADY_EXISTS"

        :foreign_key ->
          "FIELD_INVALID_REFERENCE"

        _ ->
          "FIELD_INVALID"
      end
    end)
    |> Enum.into(%{})
  end
end
