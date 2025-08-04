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

  async function handleSelectAndUpload() {
    state.isLoading = true
    state.error = null

    try {
      const picked = await photos.selectPhoto(90)
      if (!picked) {
        state.isLoading = false
        return
      }

      const res = await photos.uploadLogo(picked.file)

      // swap preview to the transformed 96×96 blob URL
      if (state.previewUrl.startsWith('blob:')) URL.revokeObjectURL(state.previewUrl)
      state.previewUrl = res.previewUrl ?? ''
      value = res.key
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
