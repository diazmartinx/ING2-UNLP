<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll, goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageData;

	let modal_dar_de_baja_cliente: HTMLDialogElement | null = null;
	let clienteSeleccionado: typeof data.clientes[number] | null = null;

	let mensajeExito = '';
	let mensajeError = '';
	let terminoBusqueda = data.busqueda || '';
	let showToast = false;

	function abrirModal(cliente: typeof data.clientes[number]) {
		clienteSeleccionado = cliente;
		modal_dar_de_baja_cliente?.showModal();
	}

	function cerrarModal() {
		modal_dar_de_baja_cliente?.close();
		clienteSeleccionado = null;
	}

	function ocultarMensaje() {
		mensajeExito = '';
		mensajeError = '';
	}

	// Función para manejar la búsqueda
	function buscarClientes() {
		
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
			buscarClientes();
		}
	}

	onMount(() => {
		if (data.toast === 'cliente-creado' || data.toast === 'cliente-actualizado') {
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
	<div role="alert" class="alert alert-success mb-1">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		<span>{mensajeExito}</span>
	</div>
{/if}

{#if mensajeError}
	<div role="alert" class="alert alert-error mb-1">
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
				{#if data.toast === 'cliente-creado-sin-email'}
					Cliente creado, pero no se pudo enviar el email
				{:else if data.toast === 'cliente-actualizado'}
					Cliente actualizado exitosamente
				{:else}
					Cliente creado exitosamente
				{/if}
			</span>
		</div>
	</div>
{/if}

<div class="flex">
	<div class="grid grow place-items-start">
		<h2 class="text-3xl font-bold text-gray-800">Clientes</h2>
	</div>
	<div class="grid grow place-items-end">
		<div class="flex flex-col md:flex-row gap-4 mb-6 w-full">
			<div class="flex-[2]">
				<div class="join w-full">
					<input
						type="text"
						name="search"
						placeholder="Buscar por nombre, apellido, DNI o estado..."
						class="input input-bordered join-item w-full"
						bind:value={terminoBusqueda}
						on:keydown={manejarTeclaBusqueda}
					/>
					<button type="button" class="btn join-item" on:click={buscarClientes} aria-label="Buscar">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</button>
					{#if data.busqueda}
						<button type="button" class="btn join-item" on:click={limpiarBusqueda} aria-label="Limpiar búsqueda">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					{/if}
				</div>
			</div>
			<div class="flex gap-2">
				<a href="/admin/clientes/crear" class="btn btn-primary">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Crear Cliente
				</a>
			</div>
		</div>
	</div>
</div>

{#if data.busqueda && data.clientes.length > 0}
	<div role="alert" class="alert mt-4">
  		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info h-6 w-6 shrink-0">
    		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  		</svg>
  		<span>Mostrando resultados para: <strong>"{data.busqueda}"</strong> ({data.clientes.length} cliente{data.clientes.length !== 1 ? 's' : ''} encontrado{data.clientes.length !== 1 ? 's' : ''})</span>
	</div>
{/if}

{#if data.clientes.length === 0}
	<div role="alert" class="alert mt-4">
  		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-info h-6 w-6 shrink-0">
    		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  		</svg>
  		<span>{data.busqueda ? 'No se encontraron clientes que coincidan con la búsqueda' : 'No hay clientes disponibles'}</span>
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
					<th>Estado</th>
					<th>Acciones</th>
				</tr>
			</thead>
			<tbody>
				{#each data.clientes as cliente}
					<tr>
						<td>{cliente.dni}</td>
						<td>{cliente.apellido}</td>
						<td>{cliente.nombre}</td>
						<td>{cliente.email}</td>
						<td>{cliente.estado}</td>
						<td>
							<!-- CAMBIO AQUÍ: Añadido un div con Flexbox -->
							<div class="flex flex-row items-center gap-2">
								<a href={`./clientes/${cliente.id}`} role="button" class="btn btn-soft btn-info">Detalles</a>
								{#if cliente.estado === 'activo'}
								<button on:click={() => abrirModal(cliente)} type="button" class="btn btn-soft btn-error">
									Dar de baja
								</button>
								{:else}
								<form method="POST" action="?/darDeAlta" use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'success') {
											mensajeExito = typeof result.data?.message === 'string' ? result.data.message : 'Cliente dado de alta exitosamente';
											await invalidateAll();
											setTimeout(() => {
												mensajeExito = '';
											}, 2000);
										}
										if (result.type === 'failure') {
											mensajeError = typeof result.data?.error === 'string' ? result.data.error : 'Error al dar de alta el cliente';
											await invalidateAll();
											setTimeout(() => {
												mensajeError = '';
											}, 2000);
										}
									};
								}}>
									<input type="hidden" name="clienteId" value={cliente.id} />
									<button type="submit" class="btn btn-soft btn-success">Dar de alta</button>
								</form>
								{/if}
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<dialog bind:this={modal_dar_de_baja_cliente} id="modal_dar_de_baja_cliente" class="modal">
			<div class="modal-box">
				<h3 class="text-lg font-bold">¿Dar de baja cliente?</h3>
				<p class="py-4">
					¿Está seguro que desea dar de baja al cliente 
					<strong>{clienteSeleccionado?.nombre} {clienteSeleccionado?.apellido}</strong>?
				</p>
				<div class="modal-action">
					<button class="btn" on:click={cerrarModal}>Cancelar</button>
					<form method="POST" action="?/darDeBaja" use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								mensajeExito = typeof result.data?.message === 'string' ? result.data.message : 'Cliente dado de baja exitosamente';
								cerrarModal();
								await invalidateAll();
								setTimeout(() => {
									mensajeExito = '';
								}, 2000);
							}
							if (result.type === 'failure') {
								mensajeError = typeof result.data?.error === 'string' ? result.data.error : 'Error al dar de baja el cliente';
								cerrarModal();
								await invalidateAll();
								setTimeout(() => {
									mensajeError = '';
								}, 2000);
							}
						};
					}}>
						<input type="hidden" name="clienteId" value={clienteSeleccionado?.id} />
						<button type="submit" class="btn btn-soft btn-error">Confirmar</button>
					</form>
				</div>
			</div>
		</dialog>
	</div>
{/if}