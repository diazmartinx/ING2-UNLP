<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData, ActionData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let modal_eliminar_cliente: HTMLDialogElement | null = null;
	let clienteSeleccionado: typeof data.clientes[number] | null = null;

	let mensajeExito = '';
    let mensajeError = '';
    

	function abrirModal(cliente: typeof data.clientes[number]) {
		clienteSeleccionado = cliente;
		modal_eliminar_cliente?.showModal();
	}

	function cerrarModal() {
		modal_eliminar_cliente?.close();
		clienteSeleccionado = null;
	}

	function ocultarMensaje() {
		mensajeExito = '';
        mensajeError = '';
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
{#if data.clientes.length === 0}
	<div class="alert alert-info shadow-lg">
		<div>
			<span>No hay clientes disponibles</span>
		</div>
	</div>
{:else}
	<div class="overflow-x-auto">
		<table class="table-zebra table">
			<thead>
				<tr>
					<th>DNI</th>
					<th>Apellido</th>
					<th>Nombre</th>
					<th>Email</th>
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
						<td>
							<a href={`./clientes/${cliente.id}`} role="button" class="btn btn-soft btn-disabled">Detalles</a>
							<button
								on:click={() => abrirModal(cliente)}
								type="button"
								class="btn btn-soft btn-error">Eliminar
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<dialog bind:this={modal_eliminar_cliente} id="modal_eliminar_cliente" class="modal">
			<div class="modal-box">
				<h3 class="text-lg font-bold">¿Eliminar cliente?</h3>
				<p class="py-4">
					¿Está seguro que desea eliminar al cliente 
					<strong>{clienteSeleccionado?.nombre} {clienteSeleccionado?.apellido}</strong>?
				</p>
				<div class="modal-action">
					<button class="btn" on:click={cerrarModal}>Cancelar</button>
					<form method="POST" action="?/eliminar" use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'success') {
								mensajeExito = typeof result.data?.message === 'string' ? result.data.message : 'Cliente eliminado exitosamente';
								cerrarModal();
								await invalidateAll();
								setTimeout(() => {
									mensajeExito = '';
								}, 2000);
							}
							if (result.type === 'failure') {
								mensajeError = typeof result.data?.error === 'string' ? result.data.error : 'Error al eliminar el cliente';
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

