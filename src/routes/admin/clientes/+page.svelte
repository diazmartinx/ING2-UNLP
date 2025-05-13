<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>
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
                        <a href="./clientes/{cliente.id}" role="button" class="btn btn-ghost">Detalles</a>
                    </th>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
