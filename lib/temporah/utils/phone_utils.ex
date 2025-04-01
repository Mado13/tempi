defmodule Temporah.Utils.PhoneUtils do
  @doc """
  Normalizes a phone number to E.164 format (+972XXXXXXXXX).
  Assumes Israeli numbers by default.
  """
  def normalize(phone_number, default_region \\ "IL") do
    case ExPhoneNumber.parse(phone_number, default_region) do
      {:ok, parsed_number} ->
        if ExPhoneNumber.is_valid_number?(parsed_number) do
          {:ok, ExPhoneNumber.format(parsed_number, :e164)}
        else
          {:error, :invalid_number}
        end

      {:error, reason} ->
        {:error, reason}
    end
  end
end
