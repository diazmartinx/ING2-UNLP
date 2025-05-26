<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
    import { page } from '$app/state';

    let { data }: { data: PageData } = $props();
    
    type Formulario = {
        tarjeta: string;
        nombre: string;
        fechaVencimiento: string;
        cvv: string;
    }

    let formulario: Formulario = {
        tarjeta: '',
        nombre: 'Juan Perez',
        fechaVencimiento: '03/27',
        cvv: '123'
    };

    let loading = $state(false);
    let error = $state('');
    let success = $state(false);

    // Reactive statement to handle form results
    $effect(() => {
        if (page.form?.error) {
            error = page.form.error;
            success = false;
        } else if (page.form?.success) {
            success = true;
            error = '';
        }
    });
</script>

<main class="container mx-auto p-4 max-w-2xl">
    <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">Información de Pago</h1>
        
        <!-- Mensaje de éxito -->
        {#if success}
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-green-800">¡Pago Exitoso!</h3>
                        
                    </div>
                </div>
            </div>
        {/if}

        <!-- Mensaje de error -->
        {#if error}
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-red-800">Error en el pago</h3>
                        <div class="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
        
        <!-- Resumen de la reserva -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 class="text-lg font-semibold text-gray-700 mb-3">Resumen de la Reserva</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div><span class="font-medium">Ubicación:</span> {data.ubicacion}</div>
                <div><span class="font-medium">Vehículo:</span> {data.marca} {data.modelo}</div>
                <div><span class="font-medium">Fecha inicio:</span> {data.fechaInicio}</div>
                <div><span class="font-medium">Fecha fin:</span> {data.fechaFin}</div>
                <div><span class="font-medium">Importe total:</span> ARS <strong>{data.importeTotal}</strong></div>
            </div>
        </div>

        <!-- Formulario de pago -->
        <form method="post" use:enhance={() => {
            loading = true;
            error = '';
            success = false;
            return async ({ update }) => {
                loading = false;
                await update();
            };
        }}>
            <div class="space-y-4">
                <!-- Número de tarjeta -->
                <div>
                    <label for="tarjeta" class="block text-sm font-medium text-gray-700 mb-1">
                        Número de Tarjeta
                    </label>
                    <input
                        type="text"
                        id="tarjeta"
                        name="tarjeta"
                        bind:value={formulario.tarjeta}
                        placeholder="0000-0000-0000-0000"
                        maxlength="19"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        oninput={(e) => {
                            // Formatear número de tarjeta con guiones
                            let value = e.currentTarget.value.replace(/\D/g, '');
                            value = value.replace(/(\d{4})(?=\d)/g, '$1-');
                            e.currentTarget.value = value;
                            formulario.tarjeta = value;
                        }}
                    />
                </div>

                <!-- Nombre del titular -->
                <div>
                    <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Titular
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        bind:value={formulario.nombre}
                        placeholder="Juan Perez"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <!-- Fecha de vencimiento -->
                    <div>
                        <label for="fechaVencimiento" class="block text-sm font-medium text-gray-700 mb-1">
                            Fecha de Vencimiento
                        </label>
                        <input
                            type="text"
                            id="fechaVencimiento"
                            name="fechaVencimiento"
                            bind:value={formulario.fechaVencimiento}
                            placeholder="MM/AA"
                            maxlength="5"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            oninput={(e) => {
                                // Formatear fecha MM/AA
                                let value = e.currentTarget.value.replace(/\D/g, '');
                                if (value.length >= 2) {
                                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                                }
                                e.currentTarget.value = value;
                                formulario.fechaVencimiento = value;
                            }}
                        />
                    </div>

                    <!-- CVV -->
                    <div>
                        <label for="cvv" class="block text-sm font-medium text-gray-700 mb-1">
                            CVV
                        </label>
                        <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            bind:value={formulario.cvv}
                            placeholder="123"
                            maxlength="4"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            oninput={(e) => {
                                // Solo números
                                e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
                                formulario.cvv = e.currentTarget.value;
                            }}
                        />
                    </div>
                </div>

                <!-- Botón de envío -->
                <div class="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        class="w-full btn btn-primary"
                    >
                        {loading ? 'Procesando...' : 'Procesar Pago'}
                    </button>
                </div>
            </div>
        </form>
    </div>
</main>