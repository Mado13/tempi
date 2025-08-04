defmodule Tempi.Storage do
  @bucket "dev-tempi-logos"

  def sign_many(keys, opts \\ []) do
    {:ok, client} = Tempi.Supabase.Client.get_client()
    storage = Supabase.Storage.from(client, @bucket)
    base_url = client.base_url
    expires_in = opts[:expires_in] || 604_800

    keys
    |> Enum.uniq()
    |> Task.async_stream(
      fn key ->
        resp = Supabase.Storage.File.create_signed_url(storage, key, expires_in: expires_in)

        case resp do
          {:ok, path} when is_binary(path) ->
            {key, build_abs_url(base_url, path)}

          {:ok, %{"signedURL" => path}} ->
            {key, build_abs_url(base_url, path)}

          %Supabase.Fetcher.Response{status: 200, body: body} ->
            %{"signedURL" => path} = Jason.decode!(body)
            {key, build_abs_url(base_url, path)}

          {:ok, %Supabase.Fetcher.Response{status: _status}} ->
            {key, nil}

          {:error, _reason} ->
            {key, nil}

          _other ->
            {key, nil}
        end
      end,
      max_concurrency: 10,
      timeout: 5_000
    )
    |> Enum.reduce(%{}, fn
      {:ok, {k, v}}, acc -> Map.put(acc, k, v)
      _, acc -> acc
    end)
  end

  defp build_abs_url(base_url, relative_path) do
    base = String.trim_trailing(base_url, "/")
    rel = String.trim_leading(relative_path, "/")
    base <> "/storage/v1/" <> rel
  end
end
