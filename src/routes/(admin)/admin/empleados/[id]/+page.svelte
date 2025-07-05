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

	let mensajeError = $state('');
	let loading = $state(false);

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
		nombre = data.empleado?.nombre ?? '';
		apellido = data.empleado?.apellido ?? '';
		dni = data.empleado?.dni;
		email = data.empleado?.email ?? '';
		telefono = data.empleado?.telefono ?? '';
		fechaNacimiento = data.empleado?.fechaNacimiento ?? '';
	}
</script>

<div>
	<!-- Botón de volver -->
	<div class="mb-4">
		<a href="/admin/empleados" class="link">
			Volver
		</a>
	</div>


	{#if mensajeError}
		<div class="alert alert-error mt-2">{mensajeError}</div>
	{/if}
    
    <div>
        <form method="POST" action="?/guardar" use:enhance={() => {
			loading = true;
			return async ({ result, update }) => {
				loading = false;
				if (result.type === 'failure') {
					mensajeError = typeof result.data?.error === 'string' ? result.data.error : 'Error al actualizar el empleado';
					setTimeout(() => {
						mensajeError = '';
					}, 3000);
				}
				// Actualizar el formulario con los nuevos datos
				await update();
				nombre = data.empleado?.nombre ?? '';
				apellido = data.empleado?.apellido ?? '';
				dni = data.empleado?.dni;
				email = data.empleado?.email ?? '';
				telefono = data.empleado?.telefono ?? '';
				fechaNacimiento = data.empleado?.fechaNacimiento ?? '';
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
							<button type="submit" class="btn btn-soft btn-primary" disabled={loading}>
								{#if loading}
									<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Guardando...
								{:else}
									Guardar
								{/if}
							</button>
						</div>
						<div class="grid place-items-center mt-1 justify-items-start">
							<button type="button" class="btn btn-soft" onclick={cancelEditing} disabled={loading}>
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
