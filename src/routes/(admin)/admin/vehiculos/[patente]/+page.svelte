<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto px-4 py-6">
    <a href="/admin/vehiculos" class="btn btn-outline btn-sm mb-4">
        ← Volver
    </a>
    
    <h1 class="text-2xl font-bold mb-6">Detalles del Vehículo</h1>
    
    <div class="card bg-base-100 shadow-md">
        <div class="card-body">
            <div class="space-y-4">
                <!-- Basic Info -->
                <div class="flex justify-between items-center">
                    <span class="font-medium">Patente:</span>
                    <span class="font-bold">{data.vehiculo.patente}</span>
                </div>
                
                <div class="flex justify-between items-center">
                    <span class="font-medium">Estado:</span>
                    <span class="badge {data.vehiculo.estado === 'Habilitado' ? 'badge-success' : 
                                       data.vehiculo.estado === 'Inhabilitado' ? 'badge-warning' : 
                                       'badge-error'}">
                        {data.vehiculo.estado}
                    </span>
                </div>

                <!-- Model Info -->
                {#if data.vehiculo.modelo}
                <div class="flex justify-between items-center">
                    <span class="font-medium">Modelo:</span>
                    <span>{data.vehiculo.modelo.modelo}</span>
                </div>
                
                <div class="flex justify-between items-center">
                    <span class="font-medium">Marca:</span>
                    <span>{data.vehiculo.modelo.marca}</span>
                </div>
                
                <div class="flex justify-between items-center">
                    <span class="font-medium">Capacidad:</span>
                    <span>{data.vehiculo.modelo.capacidadPasajeros} pasajeros</span>
                </div>
                
                <div class="flex justify-between items-center">
                    <span class="font-medium">Precio por día:</span>
                    <span class="font-bold text-primary">${data.vehiculo.modelo.precioPorDia}</span>
                </div>
                {:else}
                <div class="flex justify-between items-center">
                    <span class="font-medium">Modelo:</span>
                    <span class="text-base-content/50 italic">No asignado</span>
                </div>
                {/if}

                <!-- Category -->
                <div class="flex justify-between items-center">
                    <span class="font-medium">Categoría:</span>
                    {#if data.vehiculo.categoria}
                        <span class="badge badge-outline">{data.vehiculo.categoria.nombre}</span>
                    {:else}
                        <span class="text-base-content/50 italic">No asignada</span>
                    {/if}
                </div>

                <!-- Branch -->
                <div class="flex justify-between items-center">
                    <span class="font-medium">Sucursal:</span>
                    {#if data.vehiculo.sucursal}
                        <span>{data.vehiculo.sucursal.nombre} - {data.vehiculo.sucursal.direccion}</span>
                    {:else}
                        <span class="text-base-content/50 italic">No asignada</span>
                    {/if}
                </div>

                <!-- Reservations -->
                <div class="divider"></div>
                <div>
                    <h3 class="font-medium mb-2">Reservas ({data.vehiculo.reservas.length})</h3>
                    {#if data.vehiculo.reservas.length > 0}
                        <div class="space-y-2">
                            {#each data.vehiculo.reservas as { fechaInicio, fechaFin, estado, importeTotal, fechaCreacion }}
                                <div class="flex justify-between items-center p-2 bg-base-200 rounded">
                                    <div>
                                        <span class="badge {estado === 'Entregada' ? 'badge-success' : 
                                                           estado === 'Pendiente' ? 'badge-warning' : 
                                                           estado === 'Cancelada' ? 'badge-error' : 
                                                           'badge-neutral'} badge-sm mr-2">
                                            {estado}
                                        </span>
                                        {#if fechaInicio && fechaFin}
                                            <span class="text-sm">
                                                {new Date(fechaInicio).toLocaleDateString()} - {new Date(fechaFin).toLocaleDateString()}
                                            </span>
                                        {/if}
                                    </div>
                                    {#if importeTotal}
                                        <span class="font-semibold text-primary">${importeTotal}</span>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <p class="text-base-content/50 italic">No hay reservas registradas</p>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>
