<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;
	let isEditing = false;
	let formData = {
		nombre: data.usuario.nombre ?? '',
		apellido: data.usuario.apellido ?? '',
		telefono: data.usuario.telefono ?? '',
		fechaNacimiento: data.usuario.fechaNacimiento ? new Date(data.usuario.fechaNacimiento).toISOString().split('T')[0] : ''
	};

	function toggleEdit() {
		isEditing = !isEditing;
		if (!isEditing) {
			// Reset form data when canceling edit
			formData = {
				nombre: data.usuario.nombre ?? '',
				apellido: data.usuario.apellido ?? '',
				telefono: data.usuario.telefono ?? '',
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
							class="input input-bordered w-full"
							required
						/>
					{:else}
						<p id="fechaNacimiento" class="mt-1 text-gray-900">
							{data.usuario.fechaNacimiento
								? new Date(data.usuario.fechaNacimiento).toLocaleDateString()
								: 'No especificada'}
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