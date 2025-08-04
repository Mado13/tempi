<script lang="ts">
  import { navigate, route } from '$router'
  import { Interval, watch } from 'runed'
  import { searchParams } from 'sv-router'
  import * as v from 'valibot'

  import { api } from '$lib/api'
  import Input from '$lib/components/Input.svelte'
  import PrimaryButton from '$lib/components/PrimaryButton.svelte'
  import SecondaryButton from '$lib/components/SecondaryButton.svelte'
  import { createForm } from '$lib/forms'
  import { authStore } from '$lib/stores/auth.store.svelte'

  let submitButton: HTMLButtonElement

  // simple resend timer (30s)
  const timer = new Interval(1000)
  let seconds = $derived(Math.max(0, 30 - timer.counter))

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
      const res = await api.post('/auth/verify_code', data)
      if (!res.success || !res.data) throw res

      const { user, token } = res.data
      await authStore.login(token, user)

      if (!user.currentRole) {
        navigate('/app/select-role', { replace: true })
      } else {
        navigate('/app/employer/agenda', { replace: true })
      }
    },
  })

  // auto-submit when 6 digits entered
  watch(
    () => form.code,
    () => {
      if (form.code.length === 6) submitButton?.click()
    },
  )
</script>

<header>
  <h1>Verify Code</h1>
  <p>Code was sent to: {form.phoneNumber}</p>
  <p>Your auth code: {initialCode}</p>
</header>
<form onsubmit={form.handleSubmit}>
  <div class="otp-container">
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
          Resend code in {seconds}
        {:else}
          Resend Code
        {/if}
      </PrimaryButton>
      <SecondaryButton onclick={() => navigate('/auth/login')}>Change phone number</SecondaryButton>
    </div>
  </div>
  <button type="submit" bind:this={submitButton} style="display: none;" aria-hidden="true">
    Hidden Submit
  </button>
</form>

<style>
  header {
    text-align: center;
    padding: var(--space-10) var(--space-4) var(--space-8);
    position: relative;
  }

  header h1 {
    font-size: clamp(2rem, 6vw, 2.5rem);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-4) 0;
    letter-spacing: -0.02em;
  }

  header p {
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-regular);
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-2) 0;
    line-height: var(--line-height-normal);
  }

  header p:last-child {
    font-size: var(--font-size-caption);
    color: var(--color-text-tertiary);
    font-family: monospace;
    background: var(--color-background-elevated);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-default);
    display: inline-block;
    margin-top: var(--space-3);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    max-width: 400px;
    width: 100%;
    margin: 0 auto;
    padding: var(--space-8);

    /* Enhanced glassmorphism */
    background: var(--glass-bg-light);
    backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-2xl);
    box-shadow: var(--glass-shadow);
  }

  .otp-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .auth-form-group {
    width: 100%;
  }

  .resend-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4) 0;
  }

  .resend-text {
    font-size: var(--font-size-caption);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  @media (max-height: 667px) {
    header {
      padding: var(--space-6) var(--space-4) var(--space-4);
    }

    header h1 {
      font-size: var(--font-size-title);
    }

    form {
      padding: var(--space-6);
      gap: var(--space-4);
    }

    .resend-container {
      gap: var(--space-3);
      padding: var(--space-3) 0;
    }
  }
</style>
