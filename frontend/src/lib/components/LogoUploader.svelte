<script lang="ts">
  import { onDestroy } from 'svelte'

  import { getStorageServices } from '$lib/services/storage'

  let { value = $bindable<string | ''>() } = $props()

  let state = $state({
    previewUrl: '',
    isLoading: false,
    error: null as string | null,
  })

  const storage = getStorageServices()
  const photos = storage.photos.logos
  const files = storage.files.logos

  async function handleSelectAndUpload() {
    state.isLoading = true
    state.error = null

    try {
      const picked = await photos.selectPhoto(90)
      if (!picked) {
        state.isLoading = false
        return
      }

      // create our own blob URL (avoid fileStorage re-creating one)
      if (state.previewUrl.startsWith('blob:')) URL.revokeObjectURL(state.previewUrl)
      state.previewUrl = URL.createObjectURL(picked.file)

      // upload and pass the existing previewUrl to prevent a second createObjectURL inside file service
      const res = await photos.uploadPhoto(picked.file, { previewUrl: state.previewUrl })
      value = res.key

      // fetch the stored image as blob (no transform to avoid 400s on free plan)
      const blob = await files.download(res.key)

      // replace the temporary blob with the stored blob (and revoke old one)
      if (state.previewUrl.startsWith('blob:')) URL.revokeObjectURL(state.previewUrl)
      state.previewUrl = URL.createObjectURL(blob)
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Upload failed'
    } finally {
      state.isLoading = false
    }
  }

  function removePhoto() {
    if (state.previewUrl.startsWith('blob:')) URL.revokeObjectURL(state.previewUrl)
    state.previewUrl = ''
    state.error = null
    value = ''
  }

  onDestroy(() => {
    if (state.previewUrl.startsWith('blob:')) URL.revokeObjectURL(state.previewUrl)
  })
</script>

<div class="logo-uploader-container">
  <div class="logo-uploader">
    {#if state.previewUrl}
      <div class="logo-preview">
        <img src={state.previewUrl} alt="Logo preview" class="logo-preview-img" />
        <button
          type="button"
          class="logo-remove-btn"
          onclick={removePhoto}
          aria-label="Remove logo"
          disabled={state.isLoading}>
          &times;
        </button>
      </div>
    {:else}
      <button
        type="button"
        id="logo-uploader"
        class="logo-uploader-trigger"
        onclick={handleSelectAndUpload}
        disabled={state.isLoading}>
        <div class="uploader-placeholder">
          <span>{state.isLoading ? 'Uploading…' : 'Add Logo'}</span>
        </div>
      </button>
    {/if}
  </div>

  {#if state.error}
    <div class="error-message">{state.error}</div>
  {/if}
</div>

<style>
  /* keep your styles from before */
</style>
