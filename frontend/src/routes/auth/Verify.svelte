<script lang="ts">
  import { navigate, route } from '$router'
  import { authService } from '$utils/auth.svelte'
  import * as v from 'valibot'

  import { createForm } from '$lib/forms.svelte'

  const verifySchema = v.object({
    phoneNumber: v.string(),
    code: v.string(),
  })

  const form = createForm({
    schema: verifySchema,
    defaultValues: {
      phoneNumber: route.state as string,
      code: '',
    },
    onSubmit: async () => {
      const response = await form.post('/auth/verify_code')
      if (!response.success) return

      await authService.login(response.data.token)
      if (!response.data.user.currentRole) {
        navigate('/app/select-role')
      } else {
        navigate('/app')
      }
    },
  })
</script>

<header class="auth-header verify-header">
  <h1 class="auth-title">Title</h1>
  <p class="auth-subtitle">subTitle</p>
  <p class="verify-phone-number">0524890333</p>
</header>

<form class="auth-form" onsubmit={form.handleSubmit}>
  <div class="auth-form-group">
    label
    <label class="auth-label" for="otpCode"> </label>

    <div class="otp-input-container">
      <input
        id="otpCode"
        class="otp-input {form.errors.code ? 'input-error' : ''}"
        type="text"
        inputmode="numeric"
        autocomplete="one-time-code"
        placeholder="••••••"
        bind:value={form.code}
        oninput={() => form.clearErrors('code')}
        disabled={form.isSubmitting}
        maxlength="6" />

      {#if form.errors.code}
        <span class="auth-error" role="alert">
          {form.errors.code}
        </span>
      {/if}
    </div>

    <div class="resend-container">
      <span class="resend-text">Resend code</span>
      <button type="button" class="resend-button">
        Resend With timer
        {#if -1 > 0}{:else}
          Resend Now
        {/if}
      </button>

      <button type="button" class="change-number-button"> Change phone number </button>
    </div>
  </div>

  <div class="auth-button-container">
    <button
      type="submit"
      class="auth-button"
      disabled={form.isSubmitting || form.code.length !== 6}>
      {#if form.isSubmitting}
        <span class="auth-loading"></span>
      {:else}
        Submit
      {/if}
    </button>
  </div>
</form>

<style>
  /* Verify-specific styles only */
  .verify-header {
    margin-bottom: var(--spacing-xl);
    text-align: center;
  }

  .verify-phone-number {
    font-size: var(--font-size-label-l);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin-top: var(--spacing-xs);
  }

  .otp-input-container {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
    align-items: center;
  }

  .otp-input {
    font-size: 16px !important;
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    max-width: 200px;
    min-height: var(--size-tap-target);
    padding: 0 var(--spacing-m);
    font-family: var(--font-family-base);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-headline-s) !important;
    letter-spacing: 0.5em;
    text-align: center;
    color: var(--color-text-primary);
    background-color: var(--color-background-surface);
    border: 2px solid var(--color-border-default);
    border-radius: var(--radius-m);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
    touch-action: manipulation;
    -webkit-user-select: text;
    user-select: text;
  }

  .otp-input:focus {
    outline: none;
    border-color: var(--color-border-focused);
    box-shadow: var(--ring-accent);
  }

  .otp-input::placeholder {
    color: var(--color-text-placeholder);
    letter-spacing: normal;
  }

  .otp-input:disabled {
    background-color: var(--color-background-surface-active);
    cursor: not-allowed;
  }

  .input-error {
    border-color: var(--color-semantic-error-fg) !important;
  }

  .input-error:focus {
    box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.25) !important;
  }

  .resend-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-s);
    margin-top: var(--spacing-l);
  }

  .resend-text {
    font-size: var(--font-size-label-m);
    color: var(--color-text-secondary);
  }

  .resend-button {
    background: none;
    border: none;
    color: var(--color-text-link);
    font-size: var(--font-size-label-m);
    font-weight: var(--font-weight-medium);
    font-family: var(--font-family-base);
    padding: var(--spacing-s) var(--spacing-m);
    min-height: 44px;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: opacity var(--transition-fast);
    cursor: pointer;
  }

  .resend-button:active {
    opacity: 0.7;
  }

  .resend-button:disabled {
    color: var(--color-text-placeholder);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .resend-timer {
    font-size: var(--font-size-label-s);
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;
  }

  .change-number-button {
    background: none;
    border: none;
    color: var(--color-text-link);
    font-size: var(--font-size-label-s);
    font-weight: var(--font-weight-regular);
    font-family: var(--font-family-base);
    padding: var(--spacing-s);
    margin-top: var(--spacing-s);
    min-height: 44px;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: opacity var(--transition-fast);
    cursor: pointer;
  }

  .change-number-button:active {
    opacity: 0.7;
  }
</style>
