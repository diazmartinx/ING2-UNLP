<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    // Base data from the server (reactive to `data` prop changes)
    let modelo = $derived(data.modelo);
    let categoria = $derived(data.categoria);
    let politica = $derived(data.politica);
</script>

<div class="container mx-auto p-4">
	{#if modelo}
		<h1 class="text-3xl font-bold mb-6 text-center">{modelo.marca} {modelo.modelo}</h1>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
			<!-- Image Column -->
			<div>
				{#if modelo.imagenUrl}
					<img
						src={modelo.imagenUrl}
						alt="Imagen del vehículo {modelo.marca} {modelo.modelo}"
						class="w-full h-auto object-cover rounded-lg shadow-lg mb-4"
					/>
				{:else}
					<div
						class="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg shadow-lg mb-4"
					>
						<span class="text-gray-500">Imagen no disponible</span>
					</div>
				{/if}
			</div>

			<!-- Details Column -->
			<div class="bg-white p-6 rounded-lg shadow-md">
				<h2 class="text-2xl font-semibold mb-4">Detalles del Modelo</h2>

				<div class="mb-4">
					<p class="text-sm font-medium text-gray-500">Marca</p>
					<p class="text-lg text-gray-900">{modelo.marca}</p>
				</div>

				<div class="mb-4">
					<p class="text-sm font-medium text-gray-500">Modelo</p>
					<p class="text-lg text-gray-900">{modelo.modelo}</p>
				</div>

				<div class="mb-4">
					<p class="text-sm font-medium text-gray-500">Capacidad de Pasajeros</p>
					<p class="text-lg text-gray-900">{modelo.capacidadPasajeros}</p>
				</div>

				<div class="mb-4">
					<p class="text-sm font-medium text-gray-500">Precio por Día</p>
					<p class="text-lg text-gray-900">${modelo.precioPorDia.toFixed(2)}</p>
				</div>

				{#if categoria}
					<div class="mb-4">
						<p class="text-sm font-medium text-gray-500">Categoría</p>
						<p class="text-lg text-gray-900">{categoria.nombre}</p>
					</div>
				{/if}

				{#if politica}
					<div class="mb-4">
						<p class="text-sm font-medium text-gray-500">Política de Cancelación</p>
						<p class="text-lg text-gray-900">{politica.tipoPolitica}</p>
						{#if politica.tipoPolitica === 'Reembolso Parcial' && modelo.porcentajeReembolsoParcial}
							<p class="text-md text-gray-700">
								Porcentaje de Reembolso: {modelo.porcentajeReembolsoParcial}%
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<p class="text-center text-xl text-red-500">No se pudo cargar la información del modelo.</p>
	{/if}
</div>

<style>
	/* Puedes agregar estilos específicos aquí si es necesario */
	.container {
		max-width: 1000px;
	}
</style>
