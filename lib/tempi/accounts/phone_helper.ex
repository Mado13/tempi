defmodule Tempi.Accounts.PhoneHelper do
  @doc """
  Normalizes an Israeli phone number to E.164 format.
  """
  def normalize_phone_number(phone_number) do
    case ExPhoneNumber.parse(phone_number, "IL") do
      {:ok, parsed} ->
        if ExPhoneNumber.is_valid_number?(parsed) do
          {:ok, ExPhoneNumber.format(parsed, :e164)}
        else
          {:error, :invalid_number}
        end

      {:error, reason} ->
        {:error, reason}
    end
  end
end
