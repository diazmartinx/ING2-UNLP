<script lang="ts">
    import type { PageData, ActionData } from './$types';
    import { enhance } from '$app/forms';
	import { page } from '$app/state';

    let { data, form }: { data: PageData, form: ActionData } = $props();
</script>

<main class="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md -mt-28">
        <h1 class="text-2xl font-bold text-center text-gray-900">Verificación OTP</h1>
        <p class="text-center text-gray-600">
            Se ha enviado un código OTP a tu dirección de correo electrónico. Por favor, ingrésalo a continuación.
        </p>
        <form method="post" action="?/verifyOtp" use:enhance class="space-y-6">
            <input type="hidden" name="email" value={page.url.searchParams.get('email')} />
            <div>
                <label for="otp" class="block text-sm font-medium text-gray-700">Código OTP</label>
                <input 
                    type="text" 
                    name="otp" 
                    id="otp" 
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Ingresa tu código OTP"
                    required 
                />
            </div>
            <button 
                type="submit" 
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Verificar
            </button>
        </form>
        {#if form?.message}
            <p class="mt-2 text-sm text-red-600" id="error-message">{form.message}</p>
        {/if}
    </div>
</main>