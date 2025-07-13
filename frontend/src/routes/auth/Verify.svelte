<script lang="ts">
  import { navigate, route } from '$router'
  import { watch } from 'runed'
  import { searchParams } from 'sv-router'
  import * as v from 'valibot'

  import { api } from '$lib/api'
  import Input from '$lib/components/Input.svelte'
  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import SecondaryButton from '$lib/components/SecondaryButton.svelte'
  import { createForm } from '$lib/forms'
  import { authStoreContext } from '$lib/stores/contexts'

  const authStore = authStoreContext.get()

  let seconds = $state(30)
  let submitButton: HTMLButtonElement

  const initialCode = $derived(searchParams.get('code') ?? '')

  const verifySchema = v.object({
    phoneNumber: v.string(),
    code: v.pipe(v.string(), v.length(6)),
  })

  const form = createForm({
    schema: verifySchema,
    defaultValues: {
      phoneNumber: route.state as string,
      code: '',
    },
    async onSubmit(data) {
      const response = await api.post('/auth/verify_code', data)
      if (response.success && response.data) {
        const { currentRole, user, token } = response.data

        await authStore.login(token, user)

        if (!currentRole) {
          navigate('/app/select-role')
        } else {
          navigate('/app/:role/agenda', { params: { role: currentRole } })
        }
      } else {
        throw response
      }
    },
  })

  watch(
    () => form.code,
    () => {
      if (form.code.length === 6) {
        submitButton?.click()
      }
    },
  )

  $effect(() => {
    const interval = setInterval(() => {
      seconds--
      if (seconds <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  })
</script>

<header>
  <h1>Title</h1>
  <p>subTitle</p>
  <p>{form.phoneNumber}</p>
  <p>your auth code: {initialCode}</p>
</header>

<form onsubmit={form.handleSubmit}>
  <div>
    <Input
      id="otp-code"
      label=""
      type="numeric"
      inputmode="numeric"
      maxLength="6"
      autocomplete="one-time-code"
      placeholder="••••••"
      disabled={form.isSubmitting}
      bind:value={form.code}
      --text-align="center"
      style="letter-spacing: 0.5em;" />
  </div>

  <div class="auth-form-group">
    <div class="resend-container">
      <span class="resend-text">Resend code</span>
      <PrimaryButton disabled={seconds > 0}>
        {#if seconds > 0}
          <div class="timer-container"></div>
          Resend code in {seconds}
        {:else}
          Resend Code
        {/if}
      </PrimaryButton>

      <SecondaryButton onclick={() => navigate('/auth/login')}>Change phone number</SecondaryButton>
    </div>
  </div>

  <button type="submit" bind:this={submitButton} style="display: none;" aria-hidden="true">
    Hidden Submti
  </button>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
    align-items: center;
    > div {
      max-width: 200px;
      text-align: center;
    }
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
