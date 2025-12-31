<script lang="ts">
  import '../app.css'; // si ton app.css est ailleurs, ajuste le chemin
  let { children } = $props();
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

{@render children()}
