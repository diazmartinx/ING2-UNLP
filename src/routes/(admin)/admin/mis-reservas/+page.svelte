<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
    import { fly } from 'svelte/transition';

    const { data } = $props<{ data: PageData }>();

    interface Reserva {
        id: number;
        fechaInicio: number;
        fechaFin: number;
        estado: string;
        importeTotal: number;
        fechaCreacion: number;
        modeloReservado: string;
        marcaReservada: string;
        tipoPolitica: string;
        porcentajeReembolsoParcial: number | null;
    }

    let modalOpen = $state(false);
    let reservaSeleccionada = $state<Reserva | null>(null);

    let showSuccessMessage = $state(false);

    function formatDate(timestamp: number): string {
        return new Date(timestamp).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    function getEstadoClass(estado: string): string {
        switch (estado) {
            case 'Pendiente':
                return 'badge-warning';
            case 'Entregada':
                return 'badge-success';
            case 'Cancelada':
                return 'badge-error';
            default:
                return 'badge-ghost';
        }
    }
</script>

<div class="container mx-auto p-4">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">Mis Reservas</h1>
        {#if showSuccessMessage}
        <div class="alert alert-success" transition:fly={{ x: 200, duration: 2000 }}>
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Reserva cancelada con éxito.</span>
        </div>
        {/if}
    </div>

    {#if data.reservas.length === 0}
        <div class="text-center py-8">
            <p class="text-gray-600">Aún no hay reservas.</p>
        </div>
    {:else}
        <div class="overflow-x-auto">
            <!-- Encabezados -->
            <div class="grid grid-cols-6 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-center">
            <div class="font-semibold text-gray-600">Vehículo</div>
            <div class="font-semibold text-gray-600">Retiro</div>
            <div class="font-semibold text-gray-600">Devolución</div>
            <div class="font-semibold text-gray-600">Importe</div>
            <div class="font-semibold text-gray-600">Estado</div>
            <div></div>
        </div>

        <!-- Tarjetas -->
        {#each data.reservas as reserva}
            <div class="grid grid-cols-6 gap-4 px-4 py-2 rounded-lg items-center">
                <div class="text-center">
                    <span class="badge badge-outline px-3 py-1 truncate">{reserva.marcaReservada} {reserva.modeloReservado}</span>
                </div>
                <div class="text-center">
                    <span class="badge badge-ghost px-3 py-1">{formatDate(reserva.fechaInicio)}</span>
                </div>
                <div class="text-center">
                    <span class="badge badge-ghost px-3 py-1">{formatDate(reserva.fechaFin)}</span>
                </div>
                <div class="text-center">
                    <span class="badge badge-primary px-3 py-1">${reserva.importeTotal.toFixed(2)}</span>
                </div>
                <div class="text-center">
                    <span class="badge {getEstadoClass(reserva.estado)} px-3 py-1">{reserva.estado}</span>
                </div>
                <div class="text-center">
                    {#if reserva.estado === 'Pendiente'}
                        <button class="btn btn-error btn-sm" onclick={() => {
                            modalOpen = true;
                            reservaSeleccionada = reserva;
                        }}>
                            Cancelar
                        </button>
                    {/if}
                </div>
            </div>
        {/each}
        </div>
    {/if}

    <!-- Modal de confirmación -->
    {#if modalOpen}
        <div class="modal modal-open">
            <div class="modal-box">
                <h3 class="font-bold text-lg">Confirmar Cancelación</h3>
                {#if reservaSeleccionada}
                    <p class="py-4">
                        ¿Está seguro de que desea cancelar su reserva de {reservaSeleccionada.marcaReservada} {reservaSeleccionada.modeloReservado}?
                        <br>
                        Tipo de Reembolso: {reservaSeleccionada.tipoPolitica}
                        {#if reservaSeleccionada.tipoPolitica === 'Reembolso Parcial' && reservaSeleccionada.porcentajeReembolsoParcial}
                            <br>
                            Porcentaje de Reembolso: {reservaSeleccionada.porcentajeReembolsoParcial}%. 
                            Se le reembolsarán ${(reservaSeleccionada.importeTotal * reservaSeleccionada.porcentajeReembolsoParcial / 100).toFixed(2)} al cancelar la reserva.
                        {/if}
                    </p>
                {/if}
                <div class="modal-action">
                    <button class="btn btn-ghost" onclick={() => {
                        modalOpen = false;
                        reservaSeleccionada = null;
                    }}>Cancelar</button>
                    <form method="POST" action="?/cancelarReserva" use:enhance={() => {
                        return ({ result }) => {
                            if (result.type === 'success') {
                                showSuccessMessage = true;
                                setTimeout(() => {
                                    showSuccessMessage = false;
                                    window.location.reload();
                                }, 3000); // Ocultar después de 3 segundos
                            } else if (result.type === 'error') {
                                console.error("Error al cancelar la reserva");
                                alert("Ocurrió un error al cancelar la reserva.");
                            } else if (result.type === 'redirect') {
                                window.location.href = result.location;
                            }
                            modalOpen = false;
                            reservaSeleccionada = null;
                        };
                    }}>
                        <input type="hidden" name="idReserva" value={reservaSeleccionada?.id} />
                        <button type="submit" class="btn btn-error">Confirmar cancelación</button>
                    </form>
                </div>
            </div>
        </div>
    {/if}
</div>