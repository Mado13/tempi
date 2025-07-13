<script lang="ts">
  import { navigate } from '$router'
  import * as v from 'valibot'

  import { api } from '$lib/api'
  import { createForm } from '$lib/forms'
  import { m } from '$lib/i18n/messages'

  import Input from '../../lib/components/Input.svelte'
  import PrimaryButton from '../../lib/components/PrimaryButton.svelte'

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
    async onSubmit(formData) {
      const response = await api.post('/auth/send_code', formData)

      if (response.success) {
        navigate('/auth/verify', { state: form.phoneNumber, search: `?code=${response.data.code}` })
      } else {
        throw response
      }
    },
  })
</script>

<header>
  <h1>{m['auth.login.title']()}</h1>
  <p>subtitle</p>
</header>

<form onsubmit={form.handleSubmit}>
  <Input
    id="phone-number"
    label={m['auth.login.label']()}
    bind:value={form.phoneNumber}
    error={form.errors.phoneNumber}
    inputmode="numeric"
    autocomplete="tel"
    disabled={form.isSubmitting}
    onblur={() => form.handleBlur('phoneNumber')} />

  <PrimaryButton type="submit">
    {m['auth.login.submit']()}
  </PrimaryButton>

  <p class="disclaimer">Disclaimer</p>
</form>

<style>
  .disclaimer {
    font-size: var(--font-size-label-s);
    color: var(--color-text-secondary);
    line-height: 1.5;
    text-align: center;
    margin-top: var(--spacing-m);
    padding: 0 var(--spacing-s);
  }
</style>
