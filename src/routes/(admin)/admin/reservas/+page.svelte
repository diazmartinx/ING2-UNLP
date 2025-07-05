<script lang="ts">
    import type { PageData } from './$types';
    import { invalidate } from '$app/navigation';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    let { data }: { data: PageData } = $props();

    let error = $state('');
    let successMessage = $state('');
    let dniBusqueda = $state('');
    let estadoFiltro = $state('Todos');
    let reservas = $state(data.reservas);
    let sortOrder = $state<'asc' | 'desc'>('desc');
    let showToast = $state(false);

    type Reserva = {
        id: number;
        fechaInicio: Date;
        fechaFin: Date;
        estado: "Pendiente" | "Entregada" | "Cancelada" | "Devuelto";
        dniCliente: string | null;
        patenteUnidadAsignada: string | null;
        nombreCliente: string | null;
        apellidoCliente: string | null;
        modeloReservado: string;
        marcaReservada: string;
    };

    // Initialize filters from URL parameters and update data when URL changes
    $effect(() => {
        const params = $page.url.searchParams;
        dniBusqueda = params.get('dni') || '';
        estadoFiltro = params.get('estado') || 'Todos';
        reservas = data.reservas;
    });

    onMount(() => {
        if (data.toast === 'unidad-asignada' || data.toast === 'reserva-cancelada' || data.toast === 'vehiculo-devuelto') {
            showToast = true;
            setTimeout(() => {
                showToast = false;
                const url = new URL(window.location.href);
                url.searchParams.delete('toast');
                window.history.replaceState({}, '', url.pathname + url.search);
            }, 3000);
        }
    });

    async function buscarReservas() {
        const params = new URLSearchParams();
        if (dniBusqueda) params.set('dni', dniBusqueda);
        if (estadoFiltro && estadoFiltro !== 'Todos') params.set('estado', estadoFiltro);
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
    
</script>

{#if showToast}
    <div class="fixed top-4 right-4 z-50">
        <div class="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded shadow-lg flex items-center gap-2">
            <svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
                {#if data.toast === 'unidad-asignada'}
                    Unidad asignada exitosamente
                {:else if data.toast === 'reserva-cancelada'}
                    Reserva cancelada exitosamente
                {:else if data.toast === 'vehiculo-devuelto'}
                    Vehículo devuelto exitosamente
                {:else}
                    Operación completada exitosamente
                {/if}
            </span>
        </div>
    </div>
{/if}

<div class="flex flex-col gap-6">
    <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
            <h2 class="text-3xl font-bold text-gray-800">Reservas Activas</h2>
            <a 
                href="/admin/reservas-historicas" 
                class="btn btn-outline btn-primary cursor-pointer"
            >
                Ver Historial de Reservas
            </a>
        </div>
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
                <option value="Todos">Todos</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Entregada">Entregada</option>
            </select>
        </div>

        <button 
            onclick={buscarReservas}
            class="btn btn-primary cursor-pointer"
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
                        <th>Modelo Reservado</th>
                        <th>Unidad Asignada</th>
                        <th>
                            <button 
                                class="flex items-center gap-2 cursor-pointer"
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
                            <td>{reserva.marcaReservada} {reserva.modeloReservado}</td>
                            <td>{reserva.patenteUnidadAsignada || 'No asignada'}</td>
                            <td>{new Date(reserva.fechaInicio).toLocaleDateString()}</td>
                            <td>{new Date(reserva.fechaFin).toLocaleDateString()}</td>
                            <td>
                                <span class="badge badge-lg {reserva.estado === 'Pendiente' ? 'badge-warning' : 
                                    reserva.estado === 'Entregada' ? 'badge-success' : 'badge-error'}">
                                    {reserva.estado}
                                </span>
                            </td>
                            <td>
                                <div class="flex items-center gap-2">
                                    <a 
                                        href="/admin/reservas/{reserva.id}" 
                                        class="inline-flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                                    >
                                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Detalles
                                    </a>
                                    {#if reserva.estado === 'Pendiente'}
                                        <a
                                            href="/admin/reservas/{reserva.id}/asignar-unidad"
                                            class="inline-flex items-center gap-1 rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors cursor-pointer"
                                        >
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Asignar Vehículo
                                        </a>
                                        <a
                                            href="/admin/reservas/{reserva.id}/cancelar"
                                            class="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                                        >
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Cancelar
                                        </a>
                                    {:else if reserva.estado === 'Entregada'}
                                        <a
                                            href="/admin/reservas/{reserva.id}/devolucion"
                                            class="inline-flex items-center gap-1 rounded-md bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-700 hover:bg-yellow-100 transition-colors cursor-pointer"
                                        >
                                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                            </svg>
                                            Devolución Vehículo
                                        </a>
                                    {/if}
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
