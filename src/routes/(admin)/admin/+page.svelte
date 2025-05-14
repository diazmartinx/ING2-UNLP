<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>


        <p>user:</p>
        {#each Object.entries(data.user) as [key, value]}
            <p class="text-left">{key}: {value}</p>
        {/each}