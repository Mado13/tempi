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
</div>

<style lang="scss">
.bottom-navbar {
  display: flex;
  height: $navbar-height;
  justify-content: space-around;
  align-items: center;
  background: white;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  bottom: env(safe-area-inset-bottom, 0);
  min-width: 100vw;
  margin: 0 auto;
  z-index: $z-index-navbar;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0));

  button {
    -webkit-tap-highlight-color: transparent;
    background: transparent;
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    flex: 1;
    cursor: pointer;

    &.active {
      color: red;
    }

    span {
      font-size: 0.75rem;
    }
  }
}
</style>
