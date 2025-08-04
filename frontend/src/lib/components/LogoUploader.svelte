<script lang="ts">
  import { onDestroy } from 'svelte'

  import { getStorageServices } from '$lib/services/storage'

  type Props = {
    value?: string
  }

  let { value = $bindable() }: Props = $props()

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
          {#if state.isLoading}
            <IconLineMdUploadingLoop />
          {:else}
            <span>Add logo</span>
          {/if}
        </div>
      </button>
    {/if}
  </div>

  {#if state.error}
    <div class="error-message">{state.error}</div>
  {/if}
</div>

<style>
  .logo-uploader-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-s);
  }

  .logo-uploader {
    width: 104px;
    height: 104px;
    position: relative;
  }

  .logo-uploader-trigger {
    width: 100%;
    height: 100%;
    padding: 0;
    border-radius: var(--radius-m);
    border: 2px dashed var(--color-border-default);
    background-color: var(--color-background-page);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .logo-uploader-trigger:hover:not(:disabled) {
    border-color: var(--color-interactive-accent-default);
    background-color: var(--color-background-surface-active);
  }

  .logo-uploader-trigger:disabled {
    cursor: wait;
  }

  .uploader-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-s);
    color: var(--color-text-secondary);
    font-size: var(--font-size-label-m);
  }

  .uploader-placeholder :global(svg) {
    color: var(--color-text-placeholder);
    width: 32px;
    height: 32px;
  }

  .logo-preview {
    width: 100%;
    height: 100%;
    position: relative;
    box-shadow: var(--shadow-card);
    border-radius: var(--radius-m);
  }

  .logo-preview-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--radius-m);
  }

  .logo-remove-btn {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 28px;
    height: 28px;
    min-height: unset;
    padding: 0;
    background-color: var(--color-text-primary);
    color: var(--color-background-surface);
    border: 2px solid var(--color-background-surface);
    box-shadow: var(--shadow-md);
    font-size: 1.25rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .error-message {
    color: var(--color-semantic-error-fg);
    font-size: var(--font-size-label-m);
    margin-top: var(--spacing-xs);
  }
</style>
