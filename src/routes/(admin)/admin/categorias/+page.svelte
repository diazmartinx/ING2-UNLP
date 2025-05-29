<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
	let categorias = $state([...data.categorias]);
	let editando: { id: number; nombre: string } | null = $state(null);
	let error = $state('');
	let mostrarDialogo = $state(false);
	let categoriaAEliminar: { id: number; nombre: string } | null = $state(null);

	function iniciarEdicion(categoria: { id: number; nombre: string }) {
		editando = { ...categoria };
	}

	function cancelarEdicion() {
		editando = null;
		error = '';
	}

	function confirmarEliminacion(categoria: { id: number; nombre: string }) {
		categoriaAEliminar = categoria;
		mostrarDialogo = true;
	}
</script>

<div class="container mx-auto p-4">
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-3xl font-bold text-gray-800">Categorías</h2>
		<button onclick={() => goto('/admin/categorias/agregar')} class="btn btn-primary">
			Crear Nueva Categoría
		</button>
	</div>

	{#if error}
		<div class="mb-6 rounded-md border-l-4 border-red-500 bg-red-100 p-4 text-red-700">
			<p class="font-bold">{error}</p>
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
					{#if editando?.id === categoria.id}
						<form
							method="POST"
							action="?/editar"
							class="flex w-full items-center justify-between gap-2"
							use:enhance={() => {
								return async ({ result }) => {
									if (result.type === 'failure') {
										error = String(result.data?.error ?? '');
										return;
									}
									if (result.type === 'success' && result.data?.categorias) {
										categorias = Array.isArray(result.data.categorias) ? result.data.categorias : [];
										editando = null;
										error = '';
									}
								};
							}}
						>
							<input type="hidden" name="id" value={categoria.id} />
							<input
								type="text"
								name="nombre"
								class="input input-bordered w-full"
								value={editando.nombre}
							/>
							<div class="flex gap-2">
								<button type="submit" class="btn btn-primary">Guardar</button>
								<button type="button" class="btn" onclick={cancelarEdicion}>Cancelar</button>
							</div>
						</form>
					{:else}
						<span class="text-lg text-gray-700">{categoria.nombre}</span>
						<div class="flex gap-2">
							<button onclick={() => iniciarEdicion(categoria)} class="btn btn-primary">
								Editar
							</button>
							<button class="btn btn-error" onclick={() => confirmarEliminacion(categoria)}>
								Eliminar
							</button>
						</div>
					{/if}
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
							return async ({ result }) => {
								mostrarDialogo = false;
								if (result.type === 'success' && result.data?.categorias) {
									categorias = Array.isArray(result.data.categorias) ? result.data.categorias : [];
								}
							};
						}}
					>
						<input type="hidden" name="id" value={categoriaAEliminar.id} />
						<button type="button" class="btn mr-2" onclick={() => mostrarDialogo = false}>Cancelar</button>
						<button type="submit" class="btn btn-error">Eliminar</button>
					</form>
				</div>
			</div>
		</dialog>
	{/if}
</div>
