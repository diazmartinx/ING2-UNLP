<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
    import type { SubmitFunction } from '@sveltejs/kit';

    let { data }: { data: PageData } = $props();
    
    let loading = $state(false);
    let errorMessage = $state('');
    
    // Form fields
    let nombre = $state('');
    let apellido = $state('');
    let dni = $state('');
    let email = $state('');
    
    // Field errors
    let nombreError = $state('');
    let apellidoError = $state('');
    let dniError = $state('');
    let emailError = $state('');

    function validateForm() {
        let isValid = true;
        
        // Reset errors
        nombreError = '';
        apellidoError = '';
        dniError = '';
        emailError = '';
        
        // Validate nombre
        if (!nombre.trim()) {
            nombreError = 'El nombre es requerido';
            isValid = false;
        } else if (nombre.trim().length < 2) {
            nombreError = 'El nombre debe tener al menos 2 caracteres';
            isValid = false;
        }
        
        // Validate apellido
        if (!apellido.trim()) {
            apellidoError = 'El apellido es requerido';
            isValid = false;
        } else if (apellido.trim().length < 2) {
            apellidoError = 'El apellido debe tener al menos 2 caracteres';
            isValid = false;
        }
        
        // Validate DNI
        if (!dni.trim()) {
            dniError = 'El DNI es requerido';
            isValid = false;
        } else if (!/^\d{7,8}$/.test(dni.trim())) {
            dniError = 'El DNI debe tener 7 u 8 dígitos';
            isValid = false;
        }
        
        // Validate email
        if (!email.trim()) {
            emailError = 'El correo electrónico es requerido';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            emailError = 'Ingresa un correo electrónico válido';
            isValid = false;
        }
        
        return isValid;
    }

    const submitEmployee: SubmitFunction = () => {
        if (!validateForm()) {
            return { cancel: true } as any;
        }
        
        loading = true;
        errorMessage = '';
        
        return async ({ result }) => {
            loading = false;
            
            if (result.type === 'success') {
                if (result.data?.redirect) {
                    window.location.href = result.data.redirect;
                }
            } else if (result.type === 'failure') {
                errorMessage = result.data?.error || 'Error al crear el empleado';
            }
        };
    };
</script>

<div class="max-w-2xl mx-auto p-6">
    <div class="bg-white shadow-lg rounded-lg p-8">
        <div class="mb-8">
            <a href="/admin/empleados" class="link">
                Volver
            </a>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Crear Nuevo Empleado</h1>
            <p class="text-gray-600">Complete los datos del nuevo empleado. Se enviará una contraseña temporal por correo electrónico.</p>
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

        <form method="POST" action="?/crear" use:enhance={submitEmployee} class="space-y-6">
            <!-- Nombre -->
            <div>
                <label for="nombre" class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span class="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    bind:value={nombre}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 {nombreError ? 'border-red-500' : ''}"
                    placeholder="Ingresa el nombre"
                    disabled={loading}
                />
                {#if nombreError}
                    <p class="mt-1 text-sm text-red-600">{nombreError}</p>
                {/if}
            </div>

            <!-- Apellido -->
            <div>
                <label for="apellido" class="block text-sm font-medium text-gray-700 mb-2">
                    Apellido <span class="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    bind:value={apellido}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 {apellidoError ? 'border-red-500' : ''}"
                    placeholder="Ingresa el apellido"
                    disabled={loading}
                />
                {#if apellidoError}
                    <p class="mt-1 text-sm text-red-600">{apellidoError}</p>
                {/if}
            </div>

            <!-- DNI -->
            <div>
                <label for="dni" class="block text-sm font-medium text-gray-700 mb-2">
                    DNI <span class="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="dni"
                    name="dni"
                    bind:value={dni}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 {dniError ? 'border-red-500' : ''}"
                    placeholder="Ej: 12345678"
                    maxlength="8"
                    minlength="1"
                    disabled={loading}
                />
                {#if dniError}
                    <p class="mt-1 text-sm text-red-600">{dniError}</p>
                {/if}
            </div>

            <!-- Email -->
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico <span class="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    bind:value={email}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 {emailError ? 'border-red-500' : ''}"
                    placeholder="ejemplo@correo.com"
                    disabled={loading}
                />
                {#if emailError}
                    <p class="mt-1 text-sm text-red-600">{emailError}</p>
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
                        Creando empleado...
                    {:else}
                        Crear Empleado
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>