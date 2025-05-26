<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<a href="/admin/vehiculos" class="link mb-2">Volver</a>
<dl class="max-w-md text-gray-900 divide-y divide-gray-200 ">
    <div class="flex flex-col pb-3">
        <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Número de patente:</dt>
        <dd class="text-lg font-semibold">{data.vehiculo.patente}</dd>
    </div>

    {#if data.vehiculo.modelo}
    <div class="flex flex-col py-3">
        <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Modelo</dt>
        <dd class="text-lg font-semibold">{data.vehiculo.modelo.modelo}</dd>
    </div>
    <div class="flex flex-col py-3">
        <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Marca</dt>
        <dd class="text-lg font-semibold">{data.vehiculo.modelo.marca}</dd>
    </div>
    <div class="flex flex-col py-3">
        <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Capacidad</dt>
        <dd class="text-lg font-semibold">{data.vehiculo.modelo.capacidadPasajeros}</dd>
    </div>
    <div class="flex flex-col py-3">
        <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Precio por día</dt>
        <dd class="text-lg font-semibold">{data.vehiculo.modelo.precioPorDia}</dd>
    </div>

    {:else}
    <div class="flex flex-col py-3">
        <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Modelo</dt>
        <dd class="text-lg font-semibold">No hay modelo asignado</dd>
    </div>
    {/if}

    {#if data.vehiculo.categoria}
    <div class="flex flex-col py-3">
        <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Categoria</dt>
        <dd class="text-lg font-semibold">{data.vehiculo.categoria.nombre}</dd>
    </div>
    {:else}
    <div class="flex flex-col py-3">
        <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Categoría</dt>
        <dd class="text-lg font-semibold">No hay categoría asignada</dd>
    </div>
    {/if}

    <div class="flex flex-col py-3">
        <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Estado del vehículo</dt>
        <dd class="text-lg font-semibold">{data.vehiculo.estado}</dd>
    </div>

    {#if data.vehiculo.sucursal}
    <div class="flex flex-col py-3">
        <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Sucursal y dirección</dt>
        <dd class="text-lg font-semibold">{data.vehiculo.sucursal.nombre} -  {data.vehiculo.sucursal.direccion}</dd>
    </div>
    {:else}
    <div class="flex flex-col py-3">
        <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Sucursal y dirección</dt>
        <dd class="text-lg font-semibold">No hay sucursal asignada</dd>
    </div>
    {/if}

    {#if data.vehiculo.reservas.length > 0}
    <div class="flex flex-col pt-3">
        <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Reservas</dt>
        {#each data.vehiculo.reservas as { fechaInicio, fechaFin, estado, importeTotal, fechaCreacion }}
            <ol class="max-w-md space-y-1 text-gray-500 list-decimal list-inside dark:text-gray-400">
                <li>
                    Estado: <span class="font-semibold text-gray-900 dark:text-white"> {estado}</span> 
                </li>
            </ol>
        {/each}
    </div>
    {:else}
    <div class="flex flex-col pt-3">
        <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Reservas</dt>
        <dd class="text-lg font-semibold">No hay reservas</dd>
    </div>
    {/if}
</dl>
