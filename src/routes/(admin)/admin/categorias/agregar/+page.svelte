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
	<form class="" method="POST" action="?/create">
		<label class="mb-2 block text-sm font-medium text-gray-900 dark:text-white" for="nombre">
			Nombre:
		</label>
		<input
			class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
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
