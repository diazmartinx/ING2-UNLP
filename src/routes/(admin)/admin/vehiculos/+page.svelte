<script lang="ts">
	import type { PageData } from './$types';
	import { invalidate } from '$app/navigation';

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

				if (result.data[2]) {
					let nuevVehiculo = {
						patente: patente,
						idSucursal: sucursalSeleccionada,
						idModelo: modeloSeleccionado,
						anio: Number(anio),
						estado: 'Habilitado' as 'Habilitado'
					};
					vehiculos = [...vehiculos, nuevVehiculo];
				} else {
					vehiculos = vehiculos.map((v) =>
						v.patente === patente
							? {
									...v,
									estado: 'Habilitado',
									idSucursal: sucursalSeleccionada,
									idModelo: modeloSeleccionado,
									anio: Number(anio)
								}
							: v
					);
				}
				setTimeout(() => {
					successMessage = '';
				}, 3000);
				mostrarModal = false;
				await invalidate('/vehiculos');
				patente = '';
				sucursalSeleccionada = '';
				modeloSeleccionado = '';
				anio = '';
			} else {
				error = 'Error: la patente ya se encuentra en el sistema.';
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
				vehiculos = vehiculos.map((v) =>
					v.patente === patenteSeleccionada ? { ...v, estado: nuevoEstado } : v
				);
				await invalidate('app:vehiculos');
				patenteSeleccionada = '';
				successMessage = `Vehículo ${nuevoEstado === 'Dado de baja' ? 'dado de baja' : nuevoEstado === 'Inhabilitado' ? 'inhabilitado' : 'habilitado'} exitosamente`;
				setTimeout(() => {
					successMessage = '';
				}, 3000);
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
		{#if successMessage}
			<div class="font-medium text-green-600">{successMessage}</div>
		{/if}
		<button onclick={() => (mostrarModal = true)} type="button" class="btn btn-primary">
			Crear Nuevo vehículo
		</button>
	</div>
</div>

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
				<th scope="col" class="px-6 py-3"> Sucursal </th>
				<th scope="col" class="px-6 py-3"> Acciones </th>
			</tr>
		</thead>
		<tbody>
			{#each vehiculos as { patente, idSucursal, estado, anio }}
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
						{estado}
					</td>
					<td class="px-6 py-4">
						{idSucursal}
					</td>
					<td class="px-6 py-4">
						<div class="flex space-x-2">
							<a
								href="./vehiculos/{patente}"
								class="font-medium text-blue-600 hover:underline dark:text-blue-500">Detalles</a
							>
							{#if estado == 'Habilitado'}
								<button
									onclick={() => confirmarAccion(patente, 'Inhabilitado')}
									type="button"
									class="text-600 font-medium hover:underline dark:text-red-500"
								>
									Inhabilitar
								</button>
							{:else if estado == 'Inhabilitado'}
								<button
									onclick={() => confirmarAccion(patente, 'Habilitado')}
									type="button"
									class="text-600 font-medium hover:underline dark:text-red-500"
								>
									Habilitar
								</button>
							{/if}

							{#if estado !== 'Dado de baja'}
								<button
									onclick={() => confirmarAccion(patente, 'Dado de baja')}
									type="button"
									class="font-medium text-red-600 hover:underline dark:text-red-500"
								>
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
			<h3 class="mb-4 text-xl font-semibold">Confirmar {accionSeleccionada}</h3>
			{#if error}
				<div class="mb-4 text-red-500">{error}</div>
				<div class="flex justify-end">
					<button
						onclick={() => {
							mostrarConfirmacion = false;
							error = '';
						}}
						type="button"
						class="rounded-md bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400"
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
				{:else}
					<p class="mb-4">
						¿Está seguro que desea <span class="font-bold">inhabilitar</span> el vehículo con
						patente {patenteSeleccionada}?
					</p>
				{/if}
				<div class="flex justify-end gap-2">
					<button
						onclick={cancelarAccion}
						type="button"
						class="rounded-md bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400"
					>
						Cancelar
					</button>
					<button
						onclick={() => actualizarEstadoVehiculo(accionSeleccionada as EstadoVehiculo)}
						type="button"
						class="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
				<label class="block text-sm font-medium text-gray-700">Patente</label>
				<input
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
				<label class="block text-sm font-medium text-gray-700">Sucursal</label>
				<select
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
				<label class="block text-sm font-medium text-gray-700">Modelo</label>
				<select
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
					class="rounded-md bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400"
				>
					Cancelar
				</button>
				<button
					onclick={agregarVehiculo}
					type="button"
					class="rounded-md bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
				>
					Aceptar
				</button>
			</div>
		</div>
	</div>
{/if}
