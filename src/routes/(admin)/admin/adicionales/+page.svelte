<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();
	let adicionales = $state([...data.adicionales]);
	let editando: { id: number; nombre: string; precioPorDia: number } | null = $state(null);
	let error = $state('');
	let mostrarDialogo = $state(false);
	let adicionalAEliminar: { id: number; nombre: string; precioPorDia: number } | null = $state(null);

	function iniciarEdicion(adicional: { id: number; nombre: string; precioPorDia: number }) {
		adicionalAEliminar = null;
		editando = { id: adicional.id, nombre: adicional.nombre, precioPorDia: adicional.precioPorDia };
	}

	function cancelarEdicion() {
		editando = null;
		error = '';
	}

	function confirmarEliminacion(adicional: { id: number; nombre: string; precioPorDia: number }) {
		adicionalAEliminar = adicional;
		mostrarDialogo = true;
	}
</script>

<div class="container mx-auto p-4">
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-3xl font-bold text-gray-800">Adicionales</h2>
		<button onclick={() => goto('/admin/adicionales/agregar')} class="btn btn-primary">
			Crear Nuevo Adicional
		</button>
	</div>

	{#if error}
		<div class="mb-6 rounded-md border-l-4 border-red-500 bg-red-100 p-4 text-red-700">
			<p class="font-bold">{error}</p>
		</div>
	{/if}

	{#if adicionales.length === 0}
		<div class="mb-6 rounded-md border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
			<p class="font-bold">No hay adicionales.</p>
		</div>
	{:else}
		<ul class="space-y-4">
			{#each adicionales as adicional}
				<li class="flex items-center justify-between rounded-xl bg-white p-4 shadow">
					{#if editando?.id === adicional.id}
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
									if (result.type === 'success' && result.data?.adicionales) {
										adicionales = Array.isArray(result.data.adicionales) ? result.data.adicionales : [];
										editando = null;
										error = '';
									}
								};
							}}
						>
							<input type="hidden" name="id" value={adicional.id} />
							<div class="flex gap-2 flex-1">
								<span class="text-lg text-gray-700 font-medium">{editando?.nombre}</span>
								<input
									type="number"
									name="precioPorDia"
									class="input input-bordered w-32"
									value={editando?.precioPorDia ?? 0}
									placeholder="Precio"
									step="0.01"
								/>
							</div>
							<div class="flex gap-2">
								<button type="submit" class="btn btn-primary">Guardar</button>
								<button type="button" class="btn" onclick={cancelarEdicion}>Cancelar</button>
							</div>
						</form>
					{:else}
						<div class="flex-1">
							<span class="text-lg text-gray-700 font-medium">{adicional.nombre}</span>
							<div class="text-sm text-gray-500">
								Precio por día: ${adicional.precioPorDia}
							</div>
						</div>
						<div class="flex gap-2">
							<button onclick={() => iniciarEdicion(adicional)} class="btn btn-primary">
								Editar
							</button>
							<button class="btn btn-error" onclick={() => confirmarEliminacion(adicional)}>
								Eliminar
							</button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	{#if mostrarDialogo && adicionalAEliminar}
		<dialog class="modal modal-open">
			<div class="modal-box">
				<h3 class="text-lg font-bold">¿Eliminar adicional?</h3>
				<p class="py-4">¿Estás seguro que deseas eliminar el adicional "{adicionalAEliminar.nombre}"?</p>
				<div class="modal-action">
					<form
						method="POST"
						action="?/eliminar"
						use:enhance={() => {
							return async ({ result }) => {
								mostrarDialogo = false;
								if (result.type === 'success' && result.data?.adicionales) {
									adicionales = Array.isArray(result.data.adicionales) ? result.data.adicionales : [];
								}
							};
						}}
					>
						<input type="hidden" name="id" value={adicionalAEliminar.id} />
						<button type="button" class="btn mr-2" onclick={() => mostrarDialogo = false}>Cancelar</button>
						<button type="submit" class="btn btn-error">Eliminar</button>
					</form>
				</div>
			</div>
		</dialog>
	{/if}
</div>
