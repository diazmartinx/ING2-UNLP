<script lang="ts">
    import type { PageData } from './$types';
    import { invalidate } from '$app/navigation';

    let { data }: { data: PageData } = $props();

    let mostrarModal = $state(false);
    let patente = $state('');
    let sucursalSeleccionada = $state('');
    let modeloSeleccionado = $state('');
    let error = $state('');

    async function agregarVehiculo() {
        const formData = new FormData();
        formData.append('patente', patente);
        formData.append('idSucursal', sucursalSeleccionada);
        formData.append('idModelo', modeloSeleccionado);

        const response = await fetch('?agregarVehiculo', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            mostrarModal = false;
            patente = '';
            sucursalSeleccionada = '';
            modeloSeleccionado = '';
            error = '';
            await invalidate('/admin/vehiculos'); // Refresca los datos
        } else {
            const result = await response.json();
            error = result.error || 'Error al agregar el vehículo.'; // Accede al mensaje de error correctamente
        }
    }
</script>
{#if data.vehiculos.length === 0}
    <div class="flex justify-center items-center h-screen">
        <div class="text-center">
            <h1 class="text-2xl font-bold mb-4">No hay vehículos disponibles</h1>
        </div>
    </div> 
{:else}
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-gray-800">Vehículos</h2>
        <button
        onclick={() => (mostrarModal = true)}
            class="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition"
        >
        + Nuevo vehículo
        </button>
    </div>

    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3">
                    Patente
                </th>
                <th scope="col" class="px-6 py-3">
                    Estado
                </th>
                <th scope="col" class="px-6 py-3">
                    Sucursal
                </th>
            </tr>
        </thead>
        <tbody>
            {#each data.vehiculos as { patente, idSucursal, estado }}
            <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {patente}
                </th>
                <td class="px-6 py-4">
                    {estado}	
                </td>
                <td class="px-6 py-4">
                    {idSucursal}
                </td>
                <td class="px-6 py-4">
                    <a href="./vehiculos/{patente}" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Detalles</a>
                </td>
                <td class="px-6 py-4">
                    <a href="./vehiculos/{patente}" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Editar</a>
                </td>
            </tr>
            {/each}
        </tbody>

    </table>
{/if}

    <!-- Modal -->
{#if mostrarModal}
<div class="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Agregar Nuevo Vehículo</h3>
        {#if error}
        <div class="text-red-500 mb-4">{error}</div>
        {/if}
        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Patente</label>
            <input
                type="text"
                bind:value={patente}
                placeholder="Ingrese la patente"
                class="w-full p-2 border border-gray-300 rounded-md"
            />
        </div>
        <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Sucursal</label>
            <select
                bind:value={sucursalSeleccionada}
                class="w-full p-2 border border-gray-300 rounded-md"
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
                class="w-full p-2 border border-gray-300 rounded-md"
            >
                <option value="" disabled selected>Seleccione un modelo</option>
                {#each data.modelos as modelo}
                    <option value={modelo.id}>{modelo.marca} {modelo.modelo}</option>
                {/each}
            </select>
        </div>
        <div class="flex justify-end gap-2">
            <button
                onclick={() => (mostrarModal = false)}
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
            >
                Cancelar
            </button>
            <button
                onclick={agregarVehiculo}
                class="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md"
            >
                Aceptar
            </button>
        </div>
    </div>
</div>
{/if}