<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import { goto } from '$app/navigation';

	export let form: ActionData;

	let passwordFormData = {
		currentPassword: '',
		newPassword: '',
		newPasswordConfirm: ''
	};

	let loading = false;

	function onSubmit() {
		loading = true;
	}

	function onReset() {
		loading = false;
	}

	$: if (form?.error) {
		loading = false;
	}
</script>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mt-6">
		<h2 class="text-xl font-bold mb-4">Cambiar Contraseña</h2>

		{#if form?.error}
			<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
				{form.error}
			</div>
		{/if}

		<form method="POST" use:enhance on:submit={onSubmit} on:reset={onReset}>
			<div class="space-y-4">
				<div>
					<label for="currentPassword" class="block text-sm font-medium text-gray-700">Contraseña Actual</label>
					<input
						id="currentPassword"
						type="password"
						name="currentPassword"
						bind:value={passwordFormData.currentPassword}
						class="input input-bordered w-full"
						required
					/>
				</div>

				<div>
					<label for="newPassword" class="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
					<input
						id="newPassword"
						type="password"
						name="newPassword"
						bind:value={passwordFormData.newPassword}
						class="input input-bordered w-full"
						required
					/>
				</div>

				<div>
					<label for="newPasswordConfirm" class="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
					<input
						id="newPasswordConfirm"
						type="password"
						name="newPasswordConfirm"
						bind:value={passwordFormData.newPasswordConfirm}
						class="input input-bordered w-full"
						required
					/>
				</div>
			</div>

			<div class="flex justify-end space-x-4 mt-6">
				<a href="/admin/mi-perfil" class="btn btn-ghost">Cancelar</a>
				<button
					type="submit"
					class="btn btn-primary flex items-center justify-center"
					disabled={loading || !passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.newPasswordConfirm}
				>
					{#if loading}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Cambiando...
					{:else}
						Cambiar Contraseña
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>