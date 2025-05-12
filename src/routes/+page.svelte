<script lang="ts">
    import { goto } from '$app/navigation';

    let fechaInicio = $state('');
    let fechaFin = $state('');
    let ubicacion = $state('');
    let fechaInicioError = $state('');
    let fechaFinError = $state('');
    let ubicacionError = $state('');

    // Helper to format date as YYYY-MM-DD
    function formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    const today = formatDate(new Date());
    const minEndDate = $derived(fechaInicio && fechaInicio > today ? fechaInicio : today);

    $effect(() => {
        if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
            fechaFin = '';
            fechaFinError = '';
        }
    });

    function handleSubmit(event: Event) {
        event.preventDefault();
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
        const todayDate = new Date();
        const maxDaysOut = 14;
        const randomStartDays = Math.floor(Math.random() * maxDaysOut);
        const startDate = new Date(todayDate);
        startDate.setDate(todayDate.getDate() + randomStartDays);
        const remainingDays = maxDaysOut - randomStartDays;
        const randomEndDaysOffset = Math.floor(Math.random() * (remainingDays - 1)) + 1;
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + randomEndDaysOffset);
        fechaInicio = formatDate(startDate);
        fechaFin = formatDate(endDate);
        fechaInicioError = '';
        fechaFinError = '';
    }
</script>

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