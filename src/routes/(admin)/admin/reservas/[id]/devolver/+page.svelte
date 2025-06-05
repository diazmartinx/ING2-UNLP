<script lang="ts">
    import type { PageData } from './$types';
    import { invalidate } from '$app/navigation';
    import { goto } from '$app/navigation';

    let { data }: { data: PageData } = $props();
    const reserva = (data.reserva as unknown as Reserva[])[0];
    
    interface Reserva {
        id: number;
        estado: "Pendiente" | "Entregada" | "Cancelada";
        fechaInicio: Date;
        fechaFin: Date;
        patenteUnidadAsignada: string | null;
        modeloReservado: string;
        marcaReservada: string;
        anioReservado: number;
    }
    
    let error = $state('');
    let successMessage = $state('');
    let showSuccessToast = $state(false);
    let marcaSeleccionada = $state('');
    let modeloSeleccionado = $state('');
    let patenteSeleccionada = $state('');
    let estadoReserva = $state('');

    type Unidad = {
        patente: string;
        marca: string | null;
        modelo: string | null;
    };

    const estadosReserva = [
        { value: 'Entregada', label: 'Entregada' },
        { value: 'Cancelada', label: 'Cancelada' }
    ];

    const marcas = $derived([...new Set(data.unidades
        .filter((u: Unidad) => u.marca !== null)
        .map((u: Unidad) => u.marca as string))]);
    
    const modelos = $derived(marcaSeleccionada 
        ? [...new Set(data.unidades
            .filter((u: Unidad) => u.marca === marcaSeleccionada && u.modelo !== null)
            .map((u: Unidad) => u.modelo as string))]
        : []);

    const patentes = $derived(marcaSeleccionada && modeloSeleccionado
        ? data.unidades
            .filter((u: Unidad) => u.marca === marcaSeleccionada && u.modelo === modeloSeleccionado)
            .map((u: Unidad) => u.patente)
        : []);

    async function cambiarEstado() {
        try {
            if (estadoReserva === 'Cancelada' && reserva.estado === 'Entregada') {
                error = 'No se puede cancelar una reserva que ya fue entregada';
                return;
            }

            const formData = new FormData();
            formData.append('reservaId', reserva.id.toString());
            formData.append('estado', estadoReserva);
            
            if (estadoReserva === 'Entregada') {
                if (!patenteSeleccionada) {
                    error = 'Se debe asignar una unidad';
                    return;
                }
                formData.append('patente', patenteSeleccionada);
            }

            const response = await fetch('?/asignarUnidad', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.type === 'success') {
                showSuccessToast = true;
                setTimeout(() => {
                    goto('/admin/reservas');
                }, 1500);
            } else {
                error = result.data?.error || 'Error al cambiar el estado de la reserva';
            }
        } catch (err) {
            error = 'Error al comunicarse con el servidor';
        }
    }
</script>

<div class="toast toast-top toast-end z-50">
    {#if showSuccessToast}
        <div class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{estadoReserva === 'Entregada' ? '¡Unidad asignada exitosamente!' : '¡Reserva cancelada exitosamente!'}</span>
        </div>
    {/if}
</div>

<div class="flex flex-col gap-6">
    <div class="flex justify-between items-center">
        <div class="mb-6">
            <a href="/admin/reservas" class="text-blue-600 hover:text-blue-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                </svg>
                Volver a Reservas
            </a>
        </div>
        {#if successMessage}
            <div class="text-green-600 font-medium">{successMessage}</div>
        {/if}
    </div>

    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <div class="flex justify-between items-center">
                <h3 class="card-title">Datos de la Reserva</h3>
                <a href="/admin/reservas/{reserva.id}" class="text-blue-600 hover:text-blue-800 flex items-center">
                    Ver más detalles
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
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
                    <p><span class="font-semibold">Fecha Inicio:</span> {new Date(reserva.fechaInicio).toLocaleDateString()}</p>
                    <p><span class="font-semibold">Fecha Fin:</span> {new Date(reserva.fechaFin).toLocaleDateString()}</p>
                    <p class="mt-2">
                        <span class="font-semibold">Estado:</span>
                        <span class="px-3 py-1 rounded-full text-sm font-medium {reserva.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                            reserva.estado === 'Entregada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            {reserva.estado}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h3 class="card-title">Cambiar Estado de la Reserva</h3>
            
            <div class="form-control w-full mb-4">
                <label class="label" for="estado">
                    <span class="label-text">Estado de la Reserva</span>
                </label>
                <select 
                    id="estado"
                    bind:value={estadoReserva}
                    class="select select-bordered w-full"
                >
                    <option value="">Seleccione un estado</option>
                    {#each estadosReserva as estado}
                        <option value={estado.value}>{estado.label}</option>
                    {/each}
                </select>
            </div>

            {#if estadoReserva === 'Entregada'}
                <h3 class="card-title mt-4">Seleccionar Unidad a Asignar</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="form-control w-full">
                        <label class="label" for="marca">
                            <span class="label-text">Marca</span>
                        </label>
                        <select 
                            id="marca"
                            bind:value={marcaSeleccionada}
                            class="select select-bordered w-full"
                        >
                            <option value="">Seleccione una marca</option>
                            {#each marcas as marca}
                                <option value={marca}>{marca}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="form-control w-full">
                        <label class="label" for="modelo">
                            <span class="label-text">Modelo</span>
                        </label>
                        <select 
                            id="modelo"
                            bind:value={modeloSeleccionado}
                            class="select select-bordered w-full"
                            disabled={!marcaSeleccionada}
                        >
                            <option value="">Seleccione un modelo</option>
                            {#each modelos as modelo}
                                <option value={modelo}>{modelo}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="form-control w-full">
                        <label class="label" for="patente">
                            <span class="label-text">Patente</span>
                        </label>
                        <select 
                            id="patente"
                            bind:value={patenteSeleccionada}
                            class="select select-bordered w-full"
                            disabled={!modeloSeleccionado}
                        >
                            <option value="">Seleccione una patente</option>
                            {#each patentes as patente}
                                <option value={patente}>{patente}</option>
                            {/each}
                        </select>
                    </div>
                </div>
            {/if}

            <div class="card-actions justify-end mt-4">
                {#if error}
                    <div class="text-red-600 mr-4 bg-red-50 px-4 py-2 rounded-lg flex items-center">
                        {error}
                    </div>
                {/if}
                <button 
                    class="btn btn-primary"
                    onclick={cambiarEstado}
                    disabled={!estadoReserva}
                >
                    Cambiar Estado
                </button>
                <a href="/admin/reservas" class="btn">Cancelar</a>
            </div>
        </div>
    </div>
</div> 