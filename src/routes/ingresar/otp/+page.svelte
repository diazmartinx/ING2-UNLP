<script lang="ts">
    import type { PageData } from './$types';
    import { enhance } from '$app/forms';
	import { page } from '$app/state';

    let { data }: { data: PageData } = $props();
</script>

<main>
    <h1>OTP</h1>
    <form method="post" action="?/verifyOtp" use:enhance
    >
        <input type="hidden" name="email" value={page.url.searchParams.get('email')} />
        <input type="text" name="otp" />
        <button type="submit" class="btn btn-primary">Verificar</button>
    </form>
</main>