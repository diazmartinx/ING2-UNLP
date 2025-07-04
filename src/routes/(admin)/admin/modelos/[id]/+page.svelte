<script lang="ts">
    import type { ActionData, PageData } from './$types';
    import { enhance } from '$app/forms';
    import { invalidateAll, goto } from '$app/navigation';
    import { onDestroy } from 'svelte';

    // Definir tipos robustos para form y errores
    type FormErrors = {
        [key: string]: string | undefined;
        marca?: string;
        modeloNombre?: string;
        capacidadPasajeros?: string;
        precioPorDia?: string;
        tipoPolitica?: string;
        porcentajeReembolsoParcial?: string;
        categoriaId?: string;
        imagen?: string;
    };
    type FormType = {
        errors?: FormErrors;
        marca?: string;
        modeloNombre?: string;
        capacidadPasajeros?: string;
        precioPorDia?: string;
        tipoPolitica?: string;
        porcentajeReembolsoParcial?: string;
        categoriaId?: string;
    } | undefined;

    let { data, form }: { data: PageData, form: FormType } = $props();

    // Base data from the server (reactive to `data` prop changes)
    let modelo = $derived(data.modelo);
    let categoria = $derived(data.categoria);
    let politica = $derived(data.politica);

    // Form input states, initialized from `form` (if available on error) or static defaults.
    let marca = $state(form?.marca ?? data.modelo.marca ?? '');
    let modeloNombre = $state(form?.modeloNombre ?? data.modelo.modelo ?? '');
    let capacidadPasajeros = $state(form?.capacidadPasajeros ? parseInt(form.capacidadPasajeros) : data.modelo.capacidadPasajeros ?? 0);
    let precioPorDia = $state(form?.precioPorDia ? parseFloat(form.precioPorDia) : data.modelo.precioPorDia ?? 0);
    let porcentajeReembolsoParcial = $state(form?.porcentajeReembolsoParcial != null ? parseFloat(form.porcentajeReembolsoParcial) : data.modelo.porcentajeReembolsoParcial ?? null);
    let selectedTipoPolitica = $state(form?.tipoPolitica ?? data.politica?.tipoPolitica ?? 'Sin Reembolso');
    let selectedCategoriaId = $state(form?.categoriaId ?? data.modelo.idCategoria?.toString() ?? '');
    
    // State for loading and success message
    let loading = $state(false);
    let successMessage = $state('');

    // State for image handling
    let selectedFile = $state<File | null>(null);
    let displayImageUrl = $state('');
    let createImageError = $state(false);

    // Effect to reset form fields to latest data when `data` prop changes (e.g., after successful update)
    // and to repopulate from `form` if there are errors.
    $effect(() => {
        const hasFormErrors = form && form.errors && Object.keys(form.errors).length > 0;
        if (hasFormErrors) {
            marca = form?.marca ?? marca;
            modeloNombre = form?.modeloNombre ?? modeloNombre;
            capacidadPasajeros = form?.capacidadPasajeros ? parseInt(form.capacidadPasajeros) : capacidadPasajeros;
            precioPorDia = form?.precioPorDia ? parseFloat(form.precioPorDia) : precioPorDia;
            porcentajeReembolsoParcial = form?.porcentajeReembolsoParcial != null ? parseFloat(form.porcentajeReembolsoParcial) : porcentajeReembolsoParcial;
            selectedTipoPolitica = form?.tipoPolitica ?? selectedTipoPolitica;
            selectedCategoriaId = form?.categoriaId ?? selectedCategoriaId;
        } else {
            marca = data.modelo.marca;
            modeloNombre = data.modelo.modelo;
            capacidadPasajeros = data.modelo.capacidadPasajeros;
            precioPorDia = data.modelo.precioPorDia;
            porcentajeReembolsoParcial = data.modelo.porcentajeReembolsoParcial ?? null;
            selectedTipoPolitica = data.politica?.tipoPolitica ?? 'Sin Reembolso';
            selectedCategoriaId = data.modelo.idCategoria?.toString() ?? '';
        }
    });

    function handleImageInput(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            if (displayImageUrl && displayImageUrl.startsWith('blob:')) {
                URL.revokeObjectURL(displayImageUrl);
            }
            selectedFile = input.files[0];
            displayImageUrl = URL.createObjectURL(selectedFile);
            createImageError = false;
        }
    }

    function handleImageError() {
        displayImageUrl = '/no-image-icon.svg';
        createImageError = true;
    }

    function handleImageLoad() {
        createImageError = false;
    }

    async function showSuccessAndRedirect() {
        // No mostrar mensaje local, la redirección se maneja en el enhance
    }

    onDestroy(() => {
        if (displayImageUrl && displayImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(displayImageUrl);
        }
    });
</script>

<!-- Success Message -->
{#if successMessage}
    <div class="bg-green-50 border border-green-200 rounded-md p-4 mb-6 max-w-2xl mx-auto mt-4">
        <div class="flex">
            <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
        </div>
    </div>
{/if}

<div class="container mx-auto p-4">
    {#if modelo} 
        <h1 class="text-3xl font-bold mb-6 text-center">{modelo.marca} {modelo.modelo}</h1>        
            <form method="POST" enctype="multipart/form-data" use:enhance={() => {
                loading = true;
                successMessage = '';
                
                return async ({ result, update }) => {
                    loading = false;
                    
                    if (result.type === 'success' && result.data?.success) {
                        if (result.data?.redirect && typeof result.data.redirect === 'string') {
                            window.location.href = result.data.redirect;
                        } else {
                            await update({ reset: false, invalidateAll: true });
                            showSuccessAndRedirect();
                        }
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
                
                <div class="mb-4">
                    <label for="imagen" class="block text-sm font-medium text-gray-700 mb-1">Cambiar Imagen:</label>
                    <input 
                        type="file" 
                        id="imagen" 
                        name="imagen" 
                        class="file-input file-input-bordered w-full" 
                        accept="image/*"
                        onchange={handleImageInput}
                    />
                    {#if form?.errors?.imagen}
                        <p class="text-red-500 text-sm mt-1">{form.errors.imagen}</p>
                    {/if}
                </div>

                {#if displayImageUrl}
                    <div class="flex justify-center mt-2 mb-4">
                        <img
                            src={displayImageUrl}
                            alt="Preview imagen"
                            class="h-40 w-40 object-cover rounded border"
                            style="max-width: 160px; max-height: 160px;"
                            onerror={handleImageError}
                            onload={handleImageLoad}
                        />
                    </div>
                {/if}
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
                
                <div class="mb-4">
                    <label for="categoriaId" class="block text-sm font-medium text-gray-700 mb-1">Categoría:</label>
                    <select id="categoriaId" name="categoriaId" bind:value={selectedCategoriaId} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        {#each data.categorias as categoria}
                            <option value={categoria.id.toString()}>{categoria.nombre}</option>
                        {/each}
                    </select>
                    {#if form?.errors?.categoriaId}
                        <p class="text-red-500 text-sm mt-1">{form.errors.categoriaId}</p>
                    {/if}
                </div>

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
                {/if}

                <div class="mt-6 flex justify-end space-x-3">
                    <a href={`/admin/modelos`} class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out">
                        Cancelar
                    </a>
                    <button 
                        type="submit" 
                        disabled={loading}
                        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {#if loading}
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Guardando cambios...
                        {:else}
                            Guardar Cambios
                        {/if}
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