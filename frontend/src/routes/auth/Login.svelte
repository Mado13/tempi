<script lang="ts">
  import { m } from '$i18n/messages'
  import { navigate } from '$router'
  import * as v from 'valibot'

  import { createForm } from '$lib/forms.svelte'

  const loginSchema = v.object({
    phoneNumber: v.pipe(
      v.string(),
      v.minLength(1, m['auth.login.errors.phone_missing']()),
      v.regex(/^05[0-9]{8}$/, m['auth.login.errors.wrong_format']()),
    ),
  })

  const form = createForm({
    schema: loginSchema,
    defaultValues: {
      phoneNumber: '',
    },
    async onSubmit() {
      const response = await form.post('/auth/send_code')
      if (response.success) {
        navigate('/auth/verify', { state: form.phoneNumber })
      }
    },
  })
</script>

<header class="auth-header">
  <h1 class="auth-title">{m['auth.login.title']()}</h1>
  <p class="auth-subtitle">subtitle</p>
</header>

<form class="auth-form" onsubmit={form.handleSubmit}>
  <div class="auth-form-group">
    <label class="auth-label" for="phoneNumber">phoneNumber</label>

    <div class="phone-input-wrapper">
      <input
        id="phoneNumber"
        class="phone-input {form.errors.phoneNumber ? 'input-error' : ''}"
        type="text"
        inputmode="numeric"
        autocomplete="tel"
        bind:value={form.phoneNumber}
        oninput={() => form.clearErrors('phoneNumber')}
        disabled={form.isSubmitting} />

      {#if form.errors.phoneNumber}
        <span class="auth-error" role="alert">
          {form.errors.phoneNumber}
        </span>
      {:else}
        <span class="auth-helper-text">Helper</span>
      {/if}
    </div>
  </div>

  <div class="auth-button-container">
    <button type="submit" class="auth-button" disabled={form.isSubmitting}>
      {#if form.isSubmitting}
        <span class="auth-loading"></span>
      {:else}
        Submit
      {/if}
    </button>

    <p class="phone-disclaimer">Disclaimer</p>
  </div>
</form>

<style>
  /* Phone-specific styles only */
  .phone-input-wrapper {
    position: relative;
  }

  .phone-input {
    font-size: 16px !important;
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    min-height: var(--size-tap-target);
    padding: 0 var(--spacing-m);
    font-family: var(--font-family-base);
    font-weight: var(--font-weight-regular);
    color: var(--color-text-primary);
    background-color: var(--color-background-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-m);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
    touch-action: manipulation;
    -webkit-user-select: text;
    user-select: text;
  }

  .phone-input:focus {
    outline: none;
    border-color: var(--color-border-focused);
    box-shadow: var(--ring-accent);
  }

  .phone-input::placeholder {
    color: var(--color-text-placeholder);
  }

  .phone-input:disabled {
    background-color: var(--color-background-surface-active);
    cursor: not-allowed;
  }

  .input-error {
    border-color: var(--color-semantic-error-fg) !important;
  }

  .input-error:focus {
    box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.25) !important;
  }

  .phone-disclaimer {
    font-size: var(--font-size-label-s);
    color: var(--color-text-secondary);
    line-height: 1.5;
    text-align: center;
    margin-top: var(--spacing-m);
    padding: 0 var(--spacing-s);
  }
</style>
