<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageData;

	let modal_dar_de_baja_empleado: HTMLDialogElement | null = null;
	let empleadoSeleccionado: typeof data.empleado[number] | null = null;

	let mensajeExito = '';
	let mensajeError = '';
	let terminoBusqueda = data.busqueda || '';
	let showToast = false;

	function abrirModal(empleado: typeof data.empleado[number]) {
		empleadoSeleccionado = empleado;
		modal_dar_de_baja_empleado?.showModal();
	}

	function cerrarModal() {
		modal_dar_de_baja_empleado?.close();
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

	onMount(() => {
		if (data.toast === 'empleado-creado' || data.toast === 'empleado-actualizado') {
			showToast = true;
			setTimeout(() => {
				showToast = false;
				const url = new URL(window.location.href);
				url.searchParams.delete('toast');
				window.history.replaceState({}, '', url.pathname + url.search);
			}, 3000);
		}
	});
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

{#if showToast}
	<div class="fixed top-4 right-4 z-50">
		<div class="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded shadow-lg flex items-center gap-2">
			<svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>
				{#if data.toast === 'empleado-creado-sin-email'}
					Empleado creado, pero no se pudo enviar el email
				{:else if data.toast === 'empleado-actualizado'}
					Empleado actualizado exitosamente
				{:else}
					Empleado creado exitosamente
				{/if}
			</span>
		</div>
	</div>
{/if}

<div class="flex">
	<div class="grid grow place-items-start">
		<h2 class="text-3xl font-bold text-gray-800">Empleado</h2>
	</div>
	<div class="flex gap-2">
		<label class="input input-bordered flex items-center gap-2">
			<svg class="h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
				<g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
					<circle cx="11" cy="11" r="8"></circle>
					<path d="m21 21-4.3-4.3"></path>
				</g>
			</svg>
			<input type="search" bind:value={terminoBusqueda} on:keydown={manejarTeclaBusqueda} placeholder="Buscar por DNI, apellido, nombre, email, rol o estado..." class="grow" />
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
	<div class="ml-4">
		<a href="./empleados/crear" role="button" class="btn btn-primary">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Crear empleado
		</a>
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
					<th>Estado</th>
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
						<td>{empleado.estado}</td>
						<td>
							<div class="flex flex-row items-center gap-2">
							<a href={`./empleados/${empleado.id}`} role="button" class="btn btn-soft btn-info">Detalles</a>
							{#if empleado.rol !== 'admin'}
								{#if empleado.estado === 'activo'}
									<button on:click={() => abrirModal(empleado)} type="button" class="btn btn-soft btn-error">
										Dar de baja
									</button>
								{:else}
									<form method="POST" action="?/darDeAlta" use:enhance={() => {
										return async ({ result }) => {
											if (result.type === 'success') {
												mensajeExito = typeof result.data?.message === 'string' ? result.data.message : 'Empleado dado de alta exitosamente';
												await invalidateAll();
												setTimeout(() => {
													mensajeExito = '';
												}, 2000);
											}
											if (result.type === 'failure') {
												mensajeError = typeof result.data?.error === 'string' ? result.data.error : 'Error al dar de alta el empleado';
												await invalidateAll();
												setTimeout(() => {
													mensajeError = '';
												}, 2000);
											}
										};
									}}>
										<input type="hidden" name="empleadoId" value={empleado.id} />
										<button type="submit" class="btn btn-soft btn-success">Dar de alta</button>
									</form>
								{/if}
							{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<dialog bind:this={modal_dar_de_baja_empleado} id="modal_dar_de_baja_empleado" class="modal">
			<div class="modal-box">
				<h3 class="text-lg font-bold">¿Dar de baja empleado?</h3>
				<p class="py-4">
					¿Está seguro que desea dar de baja al empleado 
					<strong>{empleadoSeleccionado?.nombre} {empleadoSeleccionado?.apellido}</strong>?
				</p>
				<div class="modal-action">
					<button class="btn" on:click={cerrarModal}>Cancelar</button>
					<form method="POST" action="?/darDeBaja" use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								mensajeExito = typeof result.data?.message === 'string' ? result.data.message : 'Empleado dado de baja exitosamente';
								cerrarModal();
								await invalidateAll();
								setTimeout(() => {
									mensajeExito = '';
								}, 2000);
							}
							if (result.type === 'failure') {
								mensajeError = typeof result.data?.error === 'string' ? result.data.error : 'Error al dar de baja el empleado';
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