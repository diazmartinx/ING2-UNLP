<script lang="ts">
    import type { PageData } from './$types';
    import { goto } from '$app/navigation';
    let { data }: { data: PageData } = $props();
    let categorias = $state([...data.categorias]);

    function eliminarCategoria(id: number) {
        console.log(`Eliminar categoría ${id}`);
    }

    function editarCategoria(categoria: { id: number; nombre: string }) {
        console.log(`Editar categoría ${categoria.id}`);
    }
</script>

<div class="p-4">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-bold text-gray-800">Categorías</h2>
        <button
          onclick={() => goto('/admin/categorias/agregar')}
          class="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition"
        >
          + Nueva Categoría
        </button>
    </div>

    {#if categorias.length === 0}
    <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md">
      <p class="font-bold">No hay categorías.</p>
    </div>
  {:else}
    <ul class="space-y-4">
      {#each categorias as categoria}
        <li class="bg-white p-4 rounded-xl shadow flex justify-between items-center">
          <span class="text-lg text-gray-700">{categoria.nombre}</span>
          <div class="flex gap-2">
            <button
              onclick={() => editarCategoria(categoria)}
              class="bg-violet-100 hover:bg-violet-200 text-violet-700 px-3 py-1 rounded-md text-sm font-medium transition"
            >
              Editar
            </button>
            <button
              onclick={() => eliminarCategoria(categoria.id)}
              class="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md text-sm font-medium transition"
            >
              Eliminar
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>