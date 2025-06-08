<script lang="ts">
    interface ModeloVehiculo {
        id: number;
        marca: string;
        modelo: string;
        capacidadPasajeros: number;
        precioPorDia: number;
        imagenBlob: string | null;
        categoria: string;
        politicaCancelacion: string;
        porcentajeReembolsoParcial: number | null;
    }
    
    interface Categoria {
        id: number;
        nombre: string;
    }

    const { modelos, categorias } = $props<{
        modelos: ModeloVehiculo[];
        categorias: Categoria[];
    }>();

    let searchQuery = $state('');
    let selectedCategory = $state('');
    let priceRange = $state({ min: 0, max: Infinity });
    let passengerCapacity = $state(0);

    let priceRanges = $derived(() => {
        const prices = modelos.map((m: ModeloVehiculo) => m.precioPorDia).sort((a: number, b: number) => a - b);
        if (prices.length === 0) return [];
        
        const min = Math.floor(prices[0]);
        const max = Math.ceil(prices[prices.length - 1]);
        const range = max - min;
        const step = Math.ceil(range / 4);

        return [
            { label: `$${min} - $${min + step}`, min, max: min + step },
            { label: `$${min + step + 1} - $${min + step * 2}`, min: min + step + 1, max: min + step * 2 },
            { label: `$${min + step * 2 + 1} - $${min + step * 3}`, min: min + step * 2 + 1, max: min + step * 3 },
            { label: `$${min + step * 3 + 1}+`, min: min + step * 3 + 1, max: Infinity }
        ];
    });

    let filteredModelos = $derived(
        modelos.filter((modelo: ModeloVehiculo) => {
            const matchesSearch = (modelo.marca + ' ' + modelo.modelo)
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            
            const matchesCategory = !selectedCategory || 
                                  modelo.categoria === selectedCategory;
            
            const matchesPrice = modelo.precioPorDia >= priceRange.min && 
                               (priceRange.max === Infinity || 
                                modelo.precioPorDia <= priceRange.max);
            
            const matchesCapacity = !passengerCapacity || 
                                  modelo.capacidadPasajeros >= passengerCapacity;

            return matchesSearch && matchesCategory && 
                   matchesPrice && matchesCapacity;
        })
    );
</script>

<div class="bg-base-200 p-4 rounded-lg mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Barra de búsqueda -->
        <div class="form-control">
            <input 
                type="text" 
                placeholder="Buscar por marca o modelo..." 
                class="input input-bordered w-full" 
                bind:value={searchQuery}
            />
        </div>

        <!-- Filtro de categoría -->
        <div class="form-control">
            <select 
                class="select select-bordered w-full" 
                bind:value={selectedCategory}
            >
                <option value="">Todas las categorías</option>
                {#each categorias as categoria}
                    <option value={categoria.nombre}>{categoria.nombre}</option>
                {/each}
            </select>
        </div>

        <!-- Filtro de precio -->
        <div class="form-control">
            <select 
                class="select select-bordered w-full"
                onchange={(e) => {
                    const selectedRange = priceRanges()[parseInt(e.currentTarget.value)];
                    priceRange = selectedRange 
                        ? { min: selectedRange.min, max: selectedRange.max }
                        : { min: 0, max: Infinity };
                }}
            >
                <option value="">Todos los precios</option>
                {#each priceRanges() as range, i}
                    <option value={i}>{range.label}</option>
                {/each}
            </select>
        </div>

        <!-- Filtro de capacidad -->
        <div class="form-control">
            <select 
                class="select select-bordered w-full"
                bind:value={passengerCapacity}
            >
                <option value={0}>Cualquier capacidad</option>
                <option value={2}>2+ pasajeros</option>
                <option value={4}>4+ pasajeros</option>
                <option value={6}>6+ pasajeros</option>
                <option value={8}>8+ pasajeros</option>
            </select>
        </div>
    </div>
</div>

<div class="flex flex-col gap-6">
    {#if filteredModelos.length === 0}
        <div class="alert alert-info">
            <span>No se encontraron modelos con los filtros seleccionados.</span>
        </div>
    {:else}
        <slot {filteredModelos} />
    {/if}
</div>