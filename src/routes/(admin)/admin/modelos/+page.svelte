<!-- +page.svelte -->

<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import ModelVehicleSearch from '$lib/components/ModelVehicleSearch.svelte';

    interface Modelo {
        id: number;
        marca: string;
        modelo: string;
        capacidadPasajeros: number;
        precioPorDia: number;
        imagenBlob: string | null;
        categoria: string;
        politicaCancelacion: string;
        porcentajeReembolsoParcial: number | null;
        reservasActivas?: number;
        unidadesAsignadas?: number;
    }

    interface Categoria {
        id: number;
        nombre: string;
    }

    interface Politica {
        id: number;
        tipoPolitica: string;
    }

    interface PageData {
        modelos: Modelo[];
        categorias: Categoria[];
        politicas: Politica[];
        toast?: string;
    }

    let { data }: { data: PageData } = $props();
    let showCreateModal = $state(false);
    let createError = $state('');
    let createImageError = $state(false);
    let selectedPolitica = $state('');
    let porcentajeReembolsoParcial = $state('');
    let porcentajeReembolsoParcialError = $state('');
    let showSuccessToast = $state(false);
    let displayImageUrl = $state('');
    let selectedFile = $state<File | null>(null);

    // Variables para el modal de eliminación
    let showDeleteModal = $state(false);
    let modeloAEliminar = $state<Modelo | null>(null);
    let deleteError = $state('');
    let showDeleteSuccessToast = $state(false);
    let showToast = $state(false);
    let createLoading = $state(false);
    let deleteLoading = $state(false);

    // Función para abrir el modal de confirmación
    function confirmarEliminacion(modelo: Modelo) {
        modeloAEliminar = modelo;
        showDeleteModal = true;
        deleteError = '';
    }

    // Función para cerrar el modal de eliminación
    function cerrarModalEliminacion() {
        showDeleteModal = false;
        modeloAEliminar = null;
        deleteError = '';
    }

    // Función para mostrar éxito y recargar datos
    async function mostrarExitoEliminacion() {
        showDeleteSuccessToast = true;
        await invalidateAll();
        setTimeout(() => {
            showDeleteSuccessToast = false;
        }, 3000);
    }

        

    function openCreateModal() {
        showCreateModal = true;
        createError = '';
        displayImageUrl = '';
        createImageError = false;
        selectedFile = null;
        selectedPolitica = '';
        porcentajeReembolsoParcial = '';
        porcentajeReembolsoParcialError = '';
    }

    function closeModal() {
        showCreateModal = false;
        createError = '';
        displayImageUrl = '';
        createImageError = false;
        selectedFile = null;
        selectedPolitica = '';
        porcentajeReembolsoParcial = '';
        porcentajeReembolsoParcialError = '';
    }

    function handleImageInput(e: Event) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            selectedFile = input.files[0];
            displayImageUrl = URL.createObjectURL(selectedFile);
            createImageError = false;
        }
    }

    function handleImageError() {
        displayImageUrl = '/no-image-icon.svg';
        createImageError = true;
    }

    function handleModelImageError(event: Event) {
        const img = event.currentTarget as HTMLImageElement;
        img.src = '/no-image-icon.svg';
    }

    function getImageUrlFromBlob(base64Data: string | null) {
        if (!base64Data) {
            return '/no-image-icon.svg';
        }
        try {
            return `data:image/jpeg;base64,${base64Data}`;
        } catch (error) {
            return '/no-image-icon.svg';
        }
    }

    async function showSuccessAndRedirect() {
        showSuccessToast = true;
        await invalidateAll();
        setTimeout(() => {
            showSuccessToast = false;
        }, 1500);
    }
</script>

<div class="toast toast-top toast-end z-50">
    {#if showSuccessToast}
        <div class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>¡Modelo creado exitosamente!</span>
        </div>
    {/if}
    
    {#if showDeleteSuccessToast}
        <div class="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>¡Modelo eliminado exitosamente!</span>
        </div>
    </div>
{/if}

{#if showToast}
    <div class="fixed top-4 right-4 z-50">
        <div class="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded shadow-lg flex items-center gap-2">
            <svg class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
                {#if data.toast === 'modelo-actualizado'}
                    Modelo actualizado exitosamente
                {:else}
                    Operación completada exitosamente
                {/if}
            </span>
        </div>
    </div>
{/if}

<div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Modelos de Vehículos</h1>
        <button class="btn btn-primary" onclick={openCreateModal}>
            Crear Nuevo Modelo
        </button>
    </div>

    {#if data.modelos.length === 0}
        <div class="alert alert-info">
            <span>No hay modelos.</span>    
        </div>
    {:else}
        <ModelVehicleSearch 
            modelos={data.modelos} 
            categorias={data.categorias}
        >
            {#snippet children(filteredModelos)}
                {#each filteredModelos as modelo}
                    <div class="card bg-base-100 shadow-lg border border-gray-200 rounded-lg overflow-hidden">
                        <div class="flex flex-row">
                            <figure class="w-80 p-4 flex items-center justify-center bg-gray-50">
                                <img 
                                    src={modelo.imagenBlob ? getImageUrlFromBlob(modelo.imagenBlob) : '/no-image-icon.svg'} 
                                    alt={`${modelo.marca} ${modelo.modelo}`} 
                                    class="h-60 w-60 object-cover rounded-lg" 
                                    style="max-width: 260px; max-height: 260px; width: 260px; height: 260px;"
                                    onerror={handleModelImageError}
                                />
                            </figure>
                        <div class="card-body p-4 flex-1 flex flex-col justify-center">
                            <div class="flex justify-between items-start mb-4">
                                <h2 class="card-title text-2xl font-bold text-gray-800">
                                    {modelo.marca} {modelo.modelo}
                                </h2>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-3">
                                    <p class="flex items-center gap-2">
                                        <span class="font-semibold text-gray-600 text-lg">Categoría:</span>
                                        <span class="badge badge-outline px-3 py-1 text-base">{modelo.categoria}</span>
                                    </p>
                                    <p class="flex items-center gap-2">
                                        <span class="font-semibold text-gray-600 text-lg">Capacidad:</span>
                                        <span class="badge badge-outline px-3 py-1 text-base">{modelo.capacidadPasajeros} pasajeros</span>
                                    </p>
                                    <p class="flex items-center gap-2">
                                        <span class="font-semibold text-gray-600 text-lg">Autos asignados:</span>
                                        <span class="badge px-3 py-1 text-base">{modelo.unidadesAsignadas || 0} unidades</span>
                                    </p>
                                </div>
                                <div class="space-y-3">
                                    <p class="flex items-center gap-2">
                                        <span class="font-semibold text-gray-600 text-lg">Precio por día:</span>
                                        <span class="badge badge-primary px-3 py-1 text-base">${modelo.precioPorDia}</span>
                                    </p>
                                    <p class="flex items-center gap-2">
                                        <span class="font-semibold text-gray-600 text-lg">Política:</span>
                                        <span class="badge badge-outline px-3 py-1 text-base">{modelo.politicaCancelacion}</span>
                                    </p>
                                    {#if modelo.politicaCancelacion === 'Reembolso Parcial'}
                                        <p class="flex items-center gap-2">
                                            <span class="font-semibold text-gray-600 text-lg">Porcentaje de Reembolso Parcial:</span>
                                            <span class="badge badge-outline px-3 py-1 text-base">{modelo.porcentajeReembolsoParcial}%</span>
                                        </p>
                                    {/if}
                                </div>
                                <div>
                                    <div class="card-actions justify-end ">
                                        <a href={`/admin/modelos/${modelo.id}`} class="btn btn-primary">
                                            Editar
                                        </a>
                                        <button onclick={() => confirmarEliminacion(modelo)} class="btn btn-error">
                                            Dar de baja
                                        </button>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            {/each}
            {/snippet}
        </ModelVehicleSearch>
    {/if}
</div>

{#if showCreateModal}
<div class="modal modal-open">
    <div class="modal-box">
        <h2 class="font-bold text-lg mb-4">Crear Nuevo Modelo</h2>
        <form 
            method="POST" 
            action="?/create"
            enctype="multipart/form-data"
            use:enhance={({ formData }) => {
                createLoading = true;
                createError = '';
                
                return async ({ result }) => {
                    createLoading = false;
                    
                    if (result.type === 'failure') {
                        createError = (result.data as { message: string })?.message || 'Error al crear el modelo';
                    } else if (result.type === 'success') {
                        closeModal();
                        showSuccessAndRedirect();
                    }
                };
            }}
        >
            <div class="form-control">
                <label class="label" for="marca">
                    <span class="label-text">Marca</span>
                </label>
                <input type="text" id="marca" name="marca" class="input input-bordered w-full" required disabled={createLoading} />
            </div>
            
            <div class="form-control">
                <label class="label" for="modelo">
                    <span class="label-text">Modelo</span>
                </label>
                <input type="text" id="modelo" name="modelo" class="input input-bordered w-full" required disabled={createLoading} />
            </div>
            
            <div class="form-control">
                <label class="label" for="idCategoria">
                    <span class="label-text">Categoría</span>
                </label>
                <select id="idCategoria" name="idCategoria" class="select select-bordered w-full" required disabled={createLoading}>
                    <option value="">Seleccione una categoría</option>
                    {#each data.categorias as categoria}
                        <option value={categoria.id}>{categoria.nombre}</option>
                    {/each}
                </select>
            </div>

            <div class="form-control">
                <label class="label" for="capacidadPasajeros">
                    <span class="label-text">Capacidad de Pasajeros</span>
                </label>
                <input type="number" id="capacidadPasajeros" name="capacidadPasajeros" class="input input-bordered w-full" required min="1" disabled={createLoading} />
            </div>

            <div class="form-control">
                <label class="label" for="precioPorDia">
                    <span class="label-text">Precio por Día</span>
                </label>
                <input type="number" id="precioPorDia" name="precioPorDia" class="input input-bordered w-full" required min="0" step="0.01" disabled={createLoading} />
            </div>

            <div class="form-control">
                <label class="label" for="imagen">
                    <span class="label-text">Imagen del Vehículo</span>
                </label>
                <input 
                    type="file" 
                    id="imagen" 
                    name="imagen" 
                    class="file-input file-input-bordered w-full" 
                    accept="image/*"
                    onchange={handleImageInput}
                    disabled={createLoading}
                />
            </div>

            {#if displayImageUrl}
                <div class="flex justify-center mt-2">
                    <img
                        src={displayImageUrl}
                        alt="Preview imagen"
                        class="h-40 w-40 object-cover rounded border"
                        style="max-width: 160px; max-height: 160px;"
                        onerror={handleImageError}
                    />
                </div>
            {/if}

            <div class="form-control">
                <label class="label" for="idPoliticaCancelacion">
                    <span class="label-text">Política de Cancelación</span>
                </label>
                <select id="idPoliticaCancelacion" name="idPoliticaCancelacion" class="select select-bordered w-full" required oninput={e => selectedPolitica = (e.target as HTMLSelectElement).value} disabled={createLoading}>
                    <option value="">Seleccione una política</option>
                    {#each data.politicas as politica}
                        <option value={politica.id}>{politica.tipoPolitica}</option>
                    {/each}
                </select>
            </div>

            {#if data.politicas.find(p => String(p.id) === selectedPolitica)?.tipoPolitica === 'Reembolso Parcial'}
                <div class="form-control mt-2">
                    <label class="label" for="porcentajeReembolsoParcial">
                        <span class="label-text">Porcentaje de Reembolso Parcial (%)</span>
                    </label>
                    <input
                        type="number"
                        id="porcentajeReembolsoParcial"
                        name="porcentajeReembolsoParcial"
                        class="input input-bordered w-full {porcentajeReembolsoParcialError ? 'border-red-500' : ''}"
                        min="0"
                        max="99"
                        step="0.01"
                        required
                        bind:value={porcentajeReembolsoParcial}
                        oninput={() => {
                            const val = parseFloat(porcentajeReembolsoParcial);
                            if (isNaN(val) || val < 0 || val > 99) {
                                porcentajeReembolsoParcialError = 'El porcentaje debe ser entre 0 y 99';
                            } else {
                                porcentajeReembolsoParcialError = '';
                            }
                        }}
                        disabled={createLoading}
                    />
                    {#if porcentajeReembolsoParcialError}
                        <span class="text-error text-sm mt-1">{porcentajeReembolsoParcialError}</span>
                    {/if}
                </div>
            {/if}

            {#if createError}
                <p class="text-error text-sm mt-2">{createError}</p>
            {/if}

            <div class="modal-action">
                <button type="button" class="btn btn-ghost" onclick={closeModal} disabled={createLoading}>Cancelar</button>
                <button type="submit" class="btn btn-primary" disabled={!!porcentajeReembolsoParcialError || createLoading}>
                    {#if createLoading}
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creando modelo...
                    {:else}
                        Crear Modelo
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>
{/if}

<!-- Modal de confirmación de eliminación -->
{#if showDeleteModal && modeloAEliminar}
<div class="modal modal-open">
    <div class="modal-box">
        <h2 class="font-bold text-lg mb-4 text-error">Confirmar Eliminación</h2>
        
        <div class="py-4">
            <p class="text-base mb-4">
                ¿Está seguro que desea eliminar el modelo de vehículo?
            </p>
            
            <div class="bg-base-200 p-4 rounded-lg">
                <p class="font-semibold text-lg">
                    {modeloAEliminar.marca} {modeloAEliminar.modelo}
                </p>
                <p class="text-sm text-gray-600">
                    Reservas activas: {modeloAEliminar.reservasActivas || 0}
                </p>
                <p class="text-sm text-gray-600">
                    Unidades asignadas: {modeloAEliminar.unidadesAsignadas || 0}
                </p>
            </div>
            
            <div class="alert alert-warning mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span><strong>Advertencia:</strong> También se eliminarán las unidades asignadas al modelo.</span>
            </div>
        </div>

        {#if deleteError}
            <div class="alert alert-error mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{deleteError}</span>
            </div>
        {/if}

        <form 
            method="POST" 
            action="?/eliminarModelo"
            use:enhance={() => {
                deleteLoading = true;
                deleteError = '';
                
                return async ({ result }) => {
                    deleteLoading = false;
                    
                    if (result.type === 'failure') {
                        deleteError = (result.data as { message: string })?.message || 'Error al eliminar el modelo';
                    } else if (result.type === 'success') {
                        cerrarModalEliminacion();
                        mostrarExitoEliminacion();
                    }
                };
            }}
        >
            <input type="hidden" name="id" value={modeloAEliminar.id} />
            
            <div class="modal-action">
                <button type="button" class="btn btn-ghost" onclick={cerrarModalEliminacion} disabled={deleteLoading}>
                    Cancelar
                </button>
                <button type="submit" class="btn btn-error" disabled={deleteLoading}>
                    {#if deleteLoading}
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Eliminando modelo...
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar Modelo
                    {/if}
                </button>
            </div>
        </form>
    </div>
</div>
{/if}