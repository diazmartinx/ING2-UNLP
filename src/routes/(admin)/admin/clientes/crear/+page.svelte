<script lang="ts">
	import { enhance } from '$app/forms';
    import type { PageData, ActionData } from './$types';

    let { data, form }: { data: PageData, form: ActionData } = $props();
</script>

<main class="container flex-1 mx-auto p-4 md:px-8 flex flex-col items-center justify-center">
    <section class="bg-base-200 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 class="text-3xl font-bold text-center mb-6">Crear Nuevo Cliente</h1>
        
        <form method="POST" action="?/crear" class="space-y-4" use:enhance>
            <div>
                <label for="nombre" class="label">
                    <span class="label-text">Nombre</span>
                </label>
                <input type="text" id="nombre" name="nombre" class="input input-bordered w-full" required />
            </div>
            <div>
                <label for="apellido" class="label">
                    <span class="label-text">Apellido</span>
                </label>
                <input type="text" id="apellido" name="apellido" class="input input-bordered w-full" required />
            </div>
            <div>
                <label for="dni" class="label">
                    <span class="label-text">DNI</span>
                </label>
                <input type="text" id="dni" name="dni" class="input input-bordered w-full" required pattern="\d+" title="Ingrese solo números" />
            </div>
            <div>
                <label for="fechaNacimiento" class="label">
                    <span class="label-text">Fecha de Nacimiento</span>
                </label>
                <input type="date" id="fechaNacimiento" name="fechaNacimiento" class="input input-bordered w-full" required />
            </div>
            <div>
                <label for="email" class="label">
                    <span class="label-text">Email</span>
                </label>
                <input type="email" id="email" name="email" class="input input-bordered w-full" required />
            </div>
            <div>
                <label for="telefono" class="label">
                    <span class="label-text">Teléfono</span>
                </label>
                <input type="tel" id="telefono" name="telefono" class="input input-bordered w-full" required pattern="\d+" title="Ingrese solo números" />
            </div>

            {#if form?.error}
                <p class="text-error text-sm">{form.error}</p>
            {/if}

            {#if form?.success}
                <p class="text-success text-sm">Cliente creado exitosamente. Se ha enviado un email con la contraseña.</p>
            {/if}

            <button type="submit" class="btn btn-primary w-full">Crear Cliente</button>
            <a href="/admin/clientes" class="btn btn-ghost w-full mt-2">Volver a Listado</a>
        </form>
    </section>
</main> 