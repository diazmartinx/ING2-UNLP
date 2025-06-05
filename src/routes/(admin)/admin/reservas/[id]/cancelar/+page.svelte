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
    let loading = $state(false);

    async function cancelarReserva() {
        try {
            loading = true;
            error = '';
            successMessage = '';

            const formData = new FormData();
            formData.append('reservaId', reserva.id.toString());
            formData.append('estado', 'Cancelada');

            const response = await fetch('?/cancelarReserva', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.type === 'success') {
                successMessage = 'Reserva cancelada exitosamente';
                setTimeout(() => {
                    goto('/admin/reservas');
                }, 1500);
            } else {
                error = result.data?.error || 'Error al cancelar la reserva';
            }
        } catch (err) {
            error = 'Error al comunicarse con el servidor';
        } finally {
            loading = false;
        }
    }
</script>

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
    </div>

    <!-- Success Message -->
    {#if successMessage}
        <div class="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
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
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
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
            <h3 class="card-title">Confirmar Cancelación</h3>
            <p class="text-lg mb-4">¿Estás seguro que deseas cancelar esta reserva?</p>
            
            <div class="card-actions justify-end gap-4">
                <a href="/admin/reservas" class="btn" class:disabled={loading}>No, volver</a>
                <button 
                    class="btn btn-error"
                    onclick={cancelarReserva}
                    disabled={loading}
                >
                    {#if loading}
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cancelando...
                    {:else}
                        Sí, cancelar reserva
                    {/if}
                </button>
            </div>
        </div>
    </div>
</div> 