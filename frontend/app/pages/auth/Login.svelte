<!-- Login.svelte -->

<script lang="ts">
import { Link } from '@inertiajs/svelte'

import AuthForm from '$components/auth/AuthForm.svelte'

import { m } from '$i18n/paraglide/messages.js'

import AuthLayout from './AuthLayout.svelte'

const messages = {
  title: m.login_welcome_title(),
  submit: m.login_submit_button(),
}
</script>

<AuthLayout>
  <AuthForm postPath="/login/request" {messages} />
  <Link href="/register">{m.login_link_to_register()}</Link>
</AuthLayout>
