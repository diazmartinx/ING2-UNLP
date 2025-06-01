<!-- +page.svelte -->

<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData, ActionData } from './$types';

	const { data, form } = $props<{ data: PageData; form: ActionData }>();

	let nombre = $state(data.cliente?.nombre ?? '');
	let apellido = $state(data.cliente?.apellido ?? '');
	let dni = $state(data.cliente?.dni);
	let email = $state(data.cliente?.email ?? '');
	let telefono = $state(data.cliente?.telefono ?? '');
	let fechaNacimiento = $state(data.cliente?.fechaNacimiento ?? '');

	let mensajeExito = $state('');
	let mensajeError = $state('');

	// Estado para controlar si está en modo edición
	let isEditing = $state(false);

	// Función para activar modo edición
	function enableEditing() {
		isEditing = true;
	}

	// Función para cancelar edición y restaurar valores originales
	function cancelEditing() {
		isEditing = false;
		// Restaurar valores originales
		nombre = data.cliente?.nombre ?? '';
		apellido = data.cliente?.apellido ?? '';
		dni = data.cliente?.dni;
		email = data.cliente?.email ?? '';
		telefono = data.cliente?.telefono ?? '';
		fechaNacimiento = data.cliente?.fechaNacimiento ?? '';
	}
</script>

<div>
	{#if mensajeExito}
		<div class="alert alert-success mt-2">{mensajeExito}</div>
	{/if}
	{#if mensajeError}
		<div class="alert alert-error mt-2">{mensajeError}</div>
	{/if}
    <div>
        <form method="POST" action="?/guardar" use:enhance={() => {
			return async ({ result, update }) => {
				// Invalidar datos si la operación fue exitosa
				if (result.type === 'success') {
					await invalidateAll();
					// Desactivar modo edición después de guardar exitosamente
					isEditing = false;
					mensajeExito = typeof result.data?.message === 'string' ? result.data.message : 'Cliente eliminado exitosamente';
					setTimeout(() => {
						mensajeExito = '';
					}, 3000);
				}
				if (result.type === 'failure') {
					mensajeError = typeof result.data?.error === 'string' ? result.data.error : 'Error al eliminar el cliente';
					setTimeout(() => {
						mensajeError = '';
					}, 3000);
				}
				// Actualizar el formulario con los nuevos datos
				await update();
				nombre = data.cliente?.nombre ?? '';
				apellido = data.cliente?.apellido ?? '';
				dni = data.cliente?.dni;
				email = data.cliente?.email ?? '';
				telefono = data.cliente?.telefono ?? '';
				fechaNacimiento = data.cliente?.fechaNacimiento ?? '';
			};
		}}
	>
		    <div class="flex w-full">
                <div class="grid grow">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Nombre (*)</legend>
                        
                        <input type="text" class="input validator" name="nombre" bind:value={nombre} disabled={!isEditing} required />

                        <legend class="fieldset-legend">Apellido (*)</legend>
                        <input type="text" class="input validator" name="apellido" bind:value={apellido} disabled={!isEditing} required />

                        <legend class="fieldset-legend">DNI (*)</legend>
                        <input type="text" class="input validator" name="dni" bind:value={dni} disabled required />

                        <legend class="fieldset-legend">Email (*)</legend>
                        <input type="email" class="input validator" name="email" bind:value={email} disabled={!isEditing} required />

                        <legend class="fieldset-legend">Teléfono</legend>
                        <input type="number" class="input validator" name="telefono" bind:value={telefono} disabled={!isEditing} />

                        <legend class="fieldset-legend">Fecha de Nacimiento (*)</legend>
                        <input type="date" class="input" name="fechaNacimiento" bind:value={fechaNacimiento} disabled={!isEditing} required />
                    </fieldset>
                </div>

			    <div class="grid grow place-items-center justify-items-start">
				    {#if !isEditing}
					<!-- Botón Editar cuando no está en modo edición -->
					<button type="button" class="btn btn-soft btn-secondary" onclick={enableEditing}> Actualizar Datos </button>
				    {:else}
					<div class="flex w-full flex-col">
						<div class="grid place-items-center mb-1 justify-items-start"><button type="submit" class="btn btn-soft btn-primary"> Guardar </button></div>

						<div class="grid place-items-center mt-1 justify-items-start"><button type="button" class="btn btn-soft " onclick={cancelEditing}> Cancelar </button></div>
					</div>
					<!-- Botones Guardar y Cancelar cuando está en modo edición -->
				    {/if}
			    </div>
		    </div>
	    </form>
    </div>
</div>
