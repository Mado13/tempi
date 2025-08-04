// routes.ts
import Agenda from '$routes/Agenda.svelte'
import AuthLayout from '$routes/AuthLayout.svelte'
import CreateProject from '$routes/CreateProject.svelte'
import Jobs from '$routes/Jobs.svelte'
import Layout from '$routes/Layout.svelte'
import NotFound from '$routes/Notfound.svelte'
import Opportunities from '$routes/Opportunities.svelte'
import Profile from '$routes/Profile.svelte'
import Projects from '$routes/Projects.svelte'
import RedirectToApp from '$routes/RedirectToApp.svelte'
import SelectRole from '$routes/SelectRole.svelte'
import Team from '$routes/Team.svelte'
import Login from '$routes/auth/Login.svelte'
import Verify from '$routes/auth/Verify.svelte'
import { createRouter } from 'sv-router'

import * as snackbar from '$lib/snackbar/snackbar.service.svelte'

export const { p, navigate, isActive, route } = createRouter({
  '/': {
    '/': RedirectToApp,
  },
  '/auth': {
    layout: AuthLayout,
    '/login': Login,
    '/verify': Verify,
  },
  '/app': {
    layout: Layout,
    hooks: {
      afterLoad() {
        snackbar.processPendingMessage()
      },
    },
    '/employer': {
      '/projects': {
        '/': Projects,
        '/new': CreateProject,
      },
      '/agenda': Agenda,
    },
    '/worker': {
      '/opportunities': Opportunities,
    },
    '/:role': {
      '/profile': Profile,
      '/team': Team,
      '/jobs': Jobs,
      '/job': {
        '/new': CreateProject,
      },
    },
    '/select-role': SelectRole,
    '/profile': Profile,
  },
  '*': NotFound,
})
