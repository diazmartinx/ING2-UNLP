<script lang="ts">
    import { goto } from '$app/navigation';

    const { data } = $props<{ data: { user: { email: string } | null } }>();

    let fechaInicio = $state('');
    let fechaFin = $state('');
    let ubicacion = $state('');
    let fechaInicioError = $state('');
    let fechaFinError = $state('');
    let ubicacionError = $state('');
    let showLoginModal = $state(false);
    let showRegisterModal = $state(false);

    // Variable para manejar la sesión activa
    let isLoggedIn = $state(data.user !== null);
    let username = $state(data.user ? `${data.user.nombre || ''} ${data.user.apellido || ''}`.trim() || data.user.email : '');

    function openLoginModal() {
        showLoginModal = true;
    }

    function openRegisterModal() {
        showRegisterModal = true;
    }

    function closeModals() {
        showLoginModal = false;
        showRegisterModal = false;
    }

    // Helper to format date as YYYY-MM-DD
    function formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    const today = formatDate(new Date());
    const minEndDate = $derived(fechaInicio && fechaInicio > today ? fechaInicio : today);

    $effect(() => {
        // Reset fechaFin if it becomes invalid due to fechaInicio change
        if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
            fechaFin = '';
            // Optionally clear the error message too
            fechaFinError = '';
        }
    });

    function handleSubmit(event: Event) {
        event.preventDefault();
        // Reset errors
        fechaInicioError = '';
        fechaFinError = '';
        ubicacionError = '';

        let isValid = true;

        if (!fechaInicio) {
            fechaInicioError = 'Por favor, selecciona una fecha de inicio.';
            isValid = false;
        }
        if (!fechaFin) {
            fechaFinError = 'Por favor, selecciona una fecha de fin.';
            isValid = false;
        }
        if (!ubicacion) {
            ubicacionError = 'Por favor, elige una ubicación.';
            isValid = false;
        }

        // Only validate dates if both are provided
        if (fechaInicio && fechaFin) {
            const startDate = new Date(fechaInicio);
            const endDate = new Date(fechaFin);
            if (endDate < startDate) {
                fechaFinError = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
                isValid = false;
            }
        }

        if (isValid) {
            goto(`/${fechaInicio}/${fechaFin}/${ubicacion}`);
        }
    }

    function setRandomDates() {
        const todayDate = new Date(); // Renamed to avoid conflict with const today
        const maxDaysOut = 14;
        const randomStartDays = Math.floor(Math.random() * maxDaysOut); // 0 to 13
        const startDate = new Date(todayDate);
        startDate.setDate(todayDate.getDate() + randomStartDays);

        // End date must be at least one day after start date, and within the 14 day window from today
        const remainingDays = maxDaysOut - randomStartDays;
        const randomEndDaysOffset = Math.floor(Math.random() * (remainingDays - 1)) + 1; // 1 to remainingDays
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + randomEndDaysOffset);

        fechaInicio = formatDate(startDate);
        fechaFin = formatDate(endDate);

        // Clear potential date errors
        fechaInicioError = '';
        fechaFinError = '';
    }
</script>

<div class="flex flex-col min-h-[100dvh] bg-gray-100">
    <nav class="flex items-center justify-between bg-white p-4 shadow-md"> <!-- !<nav class="flex justify-between items-center p-4 md:px-8 bg-white shadow-md"> --->
        <a href="/" class="text-2xl font-bold hover:underline">ALQUILANDO</a>
    
        <div class="flex gap-2">
            {#if isLoggedIn}
                <!-- Menú desplegable para usuario logueado -->
                <div class="dropdown dropdown-end">
                    <button class="btn btn-ghost">
                        {username} <span class="ml-2">▼</span>
                    </button>
                    <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li><a href="/perfil">Perfil</a></li>
                        <li><a href="/mis-reservas">Mis Reservas</a></li>
                        <li class="text-error">
                            <button type="submit" form="logout-form" class="w-full text-left hover:cursor-pointer">Cerrar Sesión</button>
                            <form id="logout-form" method="POST" action="?/logout" class="hidden"></form>
                        </li>
                    </ul>
                </div>
            {:else}
                <!-- Botones para usuarios no logueados -->
                <button onclick={openLoginModal} class="btn">Iniciar Sesión</button>
                <a href="/registrarse" class="btn btn-primary">Registrarse</a>
            {/if}
        </div>
    </nav>
    
    <main class="container flex-1 mx-auto p-4 md:px-8 flex flex-col items-center justify-center">
        <section class="bg-base-200 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1 class="text-3xl font-bold text-center mb-6">Encontrá tu auto ideal</h1>
            <form class="flex flex-col gap-4" onsubmit={handleSubmit}>
                <div class="form-control">
                    <label class="label" for="start-date">
                        <span class="label-text">Fecha de inicio</span>
                    </label>
                    <input type="date" id="start-date" class="input input-bordered w-full" bind:value={fechaInicio} min={today} />
                    {#if fechaInicioError}<p class="text-error text-sm mt-1">{fechaInicioError}</p>{/if}
                </div>
                <div class="form-control">
                    <label class="label" for="end-date">
                        <span class="label-text">Fecha de fin</span>
                    </label>
                    <input type="date" id="end-date" class="input input-bordered w-full" bind:value={fechaFin} min={minEndDate} />
                    {#if fechaFinError}<p class="text-error text-sm mt-1">{fechaFinError}</p>{/if}
                </div>

                <button type="button" class="btn btn-ghost btn-sm self-center" onclick={setRandomDates}>
                    Selección Rápida (Próximos 14 días)
                </button>

                <div class="form-control">
                    <label class="label" for="location">
                        <span class="label-text">Ubicación</span>
                    </label>
                    <select id="location" class="select select-bordered w-full" bind:value={ubicacion}>
                        <option disabled selected value="">Elige una ciudad</option>
                        <option>Buenos Aires</option>
                        <option>Córdoba</option>
                        <option>Rosario</option>
                        <option>Mendoza</option>
                        <option>La Plata</option>
                        <option>San Miguel de Tucumán</option>
                        <option>Mar del Plata</option>
                        <option>Salta</option>
                        <option>Santa Fe</option>
                        <option>San Juan</option>
                    </select>
                    {#if ubicacionError}<p class="text-error text-sm mt-1">{ubicacionError}</p>{/if}
                </div>
                <button type="submit" class="btn btn-primary w-full mt-4">Buscar</button>
            </form>
        </section>
    </main>

    {#if showLoginModal}
    <div class="modal modal-open">
        <div class="modal-box">
            <h2 class="font-bold text-lg">Iniciar Sesión</h2>
            <form method="POST" action="/ingresar?/login">
                <div class="form-control">
                    <label class="label" for="email">
                        <span class="label-text">Correo Electrónico</span>
                    </label>
                    <input type="email" id="email" name="email" class="input input-bordered w-full" required />
                </div>
                <div class="form-control">
                    <label class="label" for="password">
                        <span class="label-text">Contraseña</span>
                    </label>
                    <input type="password" id="password" name="password" class="input input-bordered w-full" required />
                </div>
                <div class="modal-action">
                    <button type="button" class="btn btn-ghost" onclick={closeModals}>Cancelar</button>
                    <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
                </div>
            </form>
            <p class="text-sm mt-4 text-center">
                ¿Aún no estás registrado? 
                <a 
                    href="/registrarse"
                    class="text-primary underline cursor-pointer" 
                >
                    Presiona acá
            </a>
            </p>
        </div>
    </div>
    {/if}

</div>