<script lang="ts">

	import { enhance } from '$app/forms';
	import { page } from '$app/state';


	let { data, children } = $props();

	let isLoggedIn = $derived(data.user !== undefined && data.user !== null);
	let username = $derived(data.user ? `${data.user.nombre || ''} ${data.user.apellido || ''}`.trim() || data.user.email : '');

</script>

<div class="flex flex-col min-h-[100dvh] bg-gray-100">
	<nav class="flex items-center justify-between bg-white p-4 shadow-md">
		<a href="/" class="flex items-center bg-white border border-gray-200 shadow-md rounded-lg px-3 py-1">
			<img src="/banner_auto.svg" alt="Alquilando" class="h-10 w-10 mr-1.5" />
			<span class="text-lg font-bold" style="color: #1E2A38;">Alquilando</span>
		</a>
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
							<li><a href="/admin/mi-perfil">Mi Perfil</a></li>
						{/if}
						<li><a href="/admin/mis-reservas">Mis Reservas</a></li>
						<li class="text-error">
							<form id="logout-form" method="POST" action="/?/logout">
								<button type="submit" form="logout-form" class="w-full text-left hover:cursor-pointer">Cerrar Sesión</button>
							</form>
						</li>
					</ul>
				</div>
			{:else}
				{#if page.url.pathname !== '/ingresar'}
					<a href="/ingresar" class="btn">Iniciar Sesión</a>
				{/if}
				{#if page.url.pathname !== '/registrarse'}
					<a href="/registrarse" class="btn btn-primary">Registrarse</a>
				{/if}
			{/if}
		</div>
	</nav>
	{@render children()}
</div>
