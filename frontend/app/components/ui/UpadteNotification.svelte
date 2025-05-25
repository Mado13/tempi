<script>
  import { onMount } from "svelte";

  let updateAvailable = false;

  onMount(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (updateAvailable) {
          window.location.reload();
        }
      });

      setInterval(
        () => {
          navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
              registration.update();
            }
          });
        },
        60 * 60 * 1000,
      ); // Check for updates every hour
    }
  });

  // Function called when user clicks the update button
  function applyUpdate() {
    updateAvailable = true;
    window.location.reload();
  }
</script>

{#if updateAvailable}
  <div class="update-notification">
    New version available!
    <button on:click={applyUpdate}>Update now</button>
  </div>
{/if}
