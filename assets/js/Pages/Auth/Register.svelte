<!-- Register.svelte -->

<script lang="ts">
import AuthForm from '../../Components/AuthForm.svelte'
import AuthLayout from './AuthLayout.svelte'
import { m } from '$paraglide/messages.js'

const messages = {
  title: m.register_title(),
  submit: m.register_submit_button(),
}
</script>

<AuthLayout>
  <AuthForm postPath="/register/request" {messages} />
</AuthLayout>
