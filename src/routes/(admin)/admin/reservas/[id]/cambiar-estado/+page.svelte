<script lang="ts">
    import type { PageData } from './$types';
    import { invalidate } from '$app/navigation';
    import { goto } from '$app/navigation';

    let { data }: { data: PageData } = $props();
    
    let error = $state('');
    let successMessage = $state('');
    let marcaSeleccionada = $state('');
    let modeloSeleccionado = $state('');
    let patenteSeleccionada = $state('');

    type Unidad = {
        patente: string;
        marca: string | null;
        modelo: string | null;
    };

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

    async function asignarUnidad() {
        try {
            const formData = new FormData();
            formData.append('reservaId', data.reserva.id.toString());
            formData.append('patente', patenteSeleccionada);

            const response = await fetch('?/asignarUnidad', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.type === 'success') {
                successMessage = 'Unidad asignada exitosamente';
                setTimeout(() => {
                    goto('/admin/reservas');
                }, 2000);
            } else {
                error = result.data?.error || 'Error al asignar la unidad';
            }
        } catch (err) {
            error = 'Error al comunicarse con el servidor';
        }
    }
</script>

<div class="flex flex-col gap-6">
    <div class="flex justify-between items-center">
        <h2 class="text-3xl font-bold text-gray-800">Asignar Unidad a Reserva #{data.reserva.id}</h2>
        {#if successMessage}
            <div class="text-green-600 font-medium">{successMessage}</div>
        {/if}
    </div>

    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h3 class="card-title">Datos de la Reserva</h3>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p><span class="font-semibold">Cliente:</span> {data.reserva.nombreCliente} {data.reserva.apellidoCliente}</p>
                    <p><span class="font-semibold">DNI:</span> {data.reserva.dniCliente}</p>
                </div>
                <div>
                    <p><span class="font-semibold">Fecha Inicio:</span> {new Date(data.reserva.fechaInicio).toLocaleDateString()}</p>
                    <p><span class="font-semibold">Fecha Fin:</span> {new Date(data.reserva.fechaFin).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="mt-4">
                <h4 class="font-semibold mb-2">Unidad Reservada:</h4>
                <p><span class="font-semibold">Marca:</span> {data.reserva.unidadReservada.marca}</p>
                <p><span class="font-semibold">Modelo:</span> {data.reserva.unidadReservada.modelo}</p>
                <p><span class="font-semibold">Patente:</span> {data.reserva.unidadReservada.patente}</p>
            </div>
        </div>
    </div>

    <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
            <h3 class="card-title">Seleccionar Unidad</h3>
            
            {#if error}
                <div class="alert alert-error">
                    <span>{error}</span>
                </div>
            {/if}

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="form-control w-full">
                    <label class="label">
                        <span class="label-text">Marca</span>
                    </label>
                    <select 
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
                    <label class="label">
                        <span class="label-text">Modelo</span>
                    </label>
                    <select 
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
                    <label class="label">
                        <span class="label-text">Patente</span>
                    </label>
                    <select 
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

            <div class="card-actions justify-end mt-4">
                <button 
                    class="btn btn-primary"
                    onclick={asignarUnidad}
                    disabled={!patenteSeleccionada}
                >
                    Asignar Unidad
                </button>
                <a href="/admin/reservas" class="btn">Cancelar</a>
            </div>
        </div>
    </div>
</div> 