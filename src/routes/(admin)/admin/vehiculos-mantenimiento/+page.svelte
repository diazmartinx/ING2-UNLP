<script lang="ts">
    export let data;
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';

    let patente = data.search;
    let debounceTimeout: ReturnType<typeof setTimeout>;

    // Actualiza la URL y recarga la búsqueda al escribir
    function onInput() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            if (patente) {
                params.set('patente', patente);
            } else {
                params.delete('patente');
            }
            goto(`?${params.toString()}`, { keepFocus: true, noScroll: true, replaceState: true });
        }, 250); // 250ms debounce
    }
</script>

<h1 class="text-2xl font-bold mb-4">Unidades en Mantenimiento</h1>

<form method="GET" class="mb-4 flex gap-2" on:submit|preventDefault>
    <input
        type="text"
        name="patente"
        placeholder="Buscar por patente"
        bind:value={patente}
        class="input input-bordered"
        on:input={onInput}
        autocomplete="off"
    />
</form>

{#if data.unidades.length === 0}
    <p>No hay unidades inhabilitadas.</p>
{:else}
    <table class="table">
        <thead>
            <tr>
                <th>Patente</th>
                <th>Sucursal</th>
                <th>Modelo</th>
                <th>Año</th>
                <th>Acción</th>
            </tr>
        </thead>
        <tbody>
            {#each data.unidades as unidad}
                <tr>
                    <td>{unidad.patente}</td>
                    <td>{unidad.sucursal}</td>
                    <td>{unidad.marca} {unidad.modelo}</td>
                    <td>{unidad.anio}</td>
                    <td>
                        <form method="POST" action="?/habilitar" use:enhance>
                            <input type="hidden" name="patente" value={unidad.patente} />
                            <button class="btn btn-success" type="submit">Habilitar</button>
                        </form>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}