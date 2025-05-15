<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';
    import { page } from '$app/state';

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
        {
            label: 'Sucursales',
            href: '/admin/sucursales'
        }
    ]

    let clienteMenu = [
        {
            label: 'Reservas',
            href: '/admin/mis-reservas'
        },
        {
            label: 'Cuenta',
            href: '/admin/cuenta'
        }
    ]

    let finalMenu = data.user.rol === 'admin' ? adminMenu : clienteMenu;

</script>

<div class="flex min-h-[100dvh]">
    <nav class="flex flex-col w-96 items-end gap-6  p-4 md:px-8 sticky top-0 bg-base-200 border-r border-base-300">

        <ul class="flex flex-col gap-2  w-full flex-1 items-start">
            {#each finalMenu as item (item.href)}
                <li class="w-full">
                    <a 
                        href={item.href} 
                        class="btn text-lg font-medium w-full !text-right justify-end {page.url.pathname === item.href ? 'btn-primary' : 'btn-ghost hover:border-none'}"
                    >
                        {item.label}
                    </a>
                </li>
            {/each}
        </ul>

        <form method="post" action="/?/logout" class="w-full">
            <button type="submit" class="btn w-full">Cerrar sesión</button>
        </form>
    </nav>

    <main class="flex-1 p-8">
        {@render children()}
    </main>
</div>

