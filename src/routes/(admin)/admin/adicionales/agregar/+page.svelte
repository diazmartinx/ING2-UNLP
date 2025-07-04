<script lang="ts">
	import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import type { PageData, ActionData } from './$types';
    import type { SubmitFunction } from '@sveltejs/kit';

    let { data, form }: { data: PageData, form: ActionData } = $props();
    
    let loading = $state(false);
    let errorMessage = $state('');
    
    // Form fields
    let nombre = $state('');
    let precioPorDia = $state('');
    
    // Field errors
    let nombreError = $state('');
    let precioPorDiaError = $state('');

    function validateForm() {
        let isValid = true;
        
        // Reset errors
        nombreError = '';
        precioPorDiaError = '';
        
        // Validate nombre
        if (!nombre || !nombre.toString().trim()) {
            nombreError = 'El nombre es requerido';
            isValid = false;
        } else if (nombre.toString().trim().length < 2) {
            nombreError = 'El nombre debe tener al menos 2 caracteres';
            isValid = false;
        }
        
        // Validate precioPorDia
        if (!precioPorDia || precioPorDia.toString().trim() === '') {
            precioPorDiaError = 'El precio por día es requerido';
            isValid = false;
        } else {
            const precio = Number(precioPorDia);
            if (isNaN(precio) || precio <= 0) {
                precioPorDiaError = 'El precio debe ser un número mayor a 0';
                isValid = false;
            }
        }
        
        return isValid;
    }

    const submitAdicional: SubmitFunction = () => {
        loading = true;
        errorMessage = '';
        
        return async ({ result }) => {
            loading = false;
            
            if (result.type === 'failure') {
                errorMessage = result.data?.error || 'Error al crear el adicional';
            } else if (result.type === 'success') {
                // Redirigir al listado con toast
                await goto('/admin/adicionales?toast=adicional-creado');
            }
        };
    };

    function handleSubmit(event: SubmitEvent) {
        if (!validateForm()) {
            event.preventDefault();
            return false;
        }
        return true;
    }
</script>

<div class="max-w-2xl mx-auto p-6">
    <div class="bg-white shadow-lg rounded-lg p-8">
        <div class="mb-8">
            <a href="/admin/adicionales" class="link">
                Volver
            </a>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Crear Nuevo Adicional</h1>
            <p class="text-gray-600">Complete los datos del nuevo adicional que estará disponible para las reservas.</p>
        </div>

        <!-- Error Message -->
        {#if errorMessage}
            <div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-red-800">{errorMessage}</p>
                    </div>
                </div>
            </div>
        {/if}

        <form method="POST" action="?/create" onsubmit={handleSubmit} use:enhance={submitAdicional} class="space-y-6">
            <!-- Nombre -->
            <div>
                <label for="nombre" class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Adicional <span class="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    bind:value={nombre}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 {nombreError ? 'border-red-500' : ''}"
                    placeholder="Ej: GPS, Silla de bebé, etc."
                    disabled={loading}
                />
                {#if nombreError}
                    <p class="mt-1 text-sm text-red-600">{nombreError}</p>
                {/if}
            </div>


            <!-- Precio por Día -->
            <div>
                <label for="precioPorDia" class="block text-sm font-medium text-gray-700 mb-2">
                    Precio por Día ($) <span class="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    id="precioPorDia"
                    name="precioPorDia"
                    bind:value={precioPorDia}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 {precioPorDiaError ? 'border-red-500' : ''}"
                    placeholder="Ej: 25.50"
                    min="0.01"
                    step="0.01"
                    disabled={loading}
                />
                {#if precioPorDiaError}
                    <p class="mt-1 text-sm text-red-600">{precioPorDiaError}</p>
                {/if}
            </div>

            <!-- Submit Button -->
            <div class="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    class="btn btn-primary w-full"
                >
                    {#if loading}
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creando adicional...
                    {:else}
                        Crear Adicional
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>

<style>
</style>
