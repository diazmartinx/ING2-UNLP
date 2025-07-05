<script lang="ts">
	import type { PageData } from './$types';
	import { invalidate, invalidateAll } from '$app/navigation';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let mostrarModal = $state(false);
	let mostrarConfirmacion = $state(false);
	let patenteSeleccionada = $state('');
	let accionSeleccionada = $state('');
	let patente = $state('');
	let sucursalSeleccionada = $state('');
	let modeloSeleccionado = $state('');
	let error = $state('');
	let successMessage = $state('');
	let vehiculos = $state(data.vehiculos);
	let anio = $state('');

	type EstadoVehiculo = 'Habilitado' | 'Inhabilitado' | 'Dado de baja';

	async function agregarVehiculo() {
		if (!patente || !sucursalSeleccionada || !modeloSeleccionado || !anio) {
			error = 'Por favor, complete todos los campos.';
			return;
		}
		const formData = new FormData();
		formData.append('patente', patente);
		formData.append('idSucursal', sucursalSeleccionada);
		formData.append('idModelo', modeloSeleccionado);
		formData.append('anio', anio);
		try {
			const response = await fetch('?/agregarVehiculo', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (typeof result.data === 'string') {
				result.data = JSON.parse(result.data);
			}

			if (result.data[1] === true) {
				error = '';
				successMessage = 'Vehículo agregado exitosamente';
				mostrarModal = false;
				patente = '';
				sucursalSeleccionada = '';
				modeloSeleccionado = '';
				anio = '';
				
				// Refresh data without page reload
				await invalidateAll();
				
				// Auto-hide toast after 4 seconds
				setTimeout(() => {
					successMessage = '';
				}, 4000);
			} else {
				error = result.data[2] || 'Error: la patente ya se encuentra en el sistema.';
			}
		} catch (err) {
			error = 'Error al comunicarse con el servidor.';
		}
	}

	async function actualizarEstadoVehiculo(nuevoEstado: EstadoVehiculo) {
		try {
			const response = await fetch('?/actualizarEstadoVehiculo', {
				method: 'POST',
				body: JSON.stringify({ patente: patenteSeleccionada, nuevoEstado })
			});

			const result = await response.json();
			mostrarConfirmacion = false;

			if (result.type === 'success') {
				// Refresh data without page reload
				await invalidateAll();
				patenteSeleccionada = '';
				successMessage = `Vehículo ${nuevoEstado === 'Dado de baja' ? 'dado de baja' : nuevoEstado === 'Inhabilitado' ? 'puesto en mantenimiento' : 'habilitado'} exitosamente`;
				
				// Auto-hide toast after 4 seconds
				setTimeout(() => {
					successMessage = '';
				}, 4000);
			} else {
				error = result.data?.error || 'Error al actualizar el estado del vehículo';
				mostrarConfirmacion = true;
			}
		} catch (err) {
			error = 'Error al actualizar el estado del vehículo';
			mostrarConfirmacion = true;
		}
	}

	function confirmarAccion(patente: string, accion: EstadoVehiculo) {
		console.log(accion);
		patenteSeleccionada = patente;
		accionSeleccionada = accion;
		mostrarConfirmacion = true;
	}

	function cancelarAccion() {
		mostrarConfirmacion = false;
		patenteSeleccionada = '';
		error = '';
	}
</script>

<div class="mb-6 flex items-center justify-between">
	<h2 class="text-3xl font-bold text-gray-800">Vehículos</h2>
	<div class="flex items-center gap-4">
		<button onclick={() => (mostrarModal = true)} type="button" class="btn btn-primary cursor-pointer">
			Crear Nuevo vehículo
		</button>
	</div>
</div>

<!-- Toast de éxito -->
{#if successMessage}
	<div class="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
		<div class="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 shadow-lg">
			<div class="flex-shrink-0">
				<svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
				</svg>
			</div>
			<div class="flex-1">
				<p class="text-sm font-medium text-green-800">{successMessage}</p>
			</div>
			<button
				onclick={() => successMessage = ''}
				class="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors cursor-pointer"
				aria-label="Cerrar notificación"
			>
				<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
				</svg>
			</button>
		</div>
	</div>
{/if}

{#if vehiculos.length === 0}
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<h1 class="mb-4 text-2xl font-bold">No hay vehículos disponibles</h1>
		</div>
	</div>
{:else}
	<table class="table-zebra table">
		<!-- head -->
		<thead>
			<tr>
				<th scope="col" class="px-6 py-3"> Patente </th>
				<th scope="col" class="px-6 py-3"> Año </th>
				<th scope="col" class="px-6 py-3"> Estado </th>
				<th scope="col" class="px-6 py-3"> Acciones </th>
			</tr>
		</thead>
		<tbody>
			{#each data.vehiculos as { patente, idSucursal, estado, anio }}
				<tr
					class="border-b border-gray-200 odd:bg-white even:bg-gray-50 dark:border-gray-700 odd:dark:bg-gray-900 even:dark:bg-gray-800"
				>
					<th
						scope="row"
						class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white"
					>
						{patente}
					</th>
					<th
						scope="row"
						class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white"
					>
						{anio}
					</th>
					<td class="px-6 py-4">
						{#if estado === 'Inhabilitado'}
							<span class="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
								<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								En mantenimiento
							</span>
						{:else if estado === 'Habilitado'}
							<span class="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
								<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
								Habilitado
							</span>
						{:else if estado === 'Dado de baja'}
							<span class="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
								<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
								Dado de baja
							</span>
						{:else}
							{estado}
						{/if}
					</td>
					<td class="px-6 py-4">
						<div class="flex items-center gap-2">
							<a
								href="./vehiculos/{patente}"
								class="inline-flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
								</svg>
								Detalles
							</a>
							
							{#if estado == 'Habilitado'}
								<button
									onclick={() => confirmarAccion(patente, 'Inhabilitado')}
									type="button"
									class="inline-flex items-center gap-1 rounded-md bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-700 hover:bg-yellow-100 transition-colors cursor-pointer"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
									Poner en mantenimiento
								</button>
							{:else if estado == 'Inhabilitado'}
								<button
									onclick={() => confirmarAccion(patente, 'Habilitado')}
									type="button"
									class="inline-flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors cursor-pointer"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
									Habilitar
								</button>
							{/if}

							{#if estado !== 'Dado de baja'}
								<button
									onclick={() => confirmarAccion(patente, 'Dado de baja')}
									type="button"
									class="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
									Dar de baja
								</button>
							{/if}
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

{#if mostrarConfirmacion}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
			<h3 class="mb-4 text-xl font-semibold">
				{#if accionSeleccionada === 'Inhabilitado'}
					Confirmar Poner en Mantenimiento
				{:else}
					Confirmar {accionSeleccionada}
				{/if}
			</h3>
			{#if error}
				<div class="mb-4 text-red-500">{error}</div>
				<div class="flex justify-end">
					<button
						onclick={() => {
							mostrarConfirmacion = false;
							error = '';
						}}
						type="button"
						class="rounded-md bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 cursor-pointer transition-colors"
					>
						Cerrar
					</button>
				</div>
			{:else}
				{#if accionSeleccionada === 'Dado de baja'}
					<p class="mb-4">
						¿Está seguro que desea <span class="font-bold">dar de baja</span> el vehículo con
						patente {patenteSeleccionada}?
					</p>
				{:else if accionSeleccionada === 'Inhabilitado'}
					<p class="mb-4">
						¿Está seguro que desea <span class="font-bold">poner en mantenimiento</span> el vehículo con
						patente {patenteSeleccionada}?
					</p>
				{:else if accionSeleccionada === 'Habilitado'}
					<p class="mb-4">
						¿Está seguro que desea <span class="font-bold">habilitar</span> el vehículo con
						patente {patenteSeleccionada}?
					</p>
				{/if}
				<div class="flex justify-end gap-2">
					<button
						onclick={cancelarAccion}
						type="button"
						class="rounded-md bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 cursor-pointer transition-colors"
					>
						Cancelar
					</button>
					<button
						onclick={() => actualizarEstadoVehiculo(accionSeleccionada as EstadoVehiculo)}
						type="button"
						class="rounded-md px-4 py-2 text-white cursor-pointer transition-colors {accionSeleccionada === 'Habilitado' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}"
					>
						Confirmar
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Modal -->
{#if mostrarModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
		<div class="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
			<h3 class="mb-4 text-xl font-semibold">Agregar Nuevo Vehículo</h3>
			{#if error}
				<div class="mb-4 text-red-500">{error}</div>
			{/if}
			<div class="mb-4">
				<label for="patente" class="block text-sm font-medium text-gray-700">Patente</label>
				<input
					id="patente"
					type="text"
					bind:value={patente}
					placeholder="Ingrese la patente"
					class="w-full rounded-md border border-gray-300 p-2"
				/>
			</div>
			<div class="form-control">
				<label class="label" for="anio">
					<span class="label-text">Año</span>
				</label>
				<input
					type="number"
					id="anio"
					name="anio"
					bind:value={anio}
					class="input input-bordered w-full"
					required
					min="1900"
					max={new Date().getFullYear()}
				/>
			</div>
			<div class="mb-4">
				<label for="sucursal" class="block text-sm font-medium text-gray-700">Sucursal</label>
				<select
					id="sucursal"
					bind:value={sucursalSeleccionada}
					class="w-full rounded-md border border-gray-300 p-2"
				>
					<option value="" disabled selected>Seleccione una sucursal</option>
					{#each data.sucursales as sucursal}
						<option value={sucursal.id}>{sucursal.nombre}</option>
					{/each}
				</select>
			</div>
			<div class="mb-4">
				<label for="modelo" class="block text-sm font-medium text-gray-700">Modelo</label>
				<select
					id="modelo"
					bind:value={modeloSeleccionado}
					class="w-full rounded-md border border-gray-300 p-2"
				>
					<option value="" disabled selected>Seleccione un modelo</option>
					{#each data.modelos as modelo}
						<option value={modelo.id}>{modelo.marca} {modelo.modelo}</option>
					{/each}
				</select>
			</div>
			<div class="flex justify-end gap-2">
				<button
					onclick={() => {
						mostrarModal = false;
						error = '';
					}}
					type="button"
					class="rounded-md bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400 cursor-pointer transition-colors"
				>
					Cancelar
				</button>
				<button
					onclick={agregarVehiculo}
					type="button"
					class="rounded-md bg-violet-600 px-4 py-2 text-white hover:bg-violet-700 cursor-pointer transition-colors"
				>
					Aceptar
				</button>
			</div>
		</div>
	</div>
{/if}
