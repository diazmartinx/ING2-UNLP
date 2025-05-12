<script lang="ts">
    import type { PageData } from './$types';
    import { invalidate } from '$app/navigation';

    let { data }: { data: PageData } = $props();

    let mostrarModal = $state(false);
    let mostrarConfirmacion = $state(false);
    let patenteSeleccionada = $state('');
    let patente = ("");
    let sucursalSeleccionada = $state('');
    let modeloSeleccionado = $state('');
    let error = $state('');
    let successMessage = $state('');
    let vehiculos = $state([...data.vehiculos])

    async function agregarVehiculo() {
        if (!patente || !sucursalSeleccionada || !modeloSeleccionado) {
            error = 'Por favor, complete todos los campos.';
            return;
        }
        const formData = new FormData();
        formData.append('patente', patente);
        formData.append('idSucursal', sucursalSeleccionada);
        formData.append('idModelo', modeloSeleccionado);
        
        try {
            const response = await fetch('?/agregarVehiculo', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            // Parsear la respuesta del servidor
            let serverResponse;
            try {
                serverResponse = JSON.parse(result.data);
            } catch (e) {
                error = 'Error al procesar la respuesta del servidor.';
                return;
            }

            if (serverResponse[1] === true) { // El segundo elemento es el success
                await invalidate('app:vehiculos');
                mostrarModal = false;
                patente = '';
                sucursalSeleccionada = '';
                modeloSeleccionado = '';
                error = '';
                successMessage = 'Vehículo agregado exitosamente';
                
                // Construir el objeto vehículo con los datos recibidos
                const nuevoVehiculo = {
                    patente: serverResponse[3], // patente
                    idSucursal: serverResponse[4], // idSucursal
                    idModelo: serverResponse[4], // idModelo
                    idCategoria: null, // idCategoria
                    estado: serverResponse[5] // estado
                };
                
                vehiculos = [...vehiculos, nuevoVehiculo];

                // Limpiar el mensaje de éxito después de 3 segundos
                setTimeout(() => {
                    successMessage = '';
                }, 3000);
            } else {
                error = 'Error: la patente ya se encuentra en el sistema.';
            }
        } catch (err) {
            error = 'Error al comunicarse con el servidor.';
        }
    }

    function confirmarDarDeBaja(patente: string) {
        patenteSeleccionada = patente;
        mostrarConfirmacion = true;
    }

    async function darDeBaja() {
        try {
            const response = await fetch('?/darDeBaja', {
                method: 'POST',
                body: JSON.stringify({ patente: patenteSeleccionada })
            });

            const result = await response.json();
            mostrarConfirmacion = false;

            if (result.type === 'success') {
                // Primero actualizamos la lista local
                vehiculos = vehiculos.map(v => 
                    v.patente === patenteSeleccionada ? { ...v, estado: 'Dado de baja' } : v
                );
                // Luego invalidamos los datos
                await invalidate('app:vehiculos');
                patenteSeleccionada = '';
            } else {
                error = result.data?.error || 'Error: la unidad está en uso.';
                // Mostrar el error en el modal de confirmación
                mostrarConfirmacion = true;
            }
        } catch (err) {
            error = 'Error al comunicarse con el servidor.';
            mostrarConfirmacion = true;
        }
    }

    function cancelarDarDeBaja() {
        mostrarConfirmacion = false;
        patenteSeleccionada = '';
    }
</script>

<div class="flex justify-between items-center mb-6">
    <h2 class="text-3xl font-bold text-gray-800">Vehículos</h2>
    <div class="flex items-center gap-4">
        {#if successMessage}
            <div class="text-green-600 font-medium">{successMessage}</div>
        {/if}
        <button
            onclick={() => (mostrarModal = true)}
            type="button"
            class="btn btn-primary"
        >
            Crear Nuevo vehículo
        </button>
    </div>
</div>

{#if vehiculos.length === 0}
    <div class="flex justify-center items-center h-screen">
        <div class="text-center">
            <h1 class="text-2xl font-bold mb-4">No hay vehículos disponibles</h1>
        </div>
    </div> 
{:else}
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
                <th scope="col" class="px-6 py-3">
                    Acciones
                </th>
            </tr>
        </thead>
        <tbody>
            {#each vehiculos as { patente, idSucursal, estado }}
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
                    <div class="flex space-x-2">
                        <a href="./vehiculos/{patente}" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Detalles</a>
                        <a href="./vehiculos/{patente}" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Editar</a>
                        {#if estado !== 'Dado de baja'}
                            <button
                                onclick={() => confirmarDarDeBaja(patente)}
                                type="button"
                                class="font-medium text-red-600 dark:text-red-500 hover:underline"
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

    <!-- Modal de confirmación -->
{#if mostrarConfirmacion}
<div class="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <h3 class="text-xl font-semibold mb-4">Confirmar dar de baja</h3>
        {#if error}
            <div class="text-red-500 mb-4">{error}</div>
            <div class="flex justify-end">
                <button
                    onclick={() => {
                        mostrarConfirmacion = false;
                        error = '';
                    }}
                    type="button"
                    class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                >
                    Cerrar
                </button>
            </div>
        {:else}
            <p class="mb-4">¿Está seguro que desea dar de baja el vehículo con patente {patenteSeleccionada}?</p>
            <div class="flex justify-end gap-2">
                <button
                    onclick={cancelarDarDeBaja}
                    type="button"
                    class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                >
                    Cancelar
                </button>
                <button
                    onclick={darDeBaja}
                    type="button"
                    class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
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
<div class="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
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
                type="button"
                class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
            >
                Cancelar
            </button>
            <button
                onclick={agregarVehiculo}
                type="button"
                class="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md"
            >
                Aceptar
            </button>
        </div>
    </div>
</div>
{/if}
