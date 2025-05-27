<script lang="ts">
    import { page } from '$app/stores';
    import { formatDate } from '$lib/utils';
    import type { PageData } from './$types';

    interface Reserva {
        id: number;
        fechaInicio: number;
        fechaFin: number;
        fechaCreacion: number;
        estado: string;
        dniCliente: string;
        patenteUnidadAsignada: string;
        nombreCliente: string;
        apellidoCliente: string;
        emailCliente: string;
        telefonoCliente: string;
        modeloVehiculoReservado: string;
        modeloVehiculoAsignado: string;
        anioVehiculoReservado: number;
        anioVehiculoAsignado: number;
        marcaVehiculoReservado: string;
        marcaVehiculoAsignado: string;
        nombreModeloReservado: string;
        nombreModeloAsignado: string;
        precioPorDia: number;
        importeTotal: number;
    }

    export let data: PageData;
    const { reserva, error } = data as { reserva?: Reserva; error?: string };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'Pendiente':
                return 'bg-yellow-100 text-yellow-800';
            case 'Entregada':
                return 'bg-green-100 text-green-800';
            case 'Cancelada':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    function formatDateOnly(date: number | string | Date): string {
        const d = new Date(date);
        return d.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatDateTime(date: number | string | Date): string {
        const d = new Date(date);
        return d.toLocaleString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Argentina/Buenos_Aires'
        });
    }

    function formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount);
    }
</script>

<div class="container mx-auto px-4 py-8">
    <div class="mb-6">
        <a href="/admin/reservas" class="text-blue-600 hover:text-blue-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Volver a Reservas
        </a>
    </div>

    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="p-6">
            {#if error}
                <div class="text-center py-8">
                    <h2 class="text-2xl font-bold text-gray-900 mb-4">Error</h2>
                    <p class="text-gray-600">{error}</p>
                </div>
            {:else if reserva}
                <div class="flex justify-between items-center mb-6">
                    <h1 class="text-2xl font-bold text-gray-900">Detalles de la Reserva #{reserva.id}</h1>
                    <span class={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(reserva.estado)}`}>
                        {reserva.estado}
                    </span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Información del Cliente -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h2 class="text-lg font-semibold mb-4 text-gray-900">Información del Cliente</h2>
                        <div class="space-y-3">
                            <p><span class="font-medium">Nombre:</span> {reserva.nombreCliente} {reserva.apellidoCliente}</p>
                            <p><span class="font-medium">DNI:</span> {reserva.dniCliente}</p>
                            <p><span class="font-medium">Email:</span> {reserva.emailCliente}</p>
                            <p><span class="font-medium">Teléfono:</span> {reserva.telefonoCliente}</p>
                        </div>
                    </div>

                    <!-- Información del Vehículo -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-lg font-semibold text-gray-900">Información de la Unidad</h2>
                            <a href="/admin/reservas/{reserva.id}/cambiar-estado" class="text-blue-600 hover:text-blue-800 flex items-center">
                                Cambiar unidad asignada
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </a>
                        </div>
                        <div class="space-y-4">
                            <div class="border-b pb-3">
                                <h3 class="font-medium text-gray-700 mb-2">Modelo Reservado</h3>
                                <div class="space-y-2">
                                    <p>{reserva.marcaVehiculoReservado} {reserva.nombreModeloReservado}</p>
                                </div>
                            </div>
                            <div>
                                <h3 class="font-medium text-gray-700 mb-2">Unidad Asignada</h3>
                                <div class="space-y-2">
                                    <p><span class="font-medium">Patente:</span> {reserva.patenteUnidadAsignada}</p>
                                    <p><span class="font-medium">Marca:</span> {reserva.marcaVehiculoAsignado}</p>
                                    <p><span class="font-medium">Modelo:</span> {reserva.nombreModeloAsignado}</p>
                                    <p><span class="font-medium">Año:</span> {reserva.anioVehiculoAsignado}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Información de la Reserva -->
                    <div class="bg-gray-50 p-4 rounded-lg md:col-span-2">
                        <h2 class="text-lg font-semibold mb-4 text-gray-900">Detalles de la Reserva</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p><span class="font-medium">Fecha de Inicio:</span> {formatDateOnly(reserva.fechaInicio)}</p>
                                <p><span class="font-medium">Fecha de Fin:</span> {formatDateOnly(reserva.fechaFin)}</p>
                                <p><span class="font-medium">Fecha de Creación:</span> {formatDateTime(reserva.fechaCreacion)}</p>
                            </div>
                            <div>
                                <p class="text-lg font-semibold text-gray-900">Importe Total: {formatCurrency(reserva.importeTotal)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</div> 