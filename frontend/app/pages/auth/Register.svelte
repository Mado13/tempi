<!-- Register.svelte -->

<script lang="ts">
import AuthForm from '$components/auth/AuthForm.svelte'

import { m } from '$i18n/paraglide/messages.js'

import AuthLayout from './AuthLayout.svelte'

const messages = {
  title: m.register_title(),
  submit: m.register_submit_button(),
}
</script>

<AuthLayout>
  <AuthForm postPath="/register/request" {messages} />
</AuthLayout>
