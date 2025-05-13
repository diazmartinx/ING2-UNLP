<script lang="ts">
	import '../app.css';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	
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
				{#if $page.url.pathname !== '/ingresar'}
					<a href="/ingresar" class="btn">Iniciar Sesión</a>
				{/if}
				{#if $page.url.pathname !== '/registrarse'}
					<a href="/registrarse" class="btn btn-primary">Registrarse</a>
				{/if}
			{/if}
		</div>
	</nav>
	<slot />
</div>
