<script lang="ts">
	import { enhance } from '$app/forms';
    import type { PageData, ActionData } from './$types';
    import type { SubmitFunction } from '@sveltejs/kit';

    let { data, form }: { data: PageData, form: ActionData } = $props();
    
    let loading = $state(false);
    let successMessage = $state('');
    let errorMessage = $state('');
    
    // Form fields
    let nombre = $state('');
    let apellido = $state('');
    let dni = $state('');
    let fechaNacimiento = $state('');
    let email = $state('');
    let telefono = $state('');
    
    // Field errors
    let nombreError = $state('');
    let apellidoError = $state('');
    let dniError = $state('');
    let fechaNacimientoError = $state('');
    let emailError = $state('');
    let telefonoError = $state('');

    function validateForm() {
        let isValid = true;
        
        // Reset errors
        nombreError = '';
        apellidoError = '';
        dniError = '';
        fechaNacimientoError = '';
        emailError = '';
        telefonoError = '';
        
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
        
        // Validate fechaNacimiento
        if (!fechaNacimiento) {
            fechaNacimientoError = 'La fecha de nacimiento es requerida';
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
        
        // Validate telefono
        if (!telefono.trim()) {
            telefonoError = 'El teléfono es requerido';
            isValid = false;
        }
        
        return isValid;
    }

    const submitClient: SubmitFunction = () => {
        if (!validateForm()) {
            return { cancel: true } as any;
        }
        
        loading = true;
        successMessage = '';
        errorMessage = '';
        
        return async ({ result }) => {
            loading = false;
            
            if (result.type === 'success') {
                if (result.data?.redirect) {
                    window.location.href = result.data.redirect;
                }
            } else if (result.type === 'failure') {
                errorMessage = result.data?.error || 'Error al crear el cliente';
                successMessage = '';
            }
        };
    };
</script>

<div class="max-w-2xl mx-auto p-6">
    <div class="bg-white shadow-lg rounded-lg p-8">
        <div class="mb-8">
            <a href="/admin/clientes" class="link">
                Volver
            </a>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Crear Nuevo Cliente</h1>
            <p class="text-gray-600">Complete los datos del nuevo cliente. Se enviará una contraseña temporal por correo electrónico.</p>
        </div>

        <!-- Success Message -->
        {#if successMessage}
            <div class="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
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

        <form method="POST" action="?/crear" use:enhance={submitClient} class="space-y-6">
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

            <!-- Fecha de Nacimiento -->
            <div>
                <label for="fechaNacimiento" class="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento <span class="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    id="fechaNacimiento"
                    name="fechaNacimiento"
                    bind:value={fechaNacimiento}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 {fechaNacimientoError ? 'border-red-500' : ''}"
                    disabled={loading}
                />
                {#if fechaNacimientoError}
                    <p class="mt-1 text-sm text-red-600">{fechaNacimientoError}</p>
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

            <!-- Teléfono -->
            <div>
                <label for="telefono" class="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono <span class="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="telefono"
                    name="telefono"
                    bind:value={telefono}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 {telefonoError ? 'border-red-500' : ''}"
                    placeholder="Ingresa el teléfono"
                    disabled={loading}
                />
                {#if telefonoError}
                    <p class="mt-1 text-sm text-red-600">{telefonoError}</p>
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
                        Creando cliente...
                    {:else}
                        Crear Cliente
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div> 