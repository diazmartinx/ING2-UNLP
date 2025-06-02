<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;
	let isEditing = false;
	let formData = {
		nombre: data.usuario.nombre,
		apellido: data.usuario.apellido,
		telefono: data.usuario.telefono,
		fechaNacimiento: data.usuario.fechaNacimiento ? new Date(data.usuario.fechaNacimiento).toISOString().split('T')[0] : ''
	};

	function toggleEdit() {
		isEditing = !isEditing;
		if (!isEditing) {
			// Reset form data when canceling edit
			formData = {
				nombre: data.usuario.nombre,
				apellido: data.usuario.apellido,
				telefono: data.usuario.telefono,
				fechaNacimiento: data.usuario.fechaNacimiento ? new Date(data.usuario.fechaNacimiento).toISOString().split('T')[0] : ''
			};
		}
	}
</script>

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

		<form method="POST" use:enhance>
			<div class="space-y-4">
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700">Nombre</label>
						{#if isEditing}
							<input
								type="text"
								name="nombre"
								bind:value={formData.nombre}
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								required
							/>
						{:else}
							<p class="mt-1 text-gray-900">{data.usuario.nombre}</p>
						{/if}
					</div>

					<div>
						<label class="block text-sm font-medium text-gray-700">Apellido</label>
						{#if isEditing}
							<input
								type="text"
								name="apellido"
								bind:value={formData.apellido}
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
								required
							/>
						{:else}
							<p class="mt-1 text-gray-900">{data.usuario.apellido}</p>
						{/if}
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">DNI</label>
					<p class="mt-1 text-gray-900">{data.usuario.dni}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
					{#if isEditing}
						<input
							type="date"
							name="fechaNacimiento"
							bind:value={formData.fechaNacimiento}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							required
						/>
					{:else}
						<p class="mt-1 text-gray-900">
							{data.usuario.fechaNacimiento
								? new Date(data.usuario.fechaNacimiento).toLocaleDateString()
								: 'No especificada'}
						</p>
					{/if}
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
					<p class="mt-1 text-gray-900">{data.usuario.email}</p>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Teléfono</label>
					{#if isEditing}
						<input
							type="tel"
							name="telefono"
							bind:value={formData.telefono}
							class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							required
						/>
					{:else}
						<p class="mt-1 text-gray-900">{data.usuario.telefono}</p>
					{/if}
				</div>
			</div>

			<div class="mt-6 flex justify-end space-x-4">
				{#if isEditing}
					<button
						type="button"
						on:click={toggleEdit}
						class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
					>
						Cancelar
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					>
						Guardar Cambios
					</button>
				{:else}
					<button
						type="button"
						on:click={toggleEdit}
						class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					>
						Modificar Datos
					</button>
				{/if}
			</div>
		</form>
	</div>
</div> 