<!-- +page.svelte -->

<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	const { data } = $props<{ data: PageData }>();

	let nombre = $state(data.empleado?.nombre ?? '');
	let apellido = $state(data.empleado?.apellido ?? '');
	let dni = $state(data.empleado?.dni);
	let email = $state(data.empleado?.email ?? '');
	let telefono = $state(data.empleado?.telefono ?? '');
	let fechaNacimiento = $state(data.empleado?.fechaNacimiento ?? '');

	let mensajeExito = $state('');
	let mensajeError = $state('');

	// Estado para controlar si está en modo edición
	let isEditing = $state(false);

	// Función helper para restaurar valores originales
	function restaurarValoresOriginales() {
		nombre = data.empleado?.nombre ?? '';
		apellido = data.empleado?.apellido ?? '';
		dni = data.empleado?.dni;
		email = data.empleado?.email ?? '';
		telefono = data.empleado?.telefono ?? '';
		fechaNacimiento = data.empleado?.fechaNacimiento ?? '';
	}

	// Función para activar modo edición
	function enableEditing() {
		isEditing = true;
	}

	// Función para cancelar edición y restaurar valores originales
	function cancelEditing() {
		isEditing = false;
		restaurarValoresOriginales();
	}
</script>

<div>
	<!-- Botón de volver -->
	<div class="mb-4">
		<a href="/admin/empleados" class="link">
			Volver
		</a>
	</div>

	{#if mensajeExito}
		<div class="alert alert-success mt-2">{mensajeExito}</div>
	{/if}
	{#if mensajeError}
		<div class="alert alert-error mt-2">{mensajeError}</div>
	{/if}
    
    <div>
        <form method="POST" action="?/guardar" use:enhance={() => {
			return async ({ result, update }) => {
				// Limpiar mensajes anteriores
				mensajeExito = '';
				mensajeError = '';
				
				// Invalidar datos si la operación fue exitosa
				if (result.type === 'success') {
					await invalidateAll();
					// Desactivar modo edición después de guardar exitosamente
					isEditing = false;
					mensajeExito = typeof result.data?.message === 'string' ? result.data.message : 'Empleado actualizado exitosamente';
					setTimeout(() => {
						mensajeExito = '';
					}, 3000);
					// Actualizar el formulario con los nuevos datos solo en caso de éxito
					await update();
					restaurarValoresOriginales();
				}
				if (result.type === 'failure') {
					mensajeError = typeof result.data?.error === 'string' ? result.data.error : 'Error al actualizar el empleado';
					setTimeout(() => {
						mensajeError = '';
					}, 3000);
					// No actualizar el formulario en caso de error para mantener los datos ingresados
				}
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
                        <input type="hidden" name="dni" bind:value={dni} />
                        <div class="input validator" style="background-color: #f3f4f6; color: #6b7280;">
                            {dni}
                        </div>

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
					<button type="button" class="btn btn-soft btn-secondary" onclick={enableEditing}>
						Actualizar Datos
					</button>
				    {:else}
					<div class="flex w-full flex-col">
						<div class="grid place-items-center mb-1 justify-items-start">
							<button type="submit" class="btn btn-soft btn-primary">
								Guardar
							</button>
						</div>
						<div class="grid place-items-center mt-1 justify-items-start">
							<button type="button" class="btn btn-soft" onclick={cancelEditing}>
								Cancelar
							</button>
						</div>
					</div>
				    {/if}
			    </div>
		    </div>
	    </form>
    </div>
</div>
