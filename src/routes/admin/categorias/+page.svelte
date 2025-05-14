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

<div class="container mx-auto p-4">
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-3xl font-bold text-gray-800">Categorías</h2>
		<button onclick={() => goto('/admin/categorias/agregar')} class="btn btn-primary">
			Crear Nueva Categoría
		</button>
	</div>

	{#if categorias.length === 0}
		<div class="mb-6 rounded-md border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
			<p class="font-bold">No hay categorías.</p>
		</div>
	{:else}
		<ul class="space-y-4">
			{#each categorias as categoria}
				<li class="flex items-center justify-between rounded-xl bg-white p-4 shadow">
					<span class="text-lg text-gray-700">{categoria.nombre}</span>
					<div class="flex gap-2">
						<button onclick={() => editarCategoria(categoria)} class="btn btn-primary">
							Editar
						</button>
						<button onclick={() => eliminarCategoria(categoria.id)} class="btn btn-error">
							Eliminar
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
