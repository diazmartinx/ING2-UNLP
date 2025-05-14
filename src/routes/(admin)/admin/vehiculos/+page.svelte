<script lang="ts">
    import type { PageData } from './$types';
    import { invalidate } from '$app/navigation';

    let { data }: { data: PageData } = $props();

    let mostrarModal = $state(false);
    let mostrarConfirmacion = $state(false);
    let patenteSeleccionada = $state('');
    let patente = $state("");
    let sucursalSeleccionada = $state('');
    let modeloSeleccionado = $state('');
    let error = $state('');
    let successMessage = $state('');
    let vehiculos = $state(data.vehiculos);
    let anio = $state('');

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


            // Si el campo `data` es un string JSON, parsearlo
            if (typeof result.data === 'string') {
                result.data = JSON.parse(result.data);
            }

            if (result.data[1] === true) { 
                
                error = '';
                successMessage = 'Vehículo agregado exitosamente';
                
                // Construir el objeto vehículo con los datos recibidos
                if (result.data[2]){
                    let nuevVehiculo = ({
                        patente: patente,
                        idSucursal: sucursalSeleccionada,
                        idModelo: modeloSeleccionado,
                        anio: Number(anio), // Ensure anio is a number
                        estado: 'Habilitado' as 'Habilitado' // Explicitly cast to the allowed type
                    });
                    // Agregar el nuevo vehículo a la lista local
                    vehiculos = [...vehiculos, nuevVehiculo];
                }
                else{
                    vehiculos = vehiculos.map(v => 
                    v.patente === patente ? { ...v, estado: 'Habilitado',
                                                    idSucursal: sucursalSeleccionada,
                                                    idModelo: modeloSeleccionado,
                                                    anio: Number(anio) 
                                     }           
                    : v 
                    );
                }
                // Limpiar el mensaje de éxito después de 3 segundos
                setTimeout(() => {
                    successMessage = '';
                }, 3000);
                mostrarModal = false;
                await invalidate('/vehiculos');
                patente = '';
                mostrarModal = false;
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
                successMessage = 'Vehículo dado de baja exitosamente'
                setTimeout(() => {
                    successMessage = '';
                }, 3000);
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
        error = '';
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
    <table class="table table-zebra">
        <!-- head -->
        <thead>
            <tr>
                <th scope="col" class="px-6 py-3">
                    Patente
                </th>
                <th scope="col" class="px-6 py-3">
                    Año
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
            {#each vehiculos as { patente, idSucursal, estado, anio }}
            <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {patente}
                </th>
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
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
        <div class="form-control">
            <label class="label" for="anio">
                <span class="label-text">Año</span>
            </label>
            <input type="number" id="anio" name="anio" bind:value={anio} class="input input-bordered w-full" required min="1900" max={new Date().getFullYear()} />
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
                onclick={() => {
                    mostrarModal = false;
                    error = '';
                }}
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
