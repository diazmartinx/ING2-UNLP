<script lang="ts">
    import type { PageData } from './$types';
    const { data } = $props<{ data: PageData }>();

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
    <h1 class="text-3xl font-bold mb-6">Mis Reservas</h1>

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
                                    {reserva.marca} {reserva.modelo}
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
                                <button class="btn btn-error btn-sm">
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
</div> 