<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData, ActionData } from './$types';

	const { data, form } = $props<{ data: PageData; form: ActionData }>();

	let nombre = $state(data.cliente?.nombre ?? '');
	let apellido = $state(data.cliente?.apellido ?? '');
	let dni = $state(data.cliente?.dni ?? '');
	let email = $state(data.cliente?.email ?? '');
	let telefono = $state(data.cliente?.telefono ?? '');

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
		dni = data.cliente?.dni ?? '';
		email = data.cliente?.email ?? '';
		telefono = data.cliente?.telefono ?? '';
	}
</script>

<div>
	{#if form?.success}
		<div class="alert alert-success mt-2">
			{form.message}
		</div>
	{/if}
	{#if form?.error}
		<div class="alert alert-error mt-2">
			{form.error}
		</div>
	{/if}

	<form method="POST" action="?/guardar"
		use:enhance={() => {
			return async ({ result, update }) => {
				// Invalidar datos si la operación fue exitosa
				if (result.type === 'success') {
					await invalidateAll();
					// Desactivar modo edición después de guardar exitosamente
					isEditing = false;
				}
				// Actualizar el formulario con los nuevos datos
				await update();
				nombre = data.cliente?.nombre ?? '';
				apellido = data.cliente?.apellido ?? '';
				dni = data.cliente?.dni ?? '';
				email = data.cliente?.email ?? '';
				telefono = data.cliente?.telefono ?? '';
			};
		}}
	>
		<fieldset class="fieldset">
			<legend class="fieldset-legend">Nombre (*)</legend>
			<input 
				type="text" 
				class="input" 
				name="nombre" 
				bind:value={nombre} 
				disabled={!isEditing}
				required
			/>
			
			<legend class="fieldset-legend">Apellido (*)</legend>
			<input 
				type="text" 
				class="input" 
				name="apellido" 
				bind:value={apellido} 
				disabled={!isEditing}
				required 
			/>
			
			<legend class="fieldset-legend">DNI (*)</legend>
			<input 
				type="text" 
				class="input" 
				name="dni" 
				bind:value={dni} 
				disabled={!isEditing}
				required 
			/>
			
			<legend class="fieldset-legend">Email (*)</legend>
			<input 
				type="email" 
				class="input" 
				name="email" 
				bind:value={email} 
				disabled={!isEditing}
				required 
			/>
			
			<legend class="fieldset-legend">Teléfono</legend>
			<input 
				type="tel" 
				class="input" 
				name="telefono" 
				bind:value={telefono} 
				disabled={!isEditing}
			/>
		</fieldset>

		<div class="mt-2 flex gap-2">
			{#if !isEditing}
				<!-- Botón Editar cuando no está en modo edición -->
				<button 
					type="button" 
					class="btn btn-secondary" 
					onclick={enableEditing}
				>
					Editar
				</button>
			{:else}
				<!-- Botones Guardar y Cancelar cuando está en modo edición -->
				<button 
					type="submit" 
					class="btn btn-primary"
				>
					Guardar
				</button>
				<button 
					type="button" 
					class="btn btn-outline" 
					onclick={cancelEditing}
				>
					Cancelar
				</button>
			{/if}
		</div>
	</form>
</div>