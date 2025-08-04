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
        navigate('/app/:role/agenda', { params: { role: user.currentRole }, replace: true })
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
  form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-m);
    align-items: center;
  }
  form > div {
    max-width: 200px;
    text-align: center;
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
</style>
