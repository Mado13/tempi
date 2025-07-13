<script lang="ts">
  import { navigate, route } from '$router'

  import Menu from '$lib/components/Menu.svelte'

  const role = $derived(route.params.role as string)
  let { job } = $props()

  const handleEdit = () => {
    navigate('/app/:role/job/:jobId', { params: { role: role, jobId: '1' } })
  }

  const handleDelete = () => {
    console.log('Delet')
  }
</script>

<Menu>
  <li>
    <button onclick={handleEdit}>
      <IconPhNotePencil />
      <span>Edit Listing</span>
    </button>
  </li>
  <li>
    <button onclick={handleDelete}>
      <IconPhTrash />
      <span>Delte listing</span>
    </button>
  </li>
</Menu>
