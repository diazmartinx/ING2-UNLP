<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let passwordFormData = {
		currentPassword: '',
		newPassword: '',
		newPasswordConfirm: ''
	};

	$: if (form?.success) {
		passwordFormData = {
			currentPassword: '',
			newPassword: '',
			newPasswordConfirm: ''
		};
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

		{#if form?.success}
			<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
				{form.success}
			</div>
		{/if}

		<form method="POST" use:enhance>
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
					class="btn btn-primary"
					disabled={!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.newPasswordConfirm}
				>
					Cambiar Contraseña
				</button>
			</div>
		</form>
	</div>
</div>