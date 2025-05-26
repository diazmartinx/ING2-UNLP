<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
{#if data.clientes.length === 0}
    <div class="alert alert-info shadow-lg">
        <div>
            <span>No hay clientes disponibles</span>
        </div>
    </div>
{:else}
<div class="overflow-x-auto">
  <table class="table table-zebra">
        <!-- head -->
        <thead>
            <tr>
                <th>DNI</th>
                <th>Apellido</th>
                <th>Nombre</th>
                <th>Email</th>
            </tr>
        </thead>
        <tbody>
            {#each data.clientes as cliente}
        <!-- row -->
                <tr>
                    <td>{cliente.dni}</td>
                    <td>{cliente.apellido}</td>
                    <td>{cliente.nombre}</td>
                    <td>{cliente.email}</td>
                    <th>
                        <a href="./clientes/{cliente.id}" role="button" class="btn btn-ghost btn-disabled">Detalles</a>
                    </th>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
{/if}