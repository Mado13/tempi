<script lang="ts">
  import Menu from '$lib/components/Menu.svelte'
</script>

<Menu>
  <li>
    <button>
      <IconPhShareNetwork />
      <span>Share Job</span>
    </button>
  </li>
  <li>
    <button>
      <IconPhBinoculars />
      <span>More from The same</span>
    </button>
  </li>
  <li>
    <button class="destructive">
      <IconPhFlag />
      <span>Report Job</span>
    </button>
  </li>
</Menu>
