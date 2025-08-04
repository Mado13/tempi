<script lang="ts">
  import { navigate } from '$router'
  import * as v from 'valibot'

  import { api } from '$lib/api'
  import { createForm } from '$lib/forms'

  import Input from '../../lib/components/Input.svelte'
  import PrimaryButton from '../../lib/components/PrimaryButton.svelte'

  const loginSchema = v.object({
    phoneNumber: v.pipe(
      v.string(),
      v.minLength(1, 'Phone number must exist'),
      v.regex(/^05[0-9]{8}$/, 'Phone number must meet expecations'),
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
  <h1>Welcome to Tempi!</h1>
  <p>we are here to connect</p>
</header>
<form onsubmit={form.handleSubmit}>
  <Input
    id="phone-number"
    label="Phone number"
    bind:value={form.phoneNumber}
    error={form.errors.phoneNumber}
    inputmode="numeric"
    autocomplete="tel"
    disabled={form.isSubmitting}
    onblur={() => form.handleBlur('phoneNumber')} />
  <PrimaryButton type="submit">Submit</PrimaryButton>
  <p class="disclaimer">Disclaimer</p>
</form>

<style>
  header {
    text-align: center;
    padding: var(--space-10) var(--space-4) var(--space-8);
    position: relative;
  }

  header h1 {
    font-size: clamp(2.5rem, 8vw, 3.5rem);
    font-weight: var(--font-weight-bold);
    line-height: var(--line-height-tight);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-3) 0;
    letter-spacing: -0.03em;
  }

  header p {
    font-size: var(--font-size-subhead);
    font-weight: var(--font-weight-regular);
    color: var(--color-text-secondary);
    margin: 0;
    line-height: var(--line-height-normal);
    letter-spacing: 0.01em;
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

  .disclaimer {
    font-size: var(--font-size-small);
    color: var(--color-text-tertiary);
    line-height: var(--line-height-loose);
    text-align: center;
    margin-top: var(--space-4);
    padding: 0 var(--space-2);
    opacity: 0.8;
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
  }
</style>
