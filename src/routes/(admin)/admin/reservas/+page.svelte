<script lang="ts">
    import type { PageData } from './$types';
    import { invalidate } from '$app/navigation';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    let { data }: { data: PageData } = $props();

    let error = $state('');
    let successMessage = $state('');
    let dniBusqueda = $state('');
    let estadoFiltro = $state('');
    let reservas = $state(data.reservas);
    let sortOrder = $state<'asc' | 'desc'>('desc');

    // Initialize filters from URL parameters and update data when URL changes
    $effect(() => {
        const params = $page.url.searchParams;
        dniBusqueda = params.get('dni') || '';
        estadoFiltro = params.get('estado') || '';
        reservas = data.reservas;
    });

    async function buscarReservas() {
        const params = new URLSearchParams();
        if (dniBusqueda) params.set('dni', dniBusqueda);
        if (estadoFiltro) params.set('estado', estadoFiltro);
        await goto(`?${params.toString()}`);
        await invalidate('app:reservas');
    }

    function toggleSort() {
        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        reservas = [...reservas].sort((a, b) => {
            const dateA = new Date(a.fechaInicio).getTime();
            const dateB = new Date(b.fechaInicio).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }

    async function actualizarEstado(id: number, nuevoEstado: 'Pendiente' | 'Entregada' | 'Cancelada') {
        try {
            const formData = new FormData();
            formData.append('id', id.toString());
            formData.append('nuevoEstado', nuevoEstado);

            const response = await fetch('?/actualizarEstado', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.type === 'success') {
                reservas = reservas.map((r) => 
                    r.id === id ? { ...r, estado: nuevoEstado } : r
                );
                successMessage = 'Estado actualizado exitosamente';
                setTimeout(() => {
                    successMessage = '';
                }, 3000);
            } else {
                error = result.data?.error || 'Error al actualizar el estado';
            }
        } catch (err) {
            error = 'Error al comunicarse con el servidor';
        }
    }
</script>

<div class="flex flex-col gap-6">
    <div class="flex justify-between items-center">
        <h2 class="text-3xl font-bold text-gray-800">Reservas</h2>
        {#if successMessage}
            <div class="text-green-600 font-medium">{successMessage}</div>
        {/if}
    </div>

    <div class="flex gap-4 items-end">
        <div class="form-control w-full max-w-xs">
            <label class="label" for="dni-busqueda">
                <span class="label-text">Buscar por DNI</span>
            </label>
            <input 
                type="text" 
                bind:value={dniBusqueda}
                placeholder="Ingrese DNI del cliente" 
                class="input input-bordered w-full"
            />
        </div>

        <div class="form-control w-full max-w-xs">
            <label class="label" for="estado-filtro">
                <span class="label-text">Filtrar por estado</span>
            </label>
            <select 
                id="estado-filtro"
                bind:value={estadoFiltro}
                class="select select-bordered w-full"
            >
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Entregada">Entregada</option>
                <option value="Cancelada">Cancelada</option>
            </select>
        </div>

        <button 
            onclick={buscarReservas}
            class="btn btn-primary"
        >
            Buscar
        </button>
    </div>

    {#if error}
        <div class="alert alert-error">
            <span>{error}</span>
        </div>
    {/if}

    {#if reservas.length === 0}
        <div class="flex justify-center items-center h-64">
            <div class="text-center">
                <h1 class="text-2xl font-bold mb-4">No hay reservas disponibles</h1>
            </div>
        </div> 
    {:else}
        <div class="overflow-x-auto">
            <table class="table table-zebra">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>DNI</th>
                        <th>Vehículo</th>
                        <th>
                            <button 
                                class="flex items-center gap-2"
                                onclick={toggleSort}
                            >
                                Fecha Inicio
                                <span class="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-pointer">
                                    {#if sortOrder === 'asc'}
                                        ↑
                                    {:else}
                                        ↓
                                    {/if}
                                </span>
                            </button>
                        </th>
                        <th>Fecha Fin</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each reservas as reserva}
                        <tr>
                            <td>{reserva.id}</td>
                            <td>{reserva.nombreCliente} {reserva.apellidoCliente}</td>
                            <td>{reserva.dniCliente}</td>
                            <td>{reserva.patenteUnidadAsignada}</td>
                            <td>{new Date(reserva.fechaInicio).toLocaleDateString()}</td>
                            <td>{new Date(reserva.fechaFin).toLocaleDateString()}</td>
                            <td>
                                <span class="badge badge-lg {reserva.estado === 'Pendiente' ? 'badge-warning' : 
                                    reserva.estado === 'Entregada' ? 'badge-success' : 'badge-error'}">
                                    {reserva.estado}
                                </span>
                            </td>
                            <td>
                                <div class="flex space-x-2">
                                    <a 
                                        href="./reservas/{reserva.id}" 
                                        class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                    >
                                        Detalles
                                    </a>
                                    <button
                                        class="font-medium text-green-600 dark:text-green-500 hover:underline cursor-pointer"
                                        onclick={() => {
                                            const nuevoEstado = reserva.estado === 'Pendiente' ? 'Entregada' : 
                                                              reserva.estado === 'Entregada' ? 'Cancelada' : 'Pendiente';
                                            actualizarEstado(reserva.id, nuevoEstado);
                                        }}
                                    >
                                        Cambiar estado
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
