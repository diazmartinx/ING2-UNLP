<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
    import { fly } from 'svelte/transition';

    const { data } = $props<{ data: PageData }>();

    let modalOpen = $state(false);
    let reservaSeleccionada = $state<{
        id: number;
        marca: string;
        modelo: string;
        tipoPolitica: string;
        importeTotal: number;
        porcentajeReembolsoParcial: number;
    } | null>(null);

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

<div class="container mx-auto p-4 max-w-4xl">
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
        <div class="flex flex-col gap-4">
            <!-- Encabezados -->
            <div class="flex flex-wrap items-center justify-center gap-4 px-4 py-2 bg-gray-50 rounded-lg">
                <div class="min-w-[250px] max-w-[350px] text-center">
                    <span class="font-semibold text-gray-600">Vehículo</span>
                </div>
                <div class="w-32 text-center">
                    <span class="font-semibold text-gray-600">Retiro</span>
                </div>
                <div class="w-32 text-center">
                    <span class="font-semibold text-gray-600">Devolución</span>
                </div>
                <div class="w-32 text-center">
                    <span class="font-semibold text-gray-600">Estado</span>
                </div>
                <div class="w-32 text-center">
                </div>
            </div>

            <!-- Tarjetas -->
            {#each data.reservas as reserva}
                <div class="card bg-base-100 shadow-lg border border-gray-200 rounded-lg overflow-hidden">
                    <div class="card-body p-4">
                        <div class="flex flex-wrap items-center justify-center gap-4">
                            <div class="min-w-[250px] max-w-[350px] text-center">
                                <span class="badge badge-outline px-3 py-1 truncate">
                                    {reserva.marca} {reserva.modelo} {reserva.tipoReembolso}
                                </span>
                            </div>
                            <div class="w-32 text-center">
                                <span class="badge badge-ghost px-3 py-1">
                                    {formatDate(reserva.fechaInicio)}
                                </span>
                            </div>
                            <div class="w-32 text-center">
                                <span class="badge badge-ghost px-3 py-1">
                                    {formatDate(reserva.fechaFin)}
                                </span>
                            </div>
                            <div class="w-32 text-center">
                                <span class="badge {getEstadoClass(reserva.estado)} px-3 py-1">
                                    {reserva.estado}
                                </span>
                            </div>
                            <div class="w-32 text-center">
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
                        ¿Está seguro de que desea cancelar su reserva de {reservaSeleccionada.marca} {reservaSeleccionada.modelo}?
                        <!-- Aquí deberías mostrar el tipo de reembolso y el porcentaje -->
                        <br>
                        Tipo de Reembolso: {reservaSeleccionada.tipoPolitica}
                        {#if (reservaSeleccionada.tipoPolitica === 'Reembolso Parcial')}
                            <br>
                            Porcentaje de Reembolso: {reservaSeleccionada.porcentajeReembolsoParcial}%. Se le reembolsará ${(reservaSeleccionada.importeTotal * reservaSeleccionada.porcentajeReembolsoParcial) / 100} al cancelar la reserva.
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