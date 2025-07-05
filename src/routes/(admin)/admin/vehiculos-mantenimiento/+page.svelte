<script lang="ts">
    export let data;
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';

    let patente = data.search;
    let debounceTimeout: ReturnType<typeof setTimeout>;
    let successMessage = '';
    let toastTimeout: ReturnType<typeof setTimeout>;
    let loadingPatente: string | null = null;

    // Actualiza la URL y recarga la búsqueda al escribir
    function onInput() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            if (patente) {
                params.set('patente', patente);
            } else {
                params.delete('patente');
            }
            goto(`?${params.toString()}`, { keepFocus: true, noScroll: true, replaceState: true });
        }, 250); // 250ms debounce
    }

    // Toast SVG icon
    const svgSuccess = `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />`;

    // Mostrar el toast si el parámetro está en la URL
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('toast') === 'habilitado') {
            successMessage = 'Vehículo habilitado exitosamente';
            // Limpiar el parámetro para que no se repita el toast en futuros refresh
            params.delete('toast');
            window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
            clearTimeout(toastTimeout);
            toastTimeout = setTimeout(() => {
                successMessage = '';
            }, 3000);
        }
    }

    // Manejar el éxito del form
    function handleSuccess() {
        // Agregar un parámetro a la URL para mostrar el toast tras el refresh
        const params = new URLSearchParams(window.location.search);
        params.set('toast', 'habilitado');
        goto(`${window.location.pathname}?${params.toString()}`, { replaceState: true });
    }
</script>

{#if successMessage}
    <div class="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
        <div class="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 shadow-lg">
            <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    {@html svgSuccess}
                </svg>
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
            <button
                on:click={() => successMessage = ''}
                class="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
                aria-label="Cerrar notificación"
            >
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    </div>
{/if}

<div class="mb-6 flex items-center justify-between">
    <h2 class="text-3xl font-bold text-gray-800">Vehículos en Mantenimiento</h2>
</div>

<form method="GET" class="mb-4 flex gap-2" on:submit|preventDefault>
    <input
        type="text"
        name="patente"
        placeholder="Buscar por patente"
        bind:value={patente}
        class="input input-bordered"
        on:input={onInput}
        autocomplete="off"
    />
</form>

{#if data.unidades.length === 0}
    <div class="flex h-96 items-center justify-center">
        <div class="text-center">
            <h1 class="mb-4 text-2xl font-bold">No hay vehículos en mantenimiento</h1>
        </div>
    </div>
{:else}
    <table class="table-zebra table">
        <thead>
            <tr>
                <th scope="col" class="px-6 py-3">Patente</th>
                <th scope="col" class="px-6 py-3">Sucursal</th>
                <th scope="col" class="px-6 py-3">Modelo</th>
                <th scope="col" class="px-6 py-3">Año</th>
                <th scope="col" class="px-6 py-3">Acción</th>
            </tr>
        </thead>
        <tbody>
            {#each data.unidades as unidad}
                <tr class="border-b border-gray-200 odd:bg-white even:bg-gray-50 dark:border-gray-700 odd:dark:bg-gray-900 even:dark:bg-gray-800">
                    <td class="px-6 py-4 font-medium whitespace-nowrap text-gray-900 dark:text-white">{unidad.patente}</td>
                    <td class="px-6 py-4">{unidad.sucursal}</td>
                    <td class="px-6 py-4">{unidad.marca} {unidad.modelo}</td>
                    <td class="px-6 py-4">{unidad.anio}</td>
                    <td class="px-6 py-4">
                        <div class="flex space-x-2">
                            <form method="POST" action="?/habilitar" use:enhance={() => {
                                loadingPatente = unidad.patente;
                                return async ({ result }) => {
                                    if (result.type === 'success') {
                                        const params = new URLSearchParams(window.location.search);
                                        params.set('toast', 'habilitado');
                                        window.location.href = `${window.location.pathname}?${params.toString()}`;
                                    }
                                };
                            }}>
                                <input type="hidden" name="patente" value={unidad.patente} />
                                <button class="btn btn-success" type="submit" disabled={loadingPatente === unidad.patente}>
                                    {#if loadingPatente === unidad.patente}
                                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Habilitando...
                                    {:else}
                                        Habilitar
                                    {/if}
                                </button>
                            </form>
                        </div>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}