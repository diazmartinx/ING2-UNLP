<script>
	let { data, form } = $props();
	
</script>

<div class="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700">
	<form class="space-y-6" method="POST" action="?/create">
		<h5 class="text-xl font-medium text-gray-900 dark:text-white">Ingresar nueva categoría</h5>
		<div>
			<label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="nombre">
				Nueva categoría:
				<input class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Descapotable" 
					name="nombre"
					autocomplete="off"
					required
				/>
			</label>
		</div>
		
	</form>
	
	{#if form?.error}
		<div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
			<span class="font-medium">Error! </span> {form.error}.
		</div>
	{/if}
	
	{#if form?.success}
		<div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
			<span class="font-medium">Éxito! </span> {form.message}.
	  	</div>
		
	{/if}
	

	<ul class="todos">
		{#each data.categorias as categoria (categoria.id)}
			<li>
				<form method="POST" action="?/delete">
					<input type="hidden" name="id" value={categoria.id} />
					<span>{categoria.nombre}</span>
					<button aria-label="Mark as complete"></button>
				</form>
			</li>
		{/each}
	</ul>

	

</div>

<style>
</style>
