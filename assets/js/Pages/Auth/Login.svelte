<!-- Login.svelte -->

<script lang="ts">
import { Link } from '@inertiajs/svelte'
import AuthForm from '../../Components/AuthForm.svelte'
import AuthLayout from './AuthLayout.svelte'
import { m } from '$paraglide/messages.js'

const messages = {
  title: m.login_welcome_title(),
  submit: m.login_submit_button(),
}
</script>

<AuthLayout>
  <AuthForm postPath="/login/request" {messages} />
  <Link href="/register">{m.login_link_to_register()}</Link>
</AuthLayout>
