<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';
    import { page } from '$app/state';

    let { data, children }: { data: LayoutData, children: Snippet } = $props();
    
    let adminMenu = [
        {
            label: 'Adicionales',
            href: '/admin/adicionales'
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
            label: 'Empleados',
            href: '/admin/empleados'
        },
        {
            label: 'Reservas',
            href: '/admin/reservas'
        },
        {
            label: 'Reportes',
            href: '/admin/reportes'
        },
        {
            label: 'Mi Perfil',
            href: '/admin/mi-perfil'
        }
    ]

    let empleadoMenu = [
        {
            label: 'Reservas',
            href: '/admin/reservas'
        },
        {
            label: 'Vehículos en Mantenimiento',
            href: '/admin/vehiculos-mantenimiento'
        },
        {
            label: 'Mi Perfil',
            href: '/admin/mi-perfil'
        }
    ]

    let clienteMenu = [
        {
            label: 'Mis Reservas',
            href: '/admin/mis-reservas'
        },
        {
            label: 'Mi Perfil',
            href: '/admin/mi-perfil'
        }
    ]

    let finalMenu = data.user.rol === 'admin' ? adminMenu : data.user.rol === 'empleado' ? empleadoMenu : clienteMenu;

</script>

<div class="flex min-h-[100dvh]">
    <nav class="flex flex-col !w-96 items-end gap-6  p-4 md:px-8 sticky top-0 bg-base-200 border-r border-base-300">

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

        <a href="/" class="btn w-full">Volver a inicio</a>

        <form method="post" action="/?/logout" class="w-full -mt-2">
            <button type="submit" class="btn w-full">Cerrar sesión</button>
        </form>
    </nav>

    <main class="flex-1 p-8">
        {@render children()}
    </main>
</div>

