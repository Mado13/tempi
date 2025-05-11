<script lang="ts">
import { router } from '@inertiajs/svelte'
import { Button } from 'bits-ui'
import PhBriefCase from '~icons/ph/briefcase'
import PhCalendarDots from '~icons/ph/calendar-dots'
import PhUserCircleGear from '~icons/ph/user-circle-gear'
import PhUserFour from '~icons/ph/users-four'
import { m } from '$paraglide/messages'

let activeTab = $state('agenda')
let { activeRole } = $props()

function fetchData(activeTab: string) {
  router.get(`/${activeRole}/${activeTab}`)
}
</script>

<div class="bottom-navbar">
  <Button.Root class={activeTab === 'profile' ? 'active' : ''} onclick={() => fetchData('profile')}>
    <PhUserCircleGear />
    <span>{m.bottom_navigation_profile_button()}</span>
  </Button.Root>
  <Button.Root class={activeTab === 'agenda' ? 'active' : ''} onclick={() => fetchData('agenda')}>
    <PhCalendarDots />
    <span>{m.bottom_nvigation_agenda_button()}</span>
  </Button.Root>
  <Button.Root class={activeTab === 'jobs' ? 'active' : ''} onclick={() => fetchData('jobs')}>
    <PhBriefCase />
    <span>{m.bottom_navigation_jobs_button()}</span>
  </Button.Root>
  <Button.Root class={activeTab === 'team' ? 'active' : ''} onclick={() => fetchData('team')}>
    <PhUserFour />
    <span>{m.bottom_navigation_team_button()}</span>
  </Button.Root>
</div>

<style lang="scss">
.bottom-navbar {
  display: flex;
  height: 3.5rem;
  justify-content: space-around;
  align-items: center;
  background: white;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  min-width: 100vw;
  margin: 0 auto;
  z-index: 100;

  :global {
    [data-button-root] {
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

      svg {
        font-size: 1.5rem;
        margin-bottom: 0.25rem;
      }

      span {
        font-size: 0.75rem;
      }
    }
  }
}
</style>
