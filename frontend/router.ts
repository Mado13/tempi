// routes.ts
import Agenda from '$routes/Agenda.svelte'
import AuthLayout from '$routes/AuthLayout.svelte'
import CreateProject from '$routes/CreateProject.svelte'
import EmployerDashboard from '$routes/EmployerDashboard.svelte'
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

import Opportunity from '$lib/components/Opportunity.svelte'

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
    '/employer': {
      '/dashboard': EmployerDashboard,
      '/projects': {
        '/': Projects,
        '/new': CreateProject,
      },
      '/agenda': Agenda,
    },
    '/worker': {
      '/agenda': Agenda,
      '/opportunities': {
        '/': Opportunities,
        '/:opportunity': Opportunity,
      },
    },
    '/:role': {
      '/profile': Profile,
      '/team': Team,
    },
    '/select-role': SelectRole,
    '/profile': Profile,
  },
  '*': NotFound,
})
