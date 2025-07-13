import AddJob from '$routes/AddJob.svelte'
import Agenda from '$routes/Agenda.svelte'
import AuthLayout from '$routes/AuthLayout.svelte'
import Home from '$routes/Home.svelte'
import Jobs from '$routes/Jobs.svelte'
import Layout from '$routes/Layout.svelte'
import NotFound from '$routes/Notfound.svelte'
import Profile from '$routes/Profile.svelte'
import RedirectToApp from '$routes/RedirectToApp.svelte'
import SelectRole from '$routes/SelectRole.svelte'
import Team from '$routes/Team.svelte'
import Login from '$routes/auth/Login.svelte'
import Verify from '$routes/auth/Verify.svelte'
import { createRouter } from 'sv-router'

import { api } from '$lib/api'
import { setCurrentUser } from '$lib/stores/user.svelte'
import { authService } from '$lib/utils/auth.svelte'

const authGuard = async () => {
  const isLoggedIn = await authService.checkAuth()
  if (!isLoggedIn) {
    throw navigate('/auth/login')
  }

  const response = await api.get('/user/me')
  if (!response.success) {
    throw navigate('/auth/login')
  }

  const user = response.data.user
  setCurrentUser(user)

  const entryPoint = user.currentRole ? `/app/${user.currentRole}/agenda` : '/app/select-role'
  throw navigate(entryPoint)
}

export const { p, navigate, isActive, route } = createRouter({
  '/': {
    '/': RedirectToApp,
    hooks: {
      beforeLoad: authGuard,
    },
  },
  '/auth': {
    layout: AuthLayout,
    '/login': Login,
    '/verify': Verify,
  },
  '/app': {
    layout: Layout,
    '/': Home,
    '/:role': {
      '/agenda': Agenda,
      '/profile': Profile,
      '/team': Team,
      '/jobs': {
        '/': Jobs,
        '/new': AddJob,
      },
    },
    '/select-role': SelectRole,
    '/profile': Profile,
  },
  '*': NotFound,
})
