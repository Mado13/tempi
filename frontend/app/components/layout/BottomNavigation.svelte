<script lang="ts">
import PhBriefCase from '~icons/ph/briefcase'
import PhCalendarDots from '~icons/ph/calendar-dots'
import PhUserCircleGear from '~icons/ph/user-circle-gear'
import PhUserFour from '~icons/ph/users-four'

import { router } from '@inertiajs/svelte'

import { m } from '$i18n/paraglide/messages'

let activeTab = $state('agenda')
let { activeRole } = $props()

function fetchData(activeTab: string) {
  router.get(`/${activeRole}/${activeTab}`)
}
</script>

<div class="bottom-navbar">
  <button class={activeTab === 'profile' ? 'active' : ''} onclick={() => fetchData('profile')}>
    <PhUserCircleGear />
    <span>{m.bottom_navigation_profile_button()}</span>
  </button>
  <button class={activeTab === 'agenda' ? 'active' : ''} onclick={() => fetchData('agenda')}>
    <PhCalendarDots />
    <span>{m.bottom_nvigation_agenda_button()}</span>
  </button>
  <button class={activeTab === 'jobs' ? 'active' : ''} onclick={() => fetchData('jobs')}>
    <PhBriefCase />
    <span>{m.bottom_navigation_jobs_button()}</span>
  </button>
  <button class={activeTab === 'team' ? 'active' : ''} onclick={() => fetchData('team')}>
    <PhUserFour />
    <span>{m.bottom_navigation_team_button()}</span>
  </button>
  <button onclick={() => router.post('/toggle-role')} type="button">
    <IconPhUserSwitch />
  </button>
</div>
