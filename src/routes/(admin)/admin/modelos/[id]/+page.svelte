<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';

    let { data }: { data: PageData } = $props();

    // Base data from the server (reactive to `data` prop changes)
    let modelo = $derived(data.modelo);
    let categoria = $derived(data.categoria);
    let politica = $derived(data.politica);
    let categorias = $derived(data.categorias);
    let puedeEditarMarcaModelo = $derived(data.puedeEditarMarcaModelo);

    // Estados para el formulario de edición
    let editError = $state('');
    let editDisplayImageUrl = $state('');
    let editSelectedFile = $state<File | null>(null);
    let editLoading = $state(false);

    // Inicializar los valores del formulario
    $effect(() => {
        if (modelo) {
            editDisplayImageUrl = modelo.imagenUrl || '';
        }
    });

    function handleEditImageInput(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            editSelectedFile = input.files[0];
            editDisplayImageUrl = URL.createObjectURL(editSelectedFile);
        }
    }




</script>



<div class="container mx-auto p-4">
    {#if modelo}
        <div class="mb-8">
            <a href="/admin/modelos" class="link">
                ← Volver a Modelos
            </a>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Editar Modelo: {modelo.marca} {modelo.modelo}</h1>
        </div>
                
        <div class="card bg-base-100 shadow-lg  mx-auto">
            <div class="card-body">
                <form 
                    method="POST" 
                    action="?/edit"
                    enctype="multipart/form-data"
                    use:enhance={({ formData }) => {
                        editLoading = true;
                        editError = '';
                        
                        if (editSelectedFile) {
                            formData.append('imagen', editSelectedFile);
                        }
                        
                        return async ({ result }) => {
                            editLoading = false;
                            
                            if (result.type === 'failure') {
                                editError = (result.data as { message: string })?.message || 'Error al editar el modelo';
                            } else if (result.type === 'success') {
                                if ((result.data as { redirect?: string })?.redirect) {
                                    window.location.href = (result.data as { redirect: string }).redirect;
                                }
                            }
                        };
                    }}
                >
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Columna izquierda: Información básica -->
                        <div class="space-y-4">
                            <div class="form-control">
                                <label class="label" for="marca">
                                    <span class="label-text font-semibold">Marca</span>
                                    {#if !puedeEditarMarcaModelo}
                                        <span class="label-text-alt">No se puede editar - Tiene vehículos con reservas</span>
                                    {/if}
                                </label>
                                <input 
                                    type="text" 
                                    id="marca" 
                                    name="marca" 
                                    class="input input-bordered w-full {!puedeEditarMarcaModelo ? 'bg-base-200 cursor-not-allowed' : ''}" 
                                    value={modelo.marca}
                                    required 
                                    disabled={!puedeEditarMarcaModelo}
                                />
                            </div>
                            
                            <div class="form-control">
                                <label class="label" for="modelo">
                                    <span class="label-text font-semibold">Modelo</span>
                                    {#if !puedeEditarMarcaModelo}
                                        <span class="label-text-alt">No se puede editar - Tiene vehículos con reservas</span>
                                    {/if}
                                </label>
                                <input 
                                    type="text" 
                                    id="modelo" 
                                    name="modelo" 
                                    class="input input-bordered w-full {!puedeEditarMarcaModelo ? 'bg-base-200 cursor-not-allowed' : ''}" 
                                    value={modelo.modelo}
                                    required 
                                    disabled={!puedeEditarMarcaModelo}
                                />
                            </div>
                            
                            <div class="form-control">
                                <label class="label" for="idCategoria">
                                    <span class="label-text font-semibold">Categoría</span>
                                </label>
                                <input 
                                    type="text" 
                                    id="idCategoria"
                                    class="input input-bordered w-full bg-base-200 cursor-not-allowed" 
                                    value={categoria?.nombre || 'Sin categoría'}
                                    disabled
                                />
                                <!-- Campo hidden para enviar el idCategoria al servidor -->
                                <input 
                                    type="hidden" 
                                    name="idCategoria" 
                                    value={modelo.idCategoria || ''} 
                                />
                            </div>

                            <div class="form-control">
                                <label class="label" for="capacidadPasajeros">
                                    <span class="label-text font-semibold">Capacidad de Pasajeros</span>
                                </label>
                                <input 
                                    type="number" 
                                    id="capacidadPasajeros" 
                                    name="capacidadPasajeros" 
                                    class="input input-bordered w-full" 
                                    value={modelo.capacidadPasajeros}
                                    required 
                                    min="1" 
                                />
                            </div>

                            <div class="form-control">
                                <label class="label" for="precioPorDia">
                                    <span class="label-text font-semibold">Precio por Día</span>
                                </label>
                                <input 
                                    type="number" 
                                    id="precioPorDia" 
                                    name="precioPorDia" 
                                    class="input input-bordered w-full" 
                                    value={modelo.precioPorDia}
                                    required 
                                    min="1" 
                                    
                                />
                            </div>
                        </div>

                        <!-- Columna derecha: Imagen y políticas -->
                        <div class="">
                            {#if editDisplayImageUrl}
                                <div class="flex justify-center mb-4">
                                    <div class="border-2 border-gray-200 rounded-lg p-2 bg-gray-50">
                                        <div class="avatar">
                                            <div class="w-60 rounded-lg overflow-hidden">
                                                <img 
                                                    src={editDisplayImageUrl} 
                                                    alt="Vista previa" 
                                                    class="object-cover w-full h-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/if}

                            <div class="form-control">
                                <label class="label" for="imagen">
                                    <span class="label-text font-semibold">Imagen del Vehículo</span>
                                    <span class="label-text-alt">Opcional - Deja vacío para mantener la actual</span>
                                </label>
                                <input 
                                    type="file" 
                                    id="imagen" 
                                    name="imagen" 
                                    class="file-input file-input-bordered w-full" 
                                    accept="image/*"
                                    onchange={handleEditImageInput} 
                                />
                            </div>

                            {#if politica}
                                <div class="form-control mt-4">
                                    <label class="label" for="politicaCancelacion">
                                        <span class="label-text font-semibold">Política de Cancelación</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        id="politicaCancelacion"
                                        class="input input-bordered w-full bg-base-200 cursor-not-allowed" 
                                        value={politica.tipoPolitica}
                                        disabled
                                    />
                                </div>
                                {#if politica.tipoPolitica === 'Reembolso Parcial' && modelo.porcentajeReembolsoParcial !== null}
                                    <div class="form-control mt-4">
                                        <label class="label" for="porcentajeReembolsoParcial">
                                            <span class="label-text font-semibold">Porcentaje de Reembolso</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            id="porcentajeReembolsoParcial"
                                            class="input input-bordered w-full bg-base-200 cursor-not-allowed" 
                                            value={`${modelo.porcentajeReembolsoParcial}%`}
                                            disabled
                                        />
                                    </div>
                                {/if}
                            {/if}
                        </div>
                    </div>

                    {#if editError}
                        <div class="alert alert-error mt-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{editError}</span>
                        </div>
                    {/if}

                    <div class="card-actions justify-end mt-6 gap-4">
                        <button type="button" class="btn btn-ghost" onclick={() => window.location.href = '/admin/modelos'} disabled={editLoading}>
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary" disabled={editLoading}>
                            {#if editLoading}
                                <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            {:else}
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Guardar Cambios
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {:else}
        <p class="text-center text-xl text-red-500">No se pudo cargar la información del modelo.</p>
    {/if}
</div>

<style>
    .container {
        max-width: 1200px;
    }
</style>
