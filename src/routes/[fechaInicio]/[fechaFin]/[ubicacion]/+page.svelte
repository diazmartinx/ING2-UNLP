<script lang="ts">
    import { goto } from '$app/navigation';
    import { afterNavigate } from '$app/navigation';
    import type { PageData } from './$types';
    
    export let data: PageData;

    let fechaInicio = data.fechaInicio;
    let fechaFin = data.fechaFin;
    let ubicacion = decodeURIComponent(data.ubicacion);

    afterNavigate(() => {
        fechaInicio = data.fechaInicio;
        fechaFin = data.fechaFin;
        ubicacion = decodeURIComponent(data.ubicacion);
    });

    function formatDate(dateStr: string): string {
        const [year, month, day] = dateStr.split('-');
        return `${day}-${month}-${year}`;
    }

    function handleSearch() {
        goto(`/${fechaInicio}/${fechaFin}/${encodeURIComponent(ubicacion)}`);
    }

    function handleReservar(marca: string, modelo: string) {
        goto(`/reservar/${data.fechaInicio}/${data.fechaFin}/${data.ubicacion}/${marca}/${modelo}`);
    }

    function handleImageError(event: Event) {
        const img = event.currentTarget as HTMLImageElement;
        img.src = '/no-image-icon.svg';
    }

    // Create a reactive statement for groupedVehicles that updates when data changes
    $: groupedVehicles = data.unidadesDisponibles?.reduce((acc, vehicle) => {
        const key = `${vehicle.marca}-${vehicle.modelo}`;
        if (!acc[key]) {
            acc[key] = {
                marca: vehicle.marca,
                modelo: vehicle.modelo,
                imagenUrl: vehicle.imagenUrl,
                capacidadPasajeros: vehicle.capacidadPasajeros,
                precioPorDia: vehicle.precioPorDia,
                nombreSucursal: vehicle.nombreSucursal,
                count: 1
            };
        } else {
            acc[key].count++;
        }
        return acc;
    }, {} as Record<string, any>);
</script>

<div class="container mx-auto p-8">
    <div class="bg-base-100 shadow-lg rounded-lg p-6 mb-8">
        <form on:submit|preventDefault={handleSearch} class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="form-control">
                <label class="label" for="fechaInicio">
                    <span class="label-text">Fecha de inicio</span>
                </label>
                <input 
                    id="fechaInicio"
                    type="date" 
                    bind:value={fechaInicio}
                    class="input input-bordered w-full" 
                    required
                />
            </div>
            <div class="form-control">
                <label class="label" for="fechaFin">
                    <span class="label-text">Fecha de fin</span>
                </label>
                <input 
                    id="fechaFin"
                    type="date" 
                    bind:value={fechaFin}
                    class="input input-bordered w-full" 
                    required
                />
            </div>
            <div class="form-control">
                <label class="label" for="ubicacion">
                    <span class="label-text">Sucursal</span>
                </label>
                <select 
                    id="ubicacion"
                    bind:value={ubicacion}
                    class="select select-bordered w-full"
                    required
                >
                    {#each data.sucursales as sucursal}
                        <option value={sucursal}>{sucursal}</option>
                    {/each}
                </select>
            </div>
            <div class="form-control flex items-end">
                <button type="submit" class="btn btn-primary w-full">
                    Buscar
                </button>
            </div>
        </form>
    </div>

    <h1 class="text-2xl font-bold mb-4">Resultados de Búsqueda</h1>
    <p class="mb-6">Buscando alquileres desde el <strong>{formatDate(data.fechaInicio)}</strong> hasta el <strong>{formatDate(data.fechaFin)}</strong> en <strong>{data.ubicacion}</strong>.</p>
    
    {#if !data.unidadesDisponibles || data.unidadesDisponibles.length === 0}
        <div class="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>No se encontraron vehículos disponibles para las fechas seleccionadas.</span>
        </div>
    {:else}
        <div class="flex flex-col gap-6">
            {#each Object.values(groupedVehicles) as unidad}
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
                                <div class="badge badge-primary badge-lg">Unidades disponibles: {unidad.count}</div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-4">
                                    <p class="flex items-center gap-2">
                                        <span class="font-semibold text-gray-600 text-lg">Capacidad:</span>
                                        <span class="badge badge-outline px-3 py-1 text-base">{unidad.capacidadPasajeros} pasajeros</span>
                                    </p>
                                    <p class="flex items-center gap-2">
                                        <span class="font-semibold text-gray-600 text-lg">Sucursal:</span>
                                        <span class="badge badge-outline px-3 py-1 text-base">{unidad.nombreSucursal}</span>
                                    </p>
                                    <p class="flex items-center gap-2">
                                        <span class="font-semibold text-gray-600 text-lg">Precio por día:</span>
                                        <span class="badge badge-primary px-3 py-1 text-base">${unidad.precioPorDia}</span>
                                    </p>
                                </div>
                            </div>
                            <div class="card-actions justify-end mt-4">
                                <button 
                                    class="btn btn-primary"
                                    on:click={() => handleReservar(unidad.marca, unidad.modelo)}
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