<div class="flex flex-col min-h-[100dvh]">
    <nav class="flex justify-between items-center p-4 md:px-8">
        <span class="text-2xl font-bold">ALQUILANDO</span>
    
        <div>
            <button class="btn btn-secondary">Login</button>
            <button class="btn btn-primary">Register</button>
        </div>
    </nav>
    
    <main class="container flex-1 mx-auto p-4 md:px-8 flex flex-col items-center justify-center -mt-32">
        <section class="bg-base-200 p-8 rounded-lg shadow-lg w-full max-w-md">
            <h1 class="text-3xl font-bold text-center mb-6">Encontrá tu auto ideal</h1>
            <form class="flex flex-col gap-4">
                <div class="form-control">
                    <label class="label" for="start-date">
                        <span class="label-text">Fecha de inicio</span>
                    </label>
                    <input type="date" id="start-date" class="input input-bordered w-full" />
                </div>
                <div class="form-control">
                    <label class="label" for="end-date">
                        <span class="label-text">Fecha de fin</span>
                    </label>
                    <input type="date" id="end-date" class="input input-bordered w-full" />
                </div>
                <div class="form-control">
                    <label class="label" for="location">
                        <span class="label-text">Ubicación</span>
                    </label>
                    <select id="location" class="select select-bordered w-full">
                        <option disabled selected>Elige una ciudad</option>
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
                </div>
                <button type="submit" class="btn btn-primary w-full mt-4">Buscar</button>
            </form>
        </section>
    </main>
</div>