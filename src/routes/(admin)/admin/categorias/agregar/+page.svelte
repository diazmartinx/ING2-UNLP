<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	let { data, form } = $props();

	onMount(() => {
		if (form?.success) {
			setTimeout(() => {
				goto('/admin/categorias');
			}, 1500);
		}
	});
</script>

<div>
	<a href="/admin/categorias" class="link">Volver</a>
	<h2 class="text-xl mt-2 font-bold text-gray-800">Crear Categoría</h2>
	<form class="" method="POST" action="?/create">
		<label class="mb-2 block font-medium " for="nombre">
			Nombre:
		</label>
		<input
			class="input"
			placeholder="Descapotable"
			name="nombre"
			autocomplete="off"
			required
		/>
		{#if form?.error}
			<div
				class="mt-2 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
				role="alert"
			>
				<span class="font-medium">Error! </span>
				{form.error}.
			</div>
		{/if}
		{#if form?.success}
			<div
				class="mt-2 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-gray-800 dark:text-green-400"
				role="alert"
			>
				<span class="font-medium">Éxito! </span>
				{form.message}.
			</div>
		{/if}
		<button type="submit" class="btn btn-primary mt-4 w-full"> Crear Categoría </button>
	</form>
</div>

<style>
</style>
