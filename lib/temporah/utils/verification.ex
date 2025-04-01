defmodule Temporah.Utils.Verification do
  use GenServer
  import Temporah.Utils.I18n

  # 10 minutes in seconds
  @verification_expiration 600

  # Client API

  def start_link(_) do
    GenServer.start_link(__MODULE__, :ok, name: __MODULE__)
  end

  def generate_code(phone_number) do
    GenServer.call(__MODULE__, {:generate_code, phone_number})
  end

  def verify_code(phone_number, code) do
    GenServer.call(__MODULE__, {:verify_code, phone_number, code})
  end

  # Server callbacks

  def init(:ok) do
    # Create ETS table for verification codes
    :ets.new(:verification_codes, [:named_table, :set, :protected])
    # Schedule periodic cleanup
    schedule_cleanup()
    {:ok, %{}}
  end

  def handle_call({:generate_code, phone_number}, _from, state) do
    code =
      :crypto.strong_rand_bytes(3)
      |> :binary.decode_unsigned()
      |> rem(900_000)
      |> Kernel.+(100_000)
      |> Integer.to_string()

    # Store in ETS with expiration timestamp
    expiry = :os.system_time(:second) + @verification_expiration

    :ets.insert(
      :verification_codes,
      {phone_number,
       %{
         code: code,
         attempts: 0,
         expiry: expiry
       }}
    )

    {:reply, code, state}
  end

  def handle_call({:verify_code, phone_number, submitted_code}, _from, state) do
    result =
      case :ets.lookup(:verification_codes, phone_number) do
        [] ->
          # Return a map with a translation key instead of hardcoded message
          {:error, %{"code" => t("errors", "verification_code_invalid")}}

        [{^phone_number, data}] ->
          current_time = :os.system_time(:second)
          # Check if expired
          if current_time > data.expiry do
            :ets.delete(:verification_codes, phone_number)
            {:error, %{"code" => "verification_code_expired"}}
          else
            # Increment attempts counter
            updated_data = %{data | attempts: data.attempts + 1}
            :ets.insert(:verification_codes, {phone_number, updated_data})

            cond do
              # Code matches
              data.code == submitted_code ->
                # Successful verification - delete the code
                :ets.delete(:verification_codes, phone_number)
                # Success message with key too
                {:ok, "verification_success"}

              # Too many attempts
              updated_data.attempts >= 5 ->
                # Too many attempts, delete the code
                :ets.delete(:verification_codes, phone_number)
                {:error, %{"code" => "verification_code_abused"}}

              # Code doesn't match
              true ->
                {:error, %{"code" => "verification_code_invalid"}}
            end
          end
      end

    {:reply, result, state}
  end

  def handle_info(:cleanup, state) do
    current_time = :os.system_time(:second)

    # Find and delete expired entries
    :ets.tab2list(:verification_codes)
    |> Enum.each(fn {phone, data} ->
      if current_time > data.expiry do
        :ets.delete(:verification_codes, phone)
      end
    end)

    # Schedule next cleanup
    schedule_cleanup()
    {:noreply, state}
  end

  # WhatsApp verification code sending (unchanged)
  def send_verification_code(code) do
    ExTwilio.Message.create(
      from: "whatsapp:+14155238886",
      content_sid: "HX229f5a04fd0510ce1b071852155d3e75",
      content_variables: "{\"1\":\"#{code}\"}",
      to: "whatsapp:+31644382798"
    )
    |> case do
      {:ok, message} ->
        IO.puts("Message sent with SID: #{message.sid}")
        {:ok, message}

      {:error, message, error_code} ->
        IO.puts("Error sending message: #{message}, code: #{error_code}")
        {:error, message, error_code}
    end
  end

  # Private functions

  defp schedule_cleanup do
    # Run cleanup every minute
    Process.send_after(self(), :cleanup, 60 * 1000)
  end
end
