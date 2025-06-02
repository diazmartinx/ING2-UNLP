<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;
	let isEditing = false;
	let showSuccessToast = false;
	let fechaError = '';

	// Función para ajustar la fecha a UTC-3
	function adjustToUTC3(date: string | Date | null): string {
		if (!date) return '';
		const d = new Date(date);
		// Ajustamos la fecha a UTC-3
		d.setHours(d.getHours() + 3);
		return d.toISOString().split('T')[0];
	}

	// Función para mostrar la fecha en formato local
	function formatLocalDate(date: string | Date | null): string {
		if (!date) return 'No especificada';
		const d = new Date(date);
		// Ajustamos la fecha a UTC-3
		d.setHours(d.getHours() + 3);
		return d.toLocaleDateString();
	}

	// Función para validar la edad
	function validarEdad(fecha: string): boolean {
		const fechaNacimiento = new Date(fecha);
		const hoy = new Date();
		const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
		const mesActual = hoy.getMonth();
		const mesNacimiento = fechaNacimiento.getMonth();
		const diaActual = hoy.getDate();
		const diaNacimiento = fechaNacimiento.getDate();

		if (edad > 18) return true;
		if (edad === 18) {
			if (mesActual > mesNacimiento) return true;
			if (mesActual === mesNacimiento && diaActual >= diaNacimiento) return true;
		}
		return false;
	}

	let formData = {
		nombre: data.usuario.nombre ?? '',
		apellido: data.usuario.apellido ?? '',
		telefono: data.usuario.telefono ?? '',
		fechaNacimiento: adjustToUTC3(data.usuario.fechaNacimiento)
	};

	function toggleEdit() {
		isEditing = !isEditing;
		fechaError = '';
		if (!isEditing) {
			// Reset form data when canceling edit
			formData = {
				nombre: data.usuario.nombre ?? '',
				apellido: data.usuario.apellido ?? '',
				telefono: data.usuario.telefono ?? '',
				fechaNacimiento: adjustToUTC3(data.usuario.fechaNacimiento)
			};
		}
	}

	async function handleSubmit() {
		showSuccessToast = true;
		isEditing = false;
		await invalidateAll();
		setTimeout(() => {
			showSuccessToast = false;
		}, 1500);
	}

	function validarFecha(event: Event) {
		const input = event.target as HTMLInputElement;
		const fecha = input.value;
		if (!validarEdad(fecha)) {
			fechaError = 'Debes ser mayor de 18 años';
			input.setCustomValidity('Debes ser mayor de 18 años');
		} else {
			fechaError = '';
			input.setCustomValidity('');
		}
	}
</script>

<div class="toast toast-top toast-end z-50">
	{#if showSuccessToast}
		<div class="alert alert-success">
			<svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span>¡Cambios guardados exitosamente!</span>
		</div>
	{/if}
</div>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
		<h1 class="text-2xl font-bold mb-6">Mi Perfil</h1>

		{#if data.error}
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
				{data.error}
			</div>
		{/if}

		{#if data.success}
			<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
				{data.success}
			</div>
		{/if}

		<form method="POST" use:enhance={({ formData }) => {
			return async ({ result }) => {
				if (result.type === 'success') {
					handleSubmit();
				}
			};
		}}>
			<div class="space-y-4 mb-16">
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="nombre" class="block text-sm font-medium text-gray-700">Nombre</label>
						{#if isEditing}
							<input
								id="nombre"
								type="text"
								name="nombre"
								bind:value={formData.nombre}
								class="input input-bordered w-full"
								required
							/>
						{:else}
							<p class="mt-1 text-gray-900">{data.usuario.nombre ?? 'No especificado'}</p>
						{/if}
					</div>

					<div>
						<label for="apellido" class="block text-sm font-medium text-gray-700">Apellido</label>
						{#if isEditing}
							<input
								id="apellido"
								type="text"
								name="apellido"
								bind:value={formData.apellido}
								class="input input-bordered w-full"
								required
							/>
						{:else}
							<p class="mt-1 text-gray-900">{data.usuario.apellido ?? 'No especificado'}</p>
						{/if}
					</div>
				</div>

				<div>
					<label for="dni" class="block text-sm font-medium text-gray-700">DNI</label>
					<p id="dni" class="mt-1 text-gray-900">{data.usuario.dni ?? 'No especificado'}</p>
				</div>

				<div>
					<label for="fechaNacimiento" class="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
					{#if isEditing}
						<input
							id="fechaNacimiento"
							type="date"
							name="fechaNacimiento"
							bind:value={formData.fechaNacimiento}
							class="input input-bordered w-full {fechaError ? 'border-red-500' : ''}"
							required
							on:input={validarFecha}
						/>
						{#if fechaError}
							<span class="text-error text-sm mt-1">{fechaError}</span>
						{/if}
					{:else}
						<p id="fechaNacimiento" class="mt-1 text-gray-900">
							{formatLocalDate(data.usuario.fechaNacimiento)}
						</p>
					{/if}
				</div>

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
					<p id="email" class="mt-1 text-gray-900">{data.usuario.email ?? 'No especificado'}</p>
				</div>

				<div>
					<label for="telefono" class="block text-sm font-medium text-gray-700">Teléfono</label>
					{#if isEditing}
						<input
							id="telefono"
							type="tel"
							name="telefono"
							bind:value={formData.telefono}
							class="input input-bordered w-full"
							required
						/>
					{:else}
						<p id="telefono" class="mt-1 text-gray-900">{data.usuario.telefono ?? 'No especificado'}</p>
					{/if}
				</div>
			</div>

			<div class="flex justify-end space-x-4">
				{#if isEditing}
					<button
						type="button"
						on:click={toggleEdit}
						class="btn btn-ghost"
					>
						Cancelar
					</button>
					<button
						type="submit"
						class="btn btn-primary"
						disabled={!!fechaError}
					>
						Guardar Cambios
					</button>
				{:else}
					<button
						type="button"
						on:click={toggleEdit}
						class="btn btn-primary"
					>
						Modificar Datos
					</button>
				{/if}
			</div>
		</form>
	</div>
</div> 