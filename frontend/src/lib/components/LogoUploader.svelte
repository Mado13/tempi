<script lang="ts">
  import { onDestroy } from 'svelte'

  import LoadingState from '$lib/components/LoadingState.svelte'
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

<div class="logo-uploader">
  {#if state.previewUrl}
    <div class="preview-container">
      <img src={state.previewUrl} alt="Logo preview" />
      <button type="button" class="remove-btn" onclick={removePhoto} disabled={state.isLoading}>
        &times;
      </button>
    </div>
  {:else}
    <button
      type="button"
      class="upload-btn"
      onclick={handleSelectAndUpload}
      disabled={state.isLoading}>
      {#if state.isLoading}
        <LoadingState />
      {:else}
        <IconTablerUpload />
        <span>Add logo</span>
      {/if}
    </button>
  {/if}

  {#if state.error}
    <div class="error">{state.error}</div>
  {/if}
</div>

<style>
  .logo-uploader {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
  }

  .upload-btn {
    width: 120px;
    height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    border: 2px dashed var(--color-border-default);
    border-radius: var(--radius-lg);
    background: var(--color-background-elevated);
    color: var(--color-text-secondary);
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-out);
    :global(svg) {
      flex-shrink: 0;
    }
  }

  .upload-btn:hover:not(:disabled) {
    border-color: var(--color-primary);
    background: var(--color-background-screen);
    color: var(--color-primary);
  }

  .upload-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .preview-container {
    position: relative;
    width: 120px;
    height: 120px;
  }

  .preview-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-elevated);
  }

  .remove-btn {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid var(--color-background-screen);
    background: var(--color-error);
    color: white;
    font-size: 18px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: var(--shadow-elevated);
  }

  .remove-btn:hover:not(:disabled) {
    background: #dc2626;
  }

  .remove-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .error {
    color: var(--color-error);
    font-size: var(--font-size-caption);
    text-align: center;
    padding: var(--space-2);
    background: rgba(239, 68, 68, 0.1);
    border-radius: var(--radius-md);
    border: 1px solid rgba(239, 68, 68, 0.2);
  }
</style>
