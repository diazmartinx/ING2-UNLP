<script lang="ts">
    import type { PageData } from './$types';
    import { goto } from '$app/navigation';
    let { data }: { data: PageData } = $props();
</script>

<div class="p-4">
    <button 
        onclick={() => goto('/admin/categorias/agregar')}
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
    >
        Agregar Categoría
    </button>

    {#each data.categorias as categoria}
        <p class="font-semibold text-red-500 p-8 text-2xl">{categoria.nombre}</p>
    {/each}
</div>