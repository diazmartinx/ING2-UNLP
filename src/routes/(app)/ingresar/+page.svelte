<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';
	import { page } from '$app/stores';

	let { form }: { form: ActionData } = $props();

	let redirectTo = $page.url.searchParams.get('redirectTo') || '/admin';

	function redirectToRegister() {
		const pagoPagina = redirectTo;
		console.log('Redirecting to register with redirectTo:', redirectTo);
		goto(`/registrarse?redirectTo=${pagoPagina}`);
	}
</script>

<main class="container mx-auto flex flex-1 flex-col items-center justify-center p-4 md:px-8 min-h-[100dvh]">
	<section class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
		<h1 class="mb-6 text-center text-3xl font-bold">Iniciar Sesión</h1>
		<form method="post" action="?/login" use:enhance class="flex flex-col gap-4">
			<input type="hidden" name="redirectTo" value={redirectTo} />
			<div class="form-control">
				<label class="label" for="email">
					<span class="label-text">Correo Electrónico</span>
				</label>
				<input type="email" id="email" name="email" class="input input-bordered w-full" />
			</div>
			<div class="form-control">
				<label class="label" for="password">
					<span class="label-text">Contraseña</span>
				</label>
				<input
					id="password"
					type="password"
					name="password"
					class="input input-bordered w-full"
				/>
			</div>
			<div class="mt-4 flex gap-2">
				<button type="submit" class="btn btn-primary w-full">Iniciar Sesión</button>
			</div>
		</form>
		<p class="text-error mt-4 text-center text-sm">{form?.message ?? ''}</p>
		<p class="mt-4 text-center text-sm">
			¿No tenés una cuenta?
			<button 
				type="button"
				onclick={redirectToRegister}
				class="text-primary cursor-pointer underline bg-transparent border-none p-0"
			>
				Registrate acá
			</button>
		</p>
	</section>
</main>
