<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
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
    let showEditSuccessToast = $state(false);

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

    async function mostrarExitoEdicion() {
        showEditSuccessToast = true;
        await invalidateAll();
        setTimeout(() => {
            showEditSuccessToast = false;
            goto('/admin/modelos');
        }, 2000);
    }

    function cancelarEdicion() {
        goto('/admin/modelos');
    }
</script>

<div class="toast toast-top toast-end z-50">
    {#if showEditSuccessToast}
        <div class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>¡Modelo editado exitosamente!</span>
        </div>
    {/if}
</div>

<div class="container mx-auto p-4">
    {#if modelo}
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Editar Modelo: {modelo.marca} {modelo.modelo}</h1>
            <button 
                class="btn btn-ghost" 
                onclick={cancelarEdicion}
            >
                ← Volver a Modelos
            </button>
        </div>

        {#if !puedeEditarMarcaModelo}
            <div class="alert alert-info mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <strong>¿Cuándo se pueden editar la marca y modelo?</strong>
                    <ul class="list-disc ml-6 mt-2">
                        <li>Cuando el modelo no tenga vehículos asignados</li>
                        <li>Cuando todos los vehículos del modelo no tengan reservas de ningún tipo</li>
                    </ul>
                </div>
            </div>
        {/if}
                
        <div class="card bg-base-100 shadow-lg  mx-auto">
            <div class="card-body">
                {#if !puedeEditarMarcaModelo}
                    <div class="alert alert-warning mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span>
                            <strong>Los campos Marca y Modelo están deshabilitados</strong> porque este modelo tiene vehículos con reservas asociadas. 
                            Solo se pueden editar cuando el modelo no tenga vehículos asignados o cuando todos sus vehículos estén sin reservas de ningún tipo.
                        </span>
                    </div>
                {/if}
                
                <form 
                    method="POST" 
                    action="?/edit"
                    enctype="multipart/form-data"
                    use:enhance={({ formData }) => {
                        if (editSelectedFile) {
                            formData.append('imagen', editSelectedFile);
                        }
                        
                        return async ({ result }) => {
                            if (result.type === 'failure') {
                                editError = (result.data as { message: string })?.message || 'Error al editar el modelo';
                            } else if (result.type === 'success') {
                                mostrarExitoEdicion();
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
                                        <span class="label-text-alt text-warning">No se puede editar - Tiene vehículos con reservas</span>
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
                                        <span class="label-text-alt text-warning">No se puede editar - Tiene vehículos con reservas</span>
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

                            {#if editDisplayImageUrl}
                                <div class="flex justify-center">
                                    <div class="avatar">
                                        <div class="w-60 rounded-lg">
                                            <img 
                                                src={editDisplayImageUrl} 
                                                alt="Vista previa" 
                                                class="object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>
                            {/if}

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
                        <button type="button" class="btn btn-ghost" onclick={cancelarEdicion}>
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Guardar Cambios
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
