<script lang="ts">
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';
    
    export let data: PageData;

    function handleReservar(patente: string) {
        goto(`/reservar/${data.fechaInicio}/${data.fechaFin}/${data.ubicacion}/${patente}`);
    }

    function handleImageError(event: Event) {
        const img = event.currentTarget as HTMLImageElement;
        img.src = '/no-image-icon.svg';
    }
</script>

<div class="container mx-auto p-8">
    <h1 class="text-2xl font-bold mb-4">Resultados de Búsqueda</h1>
    <p class="mb-6">Buscando alquileres desde el <strong>{data.fechaInicio}</strong> hasta el <strong>{data.fechaFin}</strong> en <strong>{data.ubicacion}</strong>.</p>
    
    {#if !data.unidadesDisponibles || data.unidadesDisponibles.length === 0}
        <div class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>No se encontraron vehículos disponibles para las fechas seleccionadas.</span>
        </div>
    {:else}
        <div class="flex flex-col gap-6">
            {#each data.unidadesDisponibles as unidad}
                <div class="card bg-base-100 shadow-lg border border-gray-200 rounded-lg overflow-hidden">
                    <div class="flex flex-row">
                        <figure class="w-80 p-4 flex items-center justify-center bg-gray-50">
                            <img 
                                src={unidad.imagenUrl || '/no-image-icon.svg'} 
                                alt={`${unidad.marca} ${unidad.modelo}`} 
                                class="h-60 w-60 object-cover rounded-lg" 
                                style="max-width: 260px; max-height: 260px; width: 260px; height: 260px;"
                                on:error={handleImageError}
                            />
                        </figure>
                        <div class="card-body p-4 flex-1 flex flex-col justify-center">
                            <div class="flex justify-between items-start mb-4">
                                <h2 class="card-title text-2xl font-bold text-gray-800">
                                    {unidad.marca} {unidad.modelo}
                                </h2>
                                <div class="badge badge-primary badge-lg">Patente: {unidad.patente}</div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-3">
                                    <p class="flex items-center gap-2">
                                        <span class="font-semibold text-gray-600 text-lg">Año:</span>
                                        <span class="badge badge-secondary badge-lg px-3 py-1 text-base">{unidad.anio}</span>
                                    </p>
                                    <p class="flex items-center gap-2">
                                        <span class="font-semibold text-gray-600 text-lg">Capacidad:</span>
                                        <span class="badge badge-outline px-3 py-1 text-base">{unidad.capacidadPasajeros} pasajeros</span>
                                    </p>
                                </div>
                                <div class="space-y-3">
                                    <p class="flex items-center gap-2">
                                        <span class="font-semibold text-gray-600 text-lg">Precio por día:</span>
                                        <span class="badge badge-primary px-3 py-1 text-base">${unidad.precioPorDia}</span>
                                    </p>
                                    <p class="flex items-center gap-2">
                                        <span class="font-semibold text-gray-600 text-lg">Sucursal:</span>
                                        <span class="badge badge-outline px-3 py-1 text-base">{unidad.nombreSucursal}</span>
                                    </p>
                                </div>
                            </div>
                            <div class="card-actions justify-end mt-4">
                                <button 
                                    class="btn btn-primary"
                                    on:click={() => handleReservar(unidad.patente)}
                                >
                                    Reservar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div> 