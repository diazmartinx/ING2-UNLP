<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-col min-h-[100dvh]">
    <nav class="flex justify-between items-center p-4 md:px-8">
        <span class="text-2xl font-bold">ALQUILANDO</span>
       
        
    </nav>

    <main class="container flex-1 mx-auto p-4 md:px-8 flex flex-col  justify-center -mt-32">
        <p>user:</p>
        {#each Object.entries(data.user) as [key, value]}
            <p class="text-left">{key}: {value}</p>
        {/each}
    </main>
</div>