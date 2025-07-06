<script lang="ts">
    import type { PageData } from './$types';
    import { goto } from '$app/navigation';
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from '@sveltejs/kit';

    let { data }: { data: PageData } = $props();
    const reserva = data.reserva[0];
    
    interface Reserva {
        id: number;
        estado: "Pendiente" | "Entregada" | "Cancelada";
        fechaInicio: Date;
        fechaFin: Date;
        patenteUnidadAsignada: string | null;
        modeloReservado: string;
        marcaReservada: string;
        precioPorDiaReservado: number;
    }
    
    type Unidad = {
        patente: string;
        marca: string | null;
        modelo: string | null;
        precioPorDia: number;
    };

    let error = $state('');
    let successMessage = $state('');
    let loading = $state(false);
    let patenteSeleccionada = $state('');
    let adicionalesSeleccionados = $state<Record<number, number>>({});



    // SVG Components como strings para evitar duplicación
    const svgIcons = {
        back: `<path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />`,
        success: `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />`,
        error: `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />`,
        forward: `<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />`,
        info: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
        warning: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />`,
        loading: {
            circle: `<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>`,
            path: `<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>`
        }
    };

    const formatearFecha = (fecha: Date) => new Date(fecha).toLocaleDateString();
    
    const getEstadoBadgeClass = (estado: string) => {
        switch (estado) {
            case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
            case 'Entregada': return 'bg-green-100 text-green-800';
            default: return 'bg-red-100 text-red-800';
        }
    };

    function toggleAdicional(id: number) {
        adicionalesSeleccionados = {
            ...adicionalesSeleccionados,
            [id]: adicionalesSeleccionados[id] === 1 ? 0 : 1
        };
    }

    const submitAsignar: SubmitFunction = () => {
        if (!patenteSeleccionada) {
            error = 'Se debe seleccionar una unidad';
            return { cancel: true } as any;
        }
        
        loading = true;
        error = '';
        successMessage = '';
        

        
        return async ({ result }) => {
            loading = false;
            
            if (result.type === 'success') {
                if (result.data?.redirect) {
                    window.location.href = result.data.redirect;
                }
            } else if (result.type === 'failure') {
                error = result.data?.error || 'Error al asignar la unidad';
                successMessage = '';
            }
        };
    };
</script>

<div class="flex flex-col gap-6">
    <div class="flex justify-between items-center">
        <div class="mb-6">
            <a href="/admin/reservas" class="text-blue-600 hover:text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    {@html svgIcons.back}
                </svg>
                Volver a Reservas
            </a>
        </div>
    </div>

    <!-- Success Message -->
    {#if successMessage}
        <div class="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        {@html svgIcons.success}
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
            </div>
        </div>
    {/if}

    <!-- Error Message -->
    {#if error}
        <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        {@html svgIcons.error}
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-red-800">{error}</p>
                </div>
            </div>
        </div>
    {/if}

    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <div class="flex justify-between items-center">
                <h3 class="card-title">Datos de la Reserva</h3>
                <a href="/admin/reservas/{reserva.id}" class="text-blue-600 hover:text-blue-800 flex items-center">
                    Ver más detalles
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        {@html svgIcons.forward}
                    </svg>
                </a>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p><span class="font-semibold">Marca:</span> {reserva.marcaReservada}</p>
                    <p><span class="font-semibold">Modelo:</span> {reserva.modeloReservado}</p>
                    <p><span class="font-semibold">Unidad Asignada:</span> {reserva.patenteUnidadAsignada || 'No hay unidad asignada'}</p>
                </div>
                <div>
                    <p><span class="font-semibold">Fecha Inicio:</span> {formatearFecha(reserva.fechaInicio)}</p>
                    <p><span class="font-semibold">Fecha Fin:</span> {formatearFecha(reserva.fechaFin)}</p>
                    <p class="mt-2">
                        <span class="font-semibold">Estado:</span>
                        <span class="px-3 py-1 rounded-full text-sm font-medium {getEstadoBadgeClass(reserva.estado)}">
                            {reserva.estado}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- Agregar después de la selección de unidad -->
    <div class="card bg-base-100 shadow-xl mt-6">
        <div class="card-body">
            <h3 class="card-title">Adicionales</h3>
            {#if data.adicionalesDisponibles.length === 0}
                <div class="alert alert-info mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        {@html svgIcons.info}
                    </svg>
                    <span>No hay adicionales disponibles</span>
                </div>
            {:else}
                <div class="space-y-3 flex flex-wrap gap-4 justify-start">
                    {#each data.adicionalesDisponibles as adicional}
                        <div class="flex flex-col justify-between p-3 rounded-lg bg-base-100 shadow-sm w-64 h-24 border-2 border-primary/60 relative">
                            <div class="mb-2 w-full">
                                <span class="font-medium">{adicional.nombre}</span>
                                <span class="block text-sm text-primary mt-1">${adicional.precioPorDia}/día</span>
                            </div>
                            <div class="absolute bottom-2 right-2">
                                <input
                                    type="checkbox"
                                    class="checkbox"
                                    checked={adicionalesSeleccionados[adicional.id] === 1}
                                    onchange={() => toggleAdicional(adicional.id)}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h3 class="card-title">Seleccionar Unidad Disponible</h3>
            
            <!-- Unidades del modelo reservado -->
            <div class="mb-6">
                <h4 class="text-lg font-semibold mb-3 text-primary">
                    Unidades del modelo reservado ({reserva.marcaReservada} {reserva.modeloReservado})
                </h4>
                
                {#if data.unidadesModeloReservado.length === 0}
                    <div class="alert alert-info mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            {@html svgIcons.info}
                        </svg>
                        <span>No hay unidades disponibles del modelo reservado</span>
                    </div>
                {:else}
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {#each data.unidadesModeloReservado as unidad}
                            <div class="card bg-base-200 border-2 border-primary/20">
                                <div class="card-body p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <h5 class="font-semibold">{unidad.marca} {unidad.modelo}</h5>
                                            <p class="text-sm opacity-70">Patente: {unidad.patente}</p>
                                            <p class="text-sm font-medium text-primary">${unidad.precioPorDia}/día</p>
                                        </div>
                                        <input 
                                            type="radio" 
                                            name="unidad" 
                                            value={unidad.patente}
                                            bind:group={patenteSeleccionada}
                                            class="radio radio-primary"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Unidades de otros modelos de igual o mayor valor -->
            <div class="mb-6">
                <h4 class="text-lg font-semibold mb-3 text-secondary">
                    Unidades de otros modelos (igual o mayor valor)
                </h4>
                
                {#if data.unidadesOtrosModelos.length === 0}
                    <div class="alert alert-info mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            {@html svgIcons.info}
                        </svg>
                        <span>No hay unidades disponibles de otros modelos</span>
                    </div>
                {:else}
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {#each data.unidadesOtrosModelos as unidad}
                            <div class="card bg-base-200 border-2 border-secondary/20">
                                <div class="card-body p-4">
                                    <div class="flex items-center justify-between">
                                        <div>
                                            <h5 class="font-semibold">{unidad.marca} {unidad.modelo}</h5>
                                            <p class="text-sm opacity-70">Patente: {unidad.patente}</p>
                                            <p class="text-sm font-medium text-secondary">${unidad.precioPorDia}/día</p>
                                        </div>
                                        <input 
                                            type="radio" 
                                            name="unidad" 
                                            value={unidad.patente}
                                            bind:group={patenteSeleccionada}
                                            class="radio radio-secondary"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Mensaje cuando no hay unidades disponibles en ningún grupo -->
            {#if data.unidadesModeloReservado.length === 0 && data.unidadesOtrosModelos.length === 0}
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        {@html svgIcons.warning}
                    </svg>
                    <span>No hay unidades disponibles para asignar en este momento</span>
                </div>
            {/if}

            <form method="POST" action="?/asignarUnidad" use:enhance={submitAsignar}>
                <input type="hidden" name="reservaId" value={reserva.id} />
                <input type="hidden" name="estado" value="Entregada" />
                <input type="hidden" name="patente" value={patenteSeleccionada} />
                <input type="hidden" name="adicionales" value={Object.entries(adicionalesSeleccionados).filter(([, seleccionado]) => seleccionado === 1).map(([id]) => id).join(',')} />
                
                <div class="card-actions justify-end mt-4">
                    <button 
                        type="submit"
                        class="btn btn-primary"
                        disabled={!patenteSeleccionada || loading}
                    >
                        {#if loading}
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                {@html svgIcons.loading.circle}
                                {@html svgIcons.loading.path}
                            </svg>
                            Asignando vehículo...
                        {:else}
                            Asignar vehículo
                        {/if}
                    </button>
                    <a href="/admin/reservas" class="btn" class:disabled={loading}>Cancelar</a>
                </div>
            </form>
        </div>
    </div>

    
</div>