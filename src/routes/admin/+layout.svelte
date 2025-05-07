<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';

    let { data, children }: { data: LayoutData, children: Snippet } = $props();
    
    let adminMenu = [

    {
            label: 'Reservas',
            href: '/admin'
        },
        {
            label: 'Categorías',
            href: '/admin/categorias'
        },
        {
            label: 'Modelos',
            href: '/admin/modelos'
        },
        {
            label: 'Vehiculos',
            href: '/admin/vehiculos'
        },
        {
            label: 'Clientes',
            href: '/admin/clientes'
        },
    ]
</script>

<div class="flex min-h-[100dvh]">
    <nav class="flex flex-col w-96 items-end gap-6  p-4 md:px-8 sticky top-0 bg-base-200 border-r border-base-300">
        <a href="/admin" class="text-2xl font-bold">ALQUILANDO</a>

        <ul class="flex flex-col gap-2  w-full flex-1 items-start">
            {#each adminMenu as item}
                <li class="w-full">
                    <a href={item.href} class="btn text-lg font-medium btn-ghost hover:border-none w-full !text-right justify-end">{item.label}</a>
                </li>
            {/each}
        </ul>

        <p class="btn w-full">Cerrar sesión</p>
    </nav>

    <main class="flex-1 p-8">
        {@render children()}
    </main>
</div>

