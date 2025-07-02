<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
	let categorias = $state([...data.categorias]);
	let mostrarDialogo = $state(false);
	let categoriaAEliminar: { id: number; nombre: string } | null = $state(null);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	function confirmarEliminacion(categoria: { id: number; nombre: string }) {
		categoriaAEliminar = categoria;
		mostrarDialogo = true;
		error = null;
		success = null;
	}
</script>

<div class="container mx-auto p-4">
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-3xl font-bold text-gray-800">Categorías</h2>
		<button onclick={() => goto('/admin/categorias/agregar')} class="btn btn-primary">
			Crear Nueva Categoría
		</button>
	</div>

	{#if success}
		<div class="mb-4 rounded-lg bg-green-100 p-4 text-sm text-green-700" role="alert">
			<span class="font-medium">Éxito:</span> {success}
		</div>
	{/if}

	{#if error}
		<div class="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-700" role="alert">
			<span class="font-medium">Error:</span> {error}
		</div>
	{/if}

	{#if categorias.length === 0}
		<div class="mb-6 rounded-md border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
			<p class="font-bold">No hay categorías.</p>
		</div>
	{:else}
		<ul class="space-y-4">
			{#each categorias as categoria}
				<li class="flex items-center justify-between rounded-xl bg-white p-4 shadow">
					<span class="text-lg text-gray-700">{categoria.nombre}</span>
					<div class="flex gap-2">
						<button class="btn btn-error" onclick={() => confirmarEliminacion(categoria)}>
							Eliminar
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}

	{#if mostrarDialogo && categoriaAEliminar}
		<dialog class="modal modal-open">
			<div class="modal-box">
				<h3 class="text-lg font-bold">¿Eliminar categoría?</h3>
				<p class="py-4">¿Estás seguro que deseas eliminar la categoría "{categoriaAEliminar.nombre}"?</p>
				<div class="modal-action">
					<form
						method="POST"
						action="?/eliminar"
						use:enhance={() => {
							error = null;
							success = null;
							return async ({ result }) => {
								mostrarDialogo = false;
								if (result.type === 'success' && result.data?.categorias) {
									categorias = Array.isArray(result.data.categorias)
										? result.data.categorias
										: [];
									success = typeof result.data?.message === 'string' ? result.data.message : null;
								} else if (result.type === 'failure') {
									error = typeof result.data?.error === 'string' ? result.data.error : null;
								}
							};
						}}
					>
						<input type="hidden" name="id" value={categoriaAEliminar.id} />
						<button type="button" class="btn mr-2" onclick={() => (mostrarDialogo = false)}>
							Cancelar
						</button>
						<button type="submit" class="btn btn-error">Eliminar</button>
					</form>
				</div>
			</div>
		</dialog>
	{/if}
</div>
