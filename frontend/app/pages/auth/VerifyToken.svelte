<script lang="ts">
import { useForm } from '@inertiajs/svelte'
import { PinInput } from 'melt/builders'

import { m } from '$paraglide/messages'

import AuthLayout from './AuthLayout.svelte'

const { phoneNumber, postPath } = $props()

const form = useForm({
  code: '',
  phoneNumber: phoneNumber,
})
const pinInput = new PinInput({
  type: 'numeric',
  maxLength: 6,
  value: () => $form.code,
  onValueChange: v => ($form.code = v),
  onComplete: () => {
    $form.post(postPath, { onStart: () => $form.reset('code') })
  },
})
</script>

<AuthLayout>
  <h1>{m.verify_code_title()}</h1>
  <form {...pinInput.root}>
    {#each pinInput.inputs as input}
      <input {...input} />
    {/each}
  </form>
  <div class="form-error" class:hidden={!$form.errors.code}>{$form.errors.code}</div>
</AuthLayout>

<style lang="scss">
form {
  .form-error.hidden {
    visibility: hidden;
  }
  .form-error {
    align-self: center;
  }
}
</style>
