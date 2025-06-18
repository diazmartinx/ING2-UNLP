<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	let { data, form } = $props();

	onMount(() => {
		if (form?.success) {
			setTimeout(() => {
				goto('/admin/adicionales');
			}, 1500);
		}
	});
</script>

<div class="container mx-auto p-4 max-w-md">
	<a href="/admin/adicionales" class="link">← Volver a Adicionales</a>
	<h2 class="text-2xl mt-4 mb-6 font-bold text-gray-800">Crear Nuevo Adicional</h2>
	
	<form method="POST" action="?/create" class="space-y-4">
		<div>
			<label class="block font-medium mb-2" for="nombre">
				Nombre del Adicional:
			</label>
			<input
				class="input input-bordered w-full"
				placeholder="Ej: GPS, Silla de bebé, etc."
				name="nombre"
				autocomplete="off"
				required
			/>
		</div>

		<div>
			<label class="block font-medium mb-2" for="cantidadMaxima">
				Cantidad Máxima Disponible:
			</label>
			<input
				type="number"
				class="input input-bordered w-full"
				placeholder="Ej: 10"
				name="cantidadMaxima"
				min="1"
				required
			/>
		</div>

		<div>
			<label class="block font-medium mb-2" for="precioPorDia">
				Precio por Día ($):
			</label>
			<input
				type="number"
				class="input input-bordered w-full"
				placeholder="Ej: 25.50"
				name="precioPorDia"
				min="0.01"
				step="0.01"
				required
			/>
		</div>

		{#if form?.error}
			<div
				class="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
				role="alert"
			>
				<span class="font-medium">Error! </span>
				{form.error}.
			</div>
		{/if}
		
		{#if form?.success}
			<div
				class="rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-gray-800 dark:text-green-400"
				role="alert"
			>
				<span class="font-medium">Éxito! </span>
				{form.message}.
			</div>
		{/if}
		
		<button type="submit" class="btn btn-primary w-full">Crear Adicional</button>
	</form>
</div>

<style>
</style>
