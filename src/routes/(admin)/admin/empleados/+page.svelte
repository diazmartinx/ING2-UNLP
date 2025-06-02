<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;

	let modal_eliminar_empleado: HTMLDialogElement | null = null;
	let empleadoSeleccionado: typeof data.empleado[number] | null = null;

	let mensajeExito = '';
	let mensajeError = '';
	let terminoBusqueda = data.busqueda || '';


	function abrirModal(empleado: typeof data.empleado[number]) {
		empleadoSeleccionado = empleado;
		modal_eliminar_empleado?.showModal();
	}

	function cerrarModal() {
		modal_eliminar_empleado?.close();
		empleadoSeleccionado = null;
	}

	function ocultarMensaje() {
		mensajeExito = '';
		mensajeError = '';
	}

	// Función para manejar la búsqueda
	function buscarEmpleados() {
		const params = new URLSearchParams($page.url.searchParams);
		
		if (terminoBusqueda.trim()) {
			params.set('buscar', terminoBusqueda.trim());
		} else {
			params.delete('buscar');
		}
		
		goto(`?${params.toString()}`, { replaceState: true });
	}

	// Función para limpiar la búsqueda
	function limpiarBusqueda() {
		terminoBusqueda = '';
		const params = new URLSearchParams($page.url.searchParams);
		params.delete('buscar');
		goto(`?${params.toString()}`, { replaceState: true });
	}

	// Manejar Enter en el input de búsqueda
	function manejarTeclaBusqueda(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			buscarEmpleados();
		}
	}
</script>

{#if mensajeExito}
	<div role="alert" class="alert alert-success">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<span>{mensajeExito}</span>
	</div>
{/if}

{#if mensajeError}
	<div role="alert" class="alert alert-error">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<span>{mensajeError}</span>
	</div>
{/if}

<div class="flex">
	<div class="grid grow place-items-start">
		<h2 class="text-3xl font-bold text-gray-800">Empleado</h2>
	</div>
	<div class="grid grow place-items-end">
		<div class="flex gap-2">
			<label class="input input-bordered flex items-center gap-2">
				<svg class="h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
					<g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
						<circle cx="11" cy="11" r="8"></circle>
						<path d="m21 21-4.3-4.3"></path>
					</g>
				</svg>
				<input type="search" bind:value={terminoBusqueda} on:keydown={manejarTeclaBusqueda} placeholder="Buscar por DNI, apellido, nombre o email..." class="grow" />
			</label>
			<button type="button" class="btn btn-primary" on:click={buscarEmpleados}>
				Buscar
			</button>
			{#if data.busqueda}
				<button type="button" class="btn btn-outline" on:click={limpiarBusqueda}>
					Limpiar
				</button>
			{/if}
		</div>
	</div>
</div>

{#if data.busqueda && data.empleado.length > 0}
	<div role="alert" class="alert mt-4">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info h-6 w-6 shrink-0">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
		</svg>
		<span>Mostrando resultados para: <strong>"{data.busqueda}"</strong> ({data.empleado.length} empleado{data.empleado.length !== 1 ? 's' : ''} encontrado{data.empleado.length !== 1 ? 's' : ''})</span>
	</div>
{/if}

{#if data.empleado.length === 0}
	<div role="alert" class="alert mt-4">
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info h-6 w-6 shrink-0">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
		</svg>
		<span>{data.busqueda ? 'No se encontraron empleados que coincidan con la búsqueda' : 'No hay empleados disponibles'}</span>
	</div>

{:else}
	<div class="overflow-x-auto mt-4">
		<table class="table-zebra table">
			<thead>
				<tr>
					<th>DNI</th>
					<th>Apellido</th>
					<th>Nombre</th>
					<th>Email</th>
					<th>Rol</th>
					<th>Acciones</th>
				</tr>
			</thead>
			<tbody>
				{#each data.empleado as empleado}
					<tr>
						<td>{empleado.dni}</td>
						<td>{empleado.apellido}</td>
						<td>{empleado.nombre}</td>
						<td>{empleado.email}</td>
						<td>{empleado.rol}</td>
						<td>
							<a href={`./empleados/${empleado.id}`} role="button" class="btn btn-soft btn-info">Detalles</a>
							<button on:click={() => abrirModal(empleado)} type="button" class="btn btn-soft btn-error" disabled={empleado.rol === 'admin'}>
								Eliminar
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<dialog bind:this={modal_eliminar_empleado} id="modal_eliminar_empleado" class="modal">
			<div class="modal-box">
				<h3 class="text-lg font-bold">¿Eliminar empleado?</h3>
				<p class="py-4">
					¿Está seguro que desea eliminar al empleado 
					<strong>{empleadoSeleccionado?.nombre} {empleadoSeleccionado?.apellido}</strong>?
				</p>
				<div class="modal-action">
					<button class="btn" on:click={cerrarModal}>Cancelar</button>
					<form method="POST" action="?/eliminar" use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								mensajeExito = typeof result.data?.message === 'string' ? result.data.message : 'Empleado eliminado exitosamente';
								cerrarModal();
								await invalidateAll();
								setTimeout(() => {
									mensajeExito = '';
								}, 2000);
							}
							if (result.type === 'failure') {
								mensajeError = typeof result.data?.error === 'string' ? result.data.error : 'Error al eliminar el empleado';
								cerrarModal();
								await invalidateAll();
								setTimeout(() => {
									mensajeError = '';
								}, 2000);
							}
						};
					}}>
						<input type="hidden" name="empleadoId" value={empleadoSeleccionado?.id} />
						<button type="submit" class="btn btn-soft btn-error">Confirmar</button>
					</form>
				</div>
			</div>
		</dialog>
	</div>
{/if}