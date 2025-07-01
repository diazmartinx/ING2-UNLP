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

    interface ReporteAdicionales {
        sucursal: string;
        ingresosAdicionales: number;
    }

    interface CustomPageData extends PageData {
        cantidadPorSucursal: ReporteSucursal[];
        ingresosPorSucursal: ReporteIngresos[];
        ingresosAdicionalesPorSucursal: ReporteAdicionales[];
        totalReservas: number;
        totalIngresos: number;
        totalIngresosAdicionales: number;
    }

    let { data } = $props<{ data: CustomPageData }>();
    let fechaInicio = $state('');
    let fechaFin = $state('');
    let mes = $state('');
    let chartReservas: Chart;
    let chartIngresos: Chart;
    let chartAdicionales: Chart;

    // Función para actualizar la URL con los filtros
    function actualizarFiltros() {
        const params = new URLSearchParams();
        if (fechaInicio && fechaFin) {
            params.set('fechaInicio', fechaInicio);
            params.set('fechaFin', fechaFin);
        }
        
        goto(`?${params.toString()}`, { replaceState: true });
    }

    // Función para crear/actualizar los gráficos
    function actualizarGraficos() {
        const ctx1 = document.getElementById('chartReservas') as HTMLCanvasElement;
        const ctx2 = document.getElementById('chartIngresos') as HTMLCanvasElement;
        const ctx3 = document.getElementById('chartAdicionales') as HTMLCanvasElement;

        if (chartReservas) chartReservas.destroy();
        if (chartIngresos) chartIngresos.destroy();
        if (chartAdicionales) chartAdicionales.destroy();

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
                datasets: [
                    {
                        label: 'Ingresos por Reservas (ARS)',
                        data: data.ingresosPorSucursal.map((item: ReporteIngresos) => item.ingresos),
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                        borderColor: 'rgb(75, 192, 192)',
                        borderWidth: 1
                    },
                    {
                        label: 'Ingresos por Adicionales (ARS)',
                        data: data.ingresosAdicionalesPorSucursal.map((item: ReporteAdicionales) => item.ingresosAdicionales),
                        backgroundColor: 'rgba(255, 206, 86, 0.5)',
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 1
                    }
                ]
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

        chartAdicionales = new Chart(ctx3, {
            type: 'bar',
            data: {
                labels: data.ingresosAdicionalesPorSucursal.map((i: ReporteAdicionales) => i.sucursal),
                datasets: [{
                    label: 'Ingresos por Adicionales',
                    data: data.ingresosAdicionalesPorSucursal.map((i: ReporteAdicionales) => i.ingresosAdicionales),
                    backgroundColor: 'rgba(255, 206, 86, 0.5)'
                }]
            },
            options: { responsive: true }
        });
    }

    // Actualizar gráficos cuando cambian los datos
    $effect(() => {
        if (browser && data) {
            setTimeout(actualizarGraficos, 0);
        }
    });

    onMount(() => {
        const searchParams = new URLSearchParams($page.url.search);
        fechaInicio = searchParams.get('fechaInicio') || '';
        fechaFin = searchParams.get('fechaFin') || '';
        mes = searchParams.get('mes') || '';

        // Si no hay filtros, setear el mes actual por defecto
        if (!fechaInicio && !fechaFin && !mes) {
            const hoy = new Date();
            const year = hoy.getFullYear();
            const month = (hoy.getMonth() + 1).toString().padStart(2, '0');
            fechaInicio = `${year}-${month}-01`;
            // Último día del mes actual
            const lastDay = new Date(year, hoy.getMonth() + 1, 0).getDate();
            fechaFin = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;
            // Actualiza la URL y recarga los datos
            actualizarFiltros();
        }
    });
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Reportes de Reservas</h1>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div>

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
                <p class="text-2xl font-bold text-gray-800">
                    $ {(data.totalIngresos + (data.totalIngresosAdicionales ?? 0)).toLocaleString('es-AR')}
                </p>
            </div>
        </div>
    </div>
</div>
