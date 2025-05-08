<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3">
                    Patente
                </th>
                <th scope="col" class="px-6 py-3">
                    Estado
                </th>
                <th scope="col" class="px-6 py-3">
                    Sucursal
                </th>
            </tr>
        </thead>
        <tbody>
            {#each data.vehiculos as { patente, idSucursal, estado }}
            <tr class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {patente}
                </th>
                <td class="px-6 py-4">
                    {estado}	
                </td>
                <td class="px-6 py-4">
                    {idSucursal}
                </td>
                <td class="px-6 py-4">
                    <a href="./vehiculos/{patente}" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Detalles</a>
                </td>
                <td class="px-6 py-4">
                    <a href="./vehiculos/{patente}" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Editar</a>
                </td>
            </tr>
            {/each}
        </tbody>

    </table>
