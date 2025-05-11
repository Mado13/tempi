<!-- AuthForm.svelte -->

<script lang="ts">
import { useForm } from '@inertiajs/svelte'
import * as v from 'valibot'
import { m } from '$paraglide/messages'

type AuthFormData = v.InferInput<typeof authFormSchema>

const { postPath, messages } = $props<{
  postPath: string
  messages: {
    title: string
    submit: string
  }
}>()

const authFormSchema = v.object({
  phoneNumber: v.pipe(
    v.string(),
    v.minLength(1, m.login_phone_required()),
    v.regex(/^05[0-9]{8}$/, m.login_phone_format()),
  ),
})

const form = useForm<AuthFormData>({
  phoneNumber: '',
})

function submit(e: SubmitEvent) {
  e.preventDefault()

  const result = v.safeParse(authFormSchema, $form.data())

  if (result.success) {
    $form.post(postPath)
  } else {
    for (const issue of result.issues) {
      const fieldName = issue.path?.[0]?.key as keyof AuthFormData
      if (!$form.errors[fieldName as keyof AuthFormData]) {
        $form.setError(fieldName as keyof AuthFormData, issue.message)
      }
    }
  }
}
</script>

<h1>{messages.title}</h1>
<form onsubmit={submit}>
  <input
    type="tel"
    bind:value={$form.phoneNumber}
    class:error={$form.errors.phoneNumber}
    oninput={() => $form.clearErrors('phoneNumber')}
    placeholder="05XXXXXXXX"
    autocomplete="tel"
  />
  <div class="form-error">{$form.errors.phoneNumber}</div>
  <button type="submit" disabled={$form.processing}>{messages.submit}</button>
</form>
