<script lang="ts">
	import '../app.css';
	import { enhance } from '$app/forms';
	
	// Define el tipo de usuario si lo deseas
	type User = {
		email: string;
		nombre?: string;
		apellido?: string;
		rol?: string;
	};
	
	export let data: { user?: User } = {};
	
	let isLoggedIn = data.user !== undefined && data.user !== null;
	let username = data.user ? `${data.user.nombre || ''} ${data.user.apellido || ''}`.trim() || data.user.email : '';
	let showLoginModal = false;
	let loginError = '';

	function openLoginModal() {
		showLoginModal = true;
		loginError = '';
	}
	function closeModals() {
		showLoginModal = false;
		loginError = '';
	}
</script>

<div class="flex flex-col min-h-[100dvh] bg-gray-100">
	<nav class="flex items-center justify-between bg-white p-4 shadow-md">
		<a href="/" class="text-2xl font-bold hover:underline">ALQUILANDO</a>
		<div class="flex gap-2">
			{#if isLoggedIn}
				<div class="dropdown dropdown-end">
					<button class="btn btn-ghost">
						{username} <span class="ml-2">▼</span>
					</button>
					<ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
						{#if data.user?.rol === 'admin'}
							<li><a href="/admin">Panel de Administrador</a></li>
						{:else}
							<li><a href="/perfil">Perfil</a></li>
						{/if}
						<li><a href="/mis-reservas">Mis Reservas</a></li>
						<li class="text-error">
							<button type="submit" form="logout-form" class="w-full text-left hover:cursor-pointer">Cerrar Sesión</button>
							<form id="logout-form" method="POST" action="?/logout" class="hidden"></form>
						</li>
					</ul>
				</div>
			{:else}
				<button onclick={openLoginModal} class="btn">Iniciar Sesión</button>
				<a href="/registrarse" class="btn btn-primary">Registrarse</a>
			{/if}
		</div>
	</nav>
	<slot />
</div>

{#if showLoginModal}
<div class="modal modal-open">
	<div class="modal-box">
		<h2 class="font-bold text-lg">Iniciar Sesión</h2>
		<form 
			method="POST" 
			action="/ingresar?/login"
			use:enhance={({ formData }: { formData: FormData }) => {
				return async ({ result }: { result: any }) => {
					if (result.type === 'failure') {
						loginError = (result.data as { message: string })?.message || 'Error al iniciar sesión';
					} else if (result.type === 'redirect') {
						closeModals();
						window.location.href = result.location;
					}
				};
			}}
		>
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
			{#if loginError}
				<p class="text-error text-sm mt-2">{loginError}</p>
			{/if}
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
				Crea una cuenta
			</a>
		</p>
	</div>
</div>
{/if}
