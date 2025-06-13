<script lang="ts">
    import { goto } from '$app/navigation';
    import { afterNavigate } from '$app/navigation';
    import type { PageData } from './$types';
    
    export let data: PageData;

    interface UnidadAgrupada {
        marca: string;
        modelo: string;
        imagenBlob: string | null;
        capacidadPasajeros: number;
        precioPorDia: number;
        nombreSucursal: string;
        direccionSucursal: string;
        unidadesDisponibles: number;
    }

    let fechaInicio = data.fechaInicio;
    let fechaFin = data.fechaFin;
    let ubicacion = decodeURIComponent(data.ubicacion);
    let mensajeSolapamiento = '';

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

    async function handleReservar(marca: string, modelo: string) {
        console.log('is logged: ', data.isLoggedIn);
        const pagoPagina = `/pago/${data.fechaInicio}/${data.fechaFin}/${encodeURIComponent(data.ubicacion)}/${encodeURIComponent(marca)}/${encodeURIComponent(modelo)}`;
        const paginaActual = window.location.pathname;
        
        if (data.isLoggedIn === false) {
            // Redirigir al inicio de sesión with redirectTo
            goto(`/ingresar?redirectTo=${encodeURIComponent(paginaActual)}`);
        } else {
            const formData = new FormData();
            formData.append('fechaInicio', data.fechaInicio);
            formData.append('fechaFin', data.fechaFin);

            const response = await fetch('?/tieneReservasEnRango', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            console.log('Response from server:', result);

            if (typeof result.data === 'string') {
                result.data = JSON.parse(result.data);
            }

            console.log('Parsed response:', result.data);

            if (result.data[1] == false){
                goto(pagoPagina);
            } else {
                mensajeSolapamiento = 'Ya tiene una reserva pendiente en el rango de fechas seleccionado.';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    }

    function handleImageError(event: Event) {
        const img = event.currentTarget as HTMLImageElement;
        img.src = '/no-image-icon.svg';
    }

    function getImageUrlFromBlob(base64Data: string | null) {
        if (!base64Data) {
            return '/no-image-icon.svg';
        }
        try {
            return `data:image/jpeg;base64,${base64Data}`;
        } catch (error) {
            return '/no-image-icon.svg';
        }
    }

    // Statement reactivo para filtrar vehículos
    $: vehiculosFiltrados = data.unidadesDisponibles?.filter(v => {
        const cumplePrecio = !filtros.precioMaximo || (
            filtros.precioMaximo === 999999 
                ? v.precioPorDia > 20000
                : v.precioPorDia <= filtros.precioMaximo
        );
        const cumpleCapacidad = !filtros.capacidadMinima || 
            v.capacidadPasajeros >= filtros.capacidadMinima;
        const cumpleCategoria = !filtros.categoria || 
            v.categoria === filtros.categoria;
        
        return cumplePrecio && cumpleCapacidad && cumpleCategoria;
    });

    // Use the server data directly since it's already grouped
    $: groupedVehiclesArray = vehiculosFiltrados || [];

    // Variables para los filtros
    let filtros = {
        precioMaximo: null as number | null,
        capacidadMinima: null as number | null,
        categoria: '' as string
    };

    // Funciones auxiliares para los filtros
    function obtenerRangosPrecios(vehiculos: any[]) {
        const rangos = [
            { max: 5000, label: 'Hasta $5.000' },
            { max: 10000, label: 'Hasta $10.000' },
            { max: 15000, label: 'Hasta $15.000' },
            { max: 20000, label: 'Hasta $20.000' },
            { max: 999999, label: 'Más de $20.000' }
        ];

        // Filtrar rangos que tienen al menos un vehículo
        return rangos.filter(rango => {
            const hayVehiculos = vehiculos.some(v => {
                if (rango.max === 999999) {
                    return v.precioPorDia > 20000;
                }
                return v.precioPorDia <= rango.max;
            });
            return hayVehiculos;
        });
    }

    function obtenerCapacidadesUnicas(vehiculos: any[]) {
        return [...new Set(vehiculos.map(v => v.capacidadPasajeros))].sort((a, b) => a - b);
    }

    function obtenerCategoriasUnicas(vehiculos: any[]) {
        return [...new Set(vehiculos.map(v => v.categoria))];
    }

    // Función para contar vehículos por filtro
    function contarVehiculosPorFiltro(vehiculos: any[], filtroActual: any) {
        return vehiculos.filter(v => {
            const cumplePrecio = !filtroActual.precioMaximo || (
                filtroActual.precioMaximo === 999999 
                    ? v.precioPorDia > 20000
                    : v.precioPorDia <= filtroActual.precioMaximo
            );
            const cumpleCapacidad = !filtros.capacidadMinima || 
                v.capacidadPasajeros >= filtroActual.capacidadMinima;
            const cumpleCategoria = !filtros.categoria || 
                v.categoria === filtroActual.categoria;
                
            return cumplePrecio && cumpleCapacidad && cumpleCategoria;
        }).length;
    }
</script>

<div class="container mx-auto p-8">
    {#if mensajeSolapamiento}
        <div class="alert alert-warning">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>{mensajeSolapamiento}</span>
        </div>
    {/if}

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
    
    <!-- Nueva estructura de dos columnas -->
    <div class="flex flex-col md:flex-row gap-8">
        {#if data.unidadesDisponibles && data.unidadesDisponibles.length > 0}
            <p class="text-sm text-gray-600 mb-4">
       
        <!-- Columna de filtros (izquierda) -->
        <div class="md:w-1/4">
            <div class="bg-base-100 shadow-lg rounded-lg p-6 sticky top-4">
                <h2 class="text-xl font-semibold mb-6">Filtros</h2>
                
                <!-- Filtro de Precio -->
                <div class="mb-8">
                    <h3 class="font-semibold mb-4">Precio por día</h3>
                    <div class="space-y-2">
                        {#each obtenerRangosPrecios(data.unidadesDisponibles) as rango}
                            <label class="flex items-center gap-2">
                                <input 
                                    type="radio" 
                                    class="radio radio-primary"
                                    name="precio"
                                    bind:group={filtros.precioMaximo}
                                    value={rango.max}
                                />
                                <span>{rango.label}</span>
                            </label>
                        {/each}
                    </div>
                </div>

                <!-- Filtro de Capacidad -->
                <div class="mb-8">
                    <h3 class="font-semibold mb-4">Capacidad mínima</h3>
                    <div class="space-y-2">
                        {#each obtenerCapacidadesUnicas(data.unidadesDisponibles) as capacidad}
                            <label class="flex items-center gap-2">
                                <input 
                                    type="radio" 
                                    class="radio radio-primary"
                                    name="capacidad"
                                    bind:group={filtros.capacidadMinima}
                                    value={capacidad}
                                    disabled={contarVehiculosPorFiltro(data.unidadesDisponibles, {...filtros, capacidadMinima: capacidad}) === 0}
                                />
                                <span>{capacidad} pasajeros</span>
                            </label>
                        {/each}
                    </div>
                </div>

                <!-- Filtro de Categoría -->
                 {#if obtenerCategoriasUnicas(data.unidadesDisponibles).filter(cat => cat !== null && cat !== undefined && cat !== '').length > 0}
                    <div class="mb-8">
                        <h3 class="font-semibold mb-4">Categoría</h3>
                        <div class="space-y-2">
                            {#each obtenerCategoriasUnicas(data.unidadesDisponibles).filter(cat => cat !== null && cat !== undefined && cat !== '') as cat}
                                <label class="flex items-center gap-2">
                                    <input 
                                        type="radio" 
                                        class="radio radio-primary"
                                        name="categoria"
                                        bind:group={filtros.categoria}
                                        value={cat}
                                        disabled={contarVehiculosPorFiltro(data.unidadesDisponibles, {...filtros, categoria: cat}) === 0}
                                    />
                                    <span>{cat}</span>
                                </label>
                            {/each}
                        </div>
                    </div>
                {/if}

                {#if filtros.precioMaximo || filtros.capacidadMinima || filtros.categoria}
                    <button 
                        class="btn btn-outline btn-sm w-full"
                        on:click={() => {
                            filtros = {
                                precioMaximo: null,
                                capacidadMinima: null,
                                categoria: ''
                            };
                        }}
                    >
                        Limpiar filtros
                    </button>
                {/if}
            </div>
        </div>
         {/if}

        <!-- Columna de resultados (derecha) -->
        <div class="md:w-3/4">
            {#if !data.unidadesDisponibles || data.unidadesDisponibles.length === 0}
                <div class="alert alert-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>No se encontraron vehículos disponibles para las fechas seleccionadas.</span>
                </div>
            {:else if groupedVehiclesArray.length === 0}
                <div class="alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span>No se encontraron vehículos que coincidan con los filtros seleccionados.</span>
                </div>
            {:else}
                <div class="flex flex-col gap-6">
                    {#each groupedVehiclesArray as unidad (unidad.marca + unidad.modelo)}
                        <div class="card bg-base-100 shadow-lg border border-gray-200 rounded-lg overflow-hidden">
                            <div class="flex flex-row">
                                <figure class="w-80 p-4 flex items-center justify-center bg-gray-50">
                                    <img 
                                        src={unidad.imagenBlob ? getImageUrlFromBlob(unidad.imagenBlob) : '/no-image-icon.svg'} 
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
                                        <div class="badge badge-primary badge-lg">Unidades disponibles: {unidad.unidadesDisponibles}</div>
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
                                                <span class="font-semibold text-gray-600 text-lg">Dirección:</span>
                                                <span class="badge badge-outline px-3 py-1 text-base">{unidad.direccionSucursal}</span>
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
    </div>
</div>