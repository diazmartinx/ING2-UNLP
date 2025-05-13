<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { invalidateAll } from '$app/navigation';

    let { data }: { data: PageData } = $props();
    let showCreateModal = $state(false);
    let createError = $state('');
    let createImageUrl = $state('');
    let createImageError = $state(false);
    let selectedPolitica = $state('');
    let porcentajeReembolsoParcial = $state('');
    let porcentajeReembolsoParcialError = $state('');
    let showSuccessToast = $state(false);
    let displayImageUrl = $state('');
    let imageLoadAttempted = $state(false);
    let modelImages = $state(new Map());

    function openCreateModal() {
        showCreateModal = true;
        createError = '';
        createImageUrl = '';
        displayImageUrl = '';
        createImageError = false;
        imageLoadAttempted = false;
    }

    function closeModal() {
        showCreateModal = false;
        createError = '';
        createImageUrl = '';
        displayImageUrl = '';
        createImageError = false;
        imageLoadAttempted = false;
    }

    function handleImageInput(e: Event) {
        const url = (e.target as HTMLInputElement).value;
        createImageUrl = url;
        displayImageUrl = url;
        createImageError = false;
        imageLoadAttempted = false;
    }

    function handleImageError() {
        displayImageUrl = '/no-image-icon.svg';
        createImageError = true;
    }

    function handleImageLoad() {
        createImageError = false;
    }

    function handleModelImageError(event: Event) {
        const img = event.currentTarget as HTMLImageElement;
        img.src = '/no-image-icon.svg';
    }

    function handleModelImageLoad(modeloId: number, imageUrl: string) {
        modelImages.set(modeloId, imageUrl);
    }

    async function showSuccessAndRedirect() {
        showSuccessToast = true;
        await invalidateAll();
        setTimeout(() => {
            showSuccessToast = false;
            goto('/admin/modelos');
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
</div>

<div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Modelos de Vehículos</h1>
        <button class="btn btn-primary" onclick={openCreateModal}>
            Crear Nuevo Modelo
        </button>
    </div>

    <div class="flex flex-col gap-6">
        {#each data.modelos as modelo}
            <div class="card bg-base-100 shadow-lg border border-gray-200 rounded-lg overflow-hidden">
                <div class="flex flex-row">
                    <figure class="w-80 p-4 flex items-center justify-center bg-gray-50">
                        <img 
                            src={modelo.imagenUrl || '/no-image-icon.svg'} 
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
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

{#if showCreateModal}
<div class="modal modal-open">
    <div class="modal-box">
        <h2 class="font-bold text-lg mb-4">Crear Nuevo Modelo</h2>
        <form 
            method="POST" 
            action="?/create"
            use:enhance={({ formData }) => {
                return async ({ result }) => {
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
                <input type="text" id="marca" name="marca" class="input input-bordered w-full" required />
            </div>
            
            <div class="form-control">
                <label class="label" for="modelo">
                    <span class="label-text">Modelo</span>
                </label>
                <input type="text" id="modelo" name="modelo" class="input input-bordered w-full" required />
            </div>
            
            <div class="form-control">
                <label class="label" for="idCategoria">
                    <span class="label-text">Categoría</span>
                </label>
                <select id="idCategoria" name="idCategoria" class="select select-bordered w-full" required>
                    <option value="">Seleccione una categoría</option>
                    {#each data.categorias as categoria}
                        <option value={categoria.id}>{categoria.nombre}</option>
                    {/each}
                </select>
            </div>
            
            <div class="form-control">
                <label class="label" for="anio">
                    <span class="label-text">Año</span>
                </label>
                <input type="number" id="anio" name="anio" class="input input-bordered w-full" required min="1900" max={new Date().getFullYear()} />
            </div>

            <div class="form-control">
                <label class="label" for="capacidadPasajeros">
                    <span class="label-text">Capacidad de Pasajeros</span>
                </label>
                <input type="number" id="capacidadPasajeros" name="capacidadPasajeros" class="input input-bordered w-full" required min="1" />
            </div>

            <div class="form-control">
                <label class="label" for="precioPorDia">
                    <span class="label-text">Precio por Día</span>
                </label>
                <input type="number" id="precioPorDia" name="precioPorDia" class="input input-bordered w-full" required min="0" step="0.01" />
            </div>

            <div class="form-control">
                <label class="label" for="imagenUrl">
                    <span class="label-text">URL de la Imagen</span>
                </label>
                <input type="url" id="imagenUrl" name="imagenUrl" class="input input-bordered w-full" required oninput={handleImageInput} />
            </div>

            {#if createImageUrl}
                <div class="flex justify-center mt-2">
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


            <div class="form-control">
                <label class="label" for="idPoliticaCancelacion">
                    <span class="label-text">Política de Cancelación</span>
                </label>
                <select id="idPoliticaCancelacion" name="idPoliticaCancelacion" class="select select-bordered w-full" required oninput={e => selectedPolitica = (e.target as HTMLSelectElement).value}>
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
                <button type="button" class="btn btn-ghost" onclick={closeModal}>Cancelar</button>
                <button type="submit" class="btn btn-primary" disabled={!!porcentajeReembolsoParcialError}>Crear Modelo</button>
            </div>
        </form>
    </div>
</div>
{/if}