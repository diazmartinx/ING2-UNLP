<script lang="ts">
    import type { ActionData, PageData } from './$types';
    import { enhance } from '$app/forms';
    import { invalidateAll, goto } from '$app/navigation';

    let { data, form }: { data: PageData, form: ActionData } = $props();

    // Base data from the server (reactive to `data` prop changes)
    let modelo = $derived(data.modelo);
    let categoria = $derived(data.categoria);
    let politica = $derived(data.politica);

    // Form input states, initialized from `form` (if available on error) or static defaults.
    // The $effect below will synchronize them with `data` or `form` as appropriate.
    let marca = $state(form?.marca ?? '');
    let modeloNombre = $state(form?.modeloNombre ?? '');
    let capacidadPasajeros = $state(form?.capacidadPasajeros ?? 0);
    let precioPorDia = $state(form?.precioPorDia ?? 0);    let porcentajeReembolsoParcial = $state(form?.porcentajeReembolsoParcial != null ? parseFloat(form.porcentajeReembolsoParcial) : null);
    let selectedTipoPolitica = $state(form?.tipoPolitica ?? 'Sin Reembolso');
    
    // State for success toast
    let showSuccessToast = $state(false);

    // Effect to reset form fields to latest data when `data` prop changes (e.g., after successful update)
    // and to repopulate from `form` if there are errors.
    $effect(() => {
        if (form && Object.keys(form).length > 0 && form.errors) {
            // If there are form errors, keep the user's input
            marca = form.marca ?? marca;
            modeloNombre = form.modeloNombre ?? modeloNombre;
            capacidadPasajeros = form.capacidadPasajeros ?? capacidadPasajeros;
            precioPorDia = form.precioPorDia ?? precioPorDia;
            porcentajeReembolsoParcial = form.porcentajeReembolsoParcial != null ? parseFloat(form.porcentajeReembolsoParcial) : porcentajeReembolsoParcial;
            selectedTipoPolitica = form.tipoPolitica ?? selectedTipoPolitica;
        } else {
            // If no form errors (e.g. initial load or successful submission), use data from props
            marca = data.modelo.marca;
            modeloNombre = data.modelo.modelo;
            capacidadPasajeros = data.modelo.capacidadPasajeros;
            precioPorDia = data.modelo.precioPorDia;
            porcentajeReembolsoParcial = data.modelo.porcentajeReembolsoParcial ?? null;
            selectedTipoPolitica = data.politica?.tipoPolitica ?? 'Sin Reembolso';
        }
    });

    async function showSuccessAndRedirect() {
        showSuccessToast = true;
        await invalidateAll();
        setTimeout(() => {
            showSuccessToast = false;
        }, 3000);
    }

</script>

<div class="toast toast-top toast-end z-50">
    {#if showSuccessToast}
        <div class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>¡Modelo actualizado exitosamente!</span>
        </div>
    {/if}
</div>

<div class="container mx-auto p-4">
    {#if modelo} 
        <h1 class="text-3xl font-bold mb-6 text-center">{modelo.marca} {modelo.modelo}</h1>        
            <form method="POST" use:enhance={() => {
            return async ({ result, update }) => {
                if (result.type === 'success' && result.data?.success) {
                    await update({ reset: false, invalidateAll: true });
                    showSuccessAndRedirect();
                } else {
                    await update({ reset: false, invalidateAll: true });
                }
            };
        }} class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <!-- General Form Messages -->

            <div>
                {#if modelo.imagenUrl}
                    <img src={modelo.imagenUrl} alt="Imagen del vehículo {modelo.marca} {modelo.modelo}" class="w-full h-auto object-cover rounded-lg shadow-lg mb-4">
                {:else}
                    <div class="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg shadow-lg mb-4">
                        <span class="text-gray-500">Imagen no disponible</span>
                    </div>
                {/if}
                <!-- TODO: Add file input for image upload. This will require backend changes. -->
                <div class="mb-4">
                    <label for="imagen" class="block text-sm font-medium text-gray-700 mb-1">Cambiar Imagen (funcionalidad no implementada):</label>
                    <input type="file" id="imagen" name="imagen" class="mt-1 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100" disabled />
                </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-2xl font-semibold mb-4">Detalles del Modelo</h2>
                
                <input type="hidden" name="id" value={modelo.id} />

                <div class="mb-4">
                    <label for="marca" class="block text-sm font-medium text-gray-700 mb-1">Marca:</label>
                    <input type="text" id="marca" name="marca" bind:value={marca} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    {#if form?.errors?.marca}
                        <p class="text-red-500 text-sm mt-1">{form.errors.marca}</p>
                    {/if}
                </div>

                <div class="mb-4">
                    <label for="modeloNombre" class="block text-sm font-medium text-gray-700 mb-1">Modelo:</label>
                    <input type="text" id="modeloNombre" name="modeloNombre" bind:value={modeloNombre} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    {#if form?.errors?.modeloNombre}
                        <p class="text-red-500 text-sm mt-1">{form.errors.modeloNombre}</p>
                    {/if}
                </div>

                <div class="mb-4">
                    <label for="capacidadPasajeros" class="block text-sm font-medium text-gray-700 mb-1">Capacidad de Pasajeros:</label>
                    <input type="number" id="capacidadPasajeros" name="capacidadPasajeros" bind:value={capacidadPasajeros} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    {#if form?.errors?.capacidadPasajeros}
                        <p class="text-red-500 text-sm mt-1">{form.errors.capacidadPasajeros}</p>
                    {/if}
                </div>

                <div class="mb-4">
                    <label for="precioPorDia" class="block text-sm font-medium text-gray-700 mb-1">Precio por Día:</label>
                    <input type="number" step="0.01" id="precioPorDia" name="precioPorDia" bind:value={precioPorDia} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    {#if form?.errors?.precioPorDia}
                        <p class="text-red-500 text-sm mt-1">{form.errors.precioPorDia}</p>
                    {/if}
                </div>
                
                {#if categoria}
                    <p class="mb-2"><strong>Categoría:</strong> {categoria.nombre}</p>
                    <!-- TODO: Add select for category change. This will require fetching categories and backend update logic. -->
                {/if}

                {#if politica || form?.tipoPolitica} <!-- Show policy section if initial policy exists or if form has a type (e.g. on error) -->
                    <h3 class="text-xl font-semibold mt-4 mb-2">Política de Cancelación</h3>
                    
                    <div class="mb-4">
                        <label for="tipoPolitica" class="block text-sm font-medium text-gray-700 mb-1">Tipo de Política:</label>
                        <select id="tipoPolitica" name="tipoPolitica" bind:value={selectedTipoPolitica} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                            <option value="Reembolso Total">Reembolso Total</option>
                            <option value="Reembolso Parcial">Reembolso Parcial</option>
                            <option value="Sin Reembolso">Sin Reembolso</option>
                        </select>
                        {#if form?.errors?.tipoPolitica}
                            <p class="text-red-500 text-sm mt-1">{form.errors.tipoPolitica}</p>
                        {/if}
                    </div>

                    {#if selectedTipoPolitica === 'Reembolso Parcial'}
                        <div class="mb-4">
                            <label for="porcentajeReembolsoParcial" class="block text-sm font-medium text-gray-700 mb-1">Porcentaje de Reembolso Parcial (%):</label>
                            <input type="number" step="0.01" id="porcentajeReembolsoParcial" name="porcentajeReembolsoParcial" bind:value={porcentajeReembolsoParcial} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ej: 10 para 10%" />
                            {#if form?.errors?.porcentajeReembolsoParcial}
                                <p class="text-red-500 text-sm mt-1">{form.errors.porcentajeReembolsoParcial}</p>
                            {/if}
                        </div>
                    {/if}
                    <!-- TODO: Add select for policy change. This will require fetching policies and backend update logic. -->
                {/if}

                <div class="mt-6 flex justify-end space-x-3">
                    <a href={`/admin/modelos/${modelo.id}`} class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
                        Cancelar
                    </a>
                    <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </form>
    {:else}
        <p class="text-center text-xl text-red-500">No se pudo cargar la información del modelo.</p>
    {/if}
</div>

<style>
    /* Puedes agregar estilos específicos aquí si es necesario */
    .container {
        max-width: 1000px;
    }
</style>
