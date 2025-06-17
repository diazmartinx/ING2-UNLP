<script lang="ts">
    import type { PageData } from './$types';
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { Chart } from 'chart.js/auto';
    import { onMount } from 'svelte';

    interface ReporteSucursal {
        sucursal: string;
        cantidad: number;
    }

    interface ReporteIngresos {
        sucursal: string;
        ingresos: number;
    }

    interface CustomPageData extends PageData {
        cantidadPorSucursal: ReporteSucursal[];
        ingresosPorSucursal: ReporteIngresos[];
        totalReservas: number;
        totalIngresos: number;
    }

    let { data } = $props<{ data: CustomPageData }>();
    let fechaInicio = $state('');
    let fechaFin = $state('');
    let mes = $state('');
    let chartReservas: Chart;
    let chartIngresos: Chart;

    // Genera las opciones de meses para el selector
    function generarOpcionesMeses() {
        const añoActual = new Date().getFullYear();
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        return meses.map((mesNombre, index) => ({
            valor: `${añoActual}-${(index + 1).toString().padStart(2, '0')}`,
            etiqueta: `${mesNombre} ${añoActual}`
        }));
    }

    const opcionesMeses = generarOpcionesMeses();

    // Función para actualizar la URL con los filtros
    function actualizarFiltros() {
        const params = new URLSearchParams();
        
        if (mes) {
            params.set('mes', mes);
        } else if (fechaInicio && fechaFin) {
            params.set('fechaInicio', fechaInicio);
            params.set('fechaFin', fechaFin);
        }
        
        goto(`?${params.toString()}`, { replaceState: true });
    }

    // Función para crear/actualizar los gráficos
    function actualizarGraficos() {
        const ctx1 = document.getElementById('chartReservas') as HTMLCanvasElement;
        const ctx2 = document.getElementById('chartIngresos') as HTMLCanvasElement;

        if (chartReservas) chartReservas.destroy();
        if (chartIngresos) chartIngresos.destroy();

        chartReservas = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: data.cantidadPorSucursal.map((item: ReporteSucursal) => item.sucursal),
                datasets: [{
                    label: 'Cantidad de Reservas',
                    data: data.cantidadPorSucursal.map((item: ReporteSucursal) => item.cantidad),
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });

        chartIngresos = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: data.ingresosPorSucursal.map((item: ReporteIngresos) => item.sucursal),
                datasets: [{
                    label: 'Ingresos Totales (ARS)',
                    data: data.ingresosPorSucursal.map((item: ReporteIngresos) => item.ingresos),
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Actualizar gráficos cuando cambian los datos
    $effect(() => {
        if (browser && data) {
            setTimeout(actualizarGraficos, 0);
        }
    });

    onMount(() => {
        // Recuperar valores de la URL al cargar
        const searchParams = new URLSearchParams($page.url.search);
        fechaInicio = searchParams.get('fechaInicio') || '';
        fechaFin = searchParams.get('fechaFin') || '';
        mes = searchParams.get('mes') || '';
    });
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Reportes de Reservas</h1>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <!-- Títulos -->
            <div class="col-span-2">
                <h3 class="font-medium text-center h-5">Por rango de fechas</h3>
            </div>
            <div class="col-span-1">
                <h3 class="font-medium text-center h-5">Por mes específico</h3>
            </div>

            <!-- Controles -->
            <div class="col-span-2 grid grid-cols-2 gap-4">
                <div>
                    <label for="fecha-inicio" class="block text-sm font-medium text-gray-600">Desde</label>
                    <input
                        id="fecha-inicio"
                        type="date"
                        bind:value={fechaInicio}
                        onchange={() => {
                            mes = '';
                            actualizarFiltros();
                        }}
                        class="mt-1 block w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        max={fechaFin}
                    >
                </div>
                <div>
                    <label for="fecha-fin" class="block text-sm font-medium text-gray-600">Hasta</label>
                    <input
                        id="fecha-fin"
                        type="date"
                        bind:value={fechaFin}
                        onchange={() => {
                            mes = '';
                            actualizarFiltros();
                        }}
                        class="mt-1 block w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min={fechaInicio}
                    >
                </div>
            </div>

            <!-- Selector de mes -->
            <div class="col-span-1">
                <div class="relative">
                    <select
                        bind:value={mes}
                        onchange={() => {
                            fechaInicio = '';
                            fechaFin = '';
                            actualizarFiltros();
                        }}
                        class="mt-6 block w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                        <option value="">Seleccionar mes...</option>
                        {#each opcionesMeses as opcion}
                            <option value={opcion.valor}>{opcion.etiqueta}</option>
                        {/each}
                    </select>
                    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Gráfico de cantidad de reservas -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Cantidad de Reservas por Sucursal</h2>
            <canvas id="chartReservas"></canvas>
        </div>

        <!-- Gráfico de ingresos -->
        <div class="bg-white rounded-lg shadow p-6">
            <h2 class="text-lg font-semibold mb-4">Ingresos Totales por Sucursal</h2>
            <canvas id="chartIngresos"></canvas>
        </div>
    </div>

    <!-- Totales -->
    <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold mb-4 text-center">Totales</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="text-center">
                <h3 class="font-medium text-gray-600 mb-2">Total de Reservas</h3>
                <p class="text-2xl font-bold text-gray-800">{data.totalReservas}</p>
            </div>
            <div class="text-center">
                <h3 class="font-medium text-gray-600 mb-2">Total de Ingresos</h3>
                <p class="text-2xl font-bold text-gray-800">$ {data.totalIngresos.toLocaleString('es-AR')}</p>
            </div>
        </div>
    </div>
</div>
