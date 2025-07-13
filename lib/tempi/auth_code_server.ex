defmodule Tempi.AuthCodeServer do
  use GenServer
  require Logger

  @code_ttl_minutes 5

  # Client API
  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  @doc """
  Generates a 6-digit code for the given phone number.
  Returns the generated code.
  """
  def generate_code(phone_number) do
    GenServer.call(__MODULE__, {:generate_code, phone_number})
  end

  @doc """
  Verifies a code for the given phone number.
  Returns {:ok, :valid} if code is correct and not expired,
  {:error, :invalid} if code is wrong,
  {:error, :expired} if code has expired,
  {:error, :not_found} if no code exists for this phone number.
  """
  def verify_code(phone_number, code) do
    GenServer.call(__MODULE__, {:verify_code, phone_number, code})
  end

  @doc """
  Manually cleanup expired codes (optional, also happens automatically)
  """
  def cleanup_expired do
    GenServer.cast(__MODULE__, :cleanup_expired)
  end

  # Server callbacks
  @impl true
  def init(state) do
    Logger.info("AuthCodeServer started")
    {:ok, state}
  end

  @impl true
  def handle_call({:generate_code, phone_number}, _from, state) do
    # Generate 6-digit code using crypto
    code =
      :crypto.strong_rand_bytes(3)
      |> :binary.decode_unsigned()
      |> rem(900_000)
      |> Kernel.+(100_000)
      |> Integer.to_string()

    # Calculate expiry time (5 minutes from now)
    expires_at = DateTime.add(DateTime.utc_now(), @code_ttl_minutes * 60, :second)

    # Store the code with expiry
    new_state =
      Map.put(state, phone_number, %{
        code: code,
        expires_at: expires_at
      })

    Logger.info("Generated code for phone #{phone_number}")
    {:reply, code, new_state}
  end

  @impl true
  def handle_call({:verify_code, phone_number, submitted_code}, _from, state) do
    case Map.get(state, phone_number) do
      nil ->
        Logger.warning("Code verification failed: no code found for #{phone_number}")
        {:reply, {:error, :not_found}, state}

      %{code: stored_code, expires_at: expires_at} ->
        now = DateTime.utc_now()

        cond do
          DateTime.compare(now, expires_at) == :gt ->
            # Code expired, remove it
            new_state = Map.delete(state, phone_number)
            Logger.warning("Code verification failed: expired code for #{phone_number}")
            {:reply, {:error, :expired}, new_state}

          stored_code == submitted_code ->
            # Code is valid, remove it (single use)
            new_state = Map.delete(state, phone_number)
            Logger.info("Code verification successful for #{phone_number}")
            {:reply, {:ok, :valid}, new_state}

          true ->
            # Code is wrong but not expired
            Logger.warning("Code verification failed: invalid code for #{phone_number}")
            {:reply, {:error, :invalid}, state}
        end
    end
  end

  @impl true
  def handle_cast(:cleanup_expired, state) do
    now = DateTime.utc_now()

    new_state =
      state
      |> Enum.reject(fn {_phone, %{expires_at: expires_at}} ->
        DateTime.compare(now, expires_at) == :gt
      end)
      |> Map.new()

    expired_count = map_size(state) - map_size(new_state)

    if expired_count > 0 do
      Logger.info("Cleaned up #{expired_count} expired codes")
    end

    {:noreply, new_state}
  end

  @impl true
  def handle_info(:cleanup_expired, state) do
    handle_cast(:cleanup_expired, state)
  end
end
