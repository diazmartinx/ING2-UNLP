<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<div>

    
<dl class="max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
    <div class="flex flex-col pb-3">
        <dt class="mb-1 text-gray-500 md:text-lg dark:text-gray-400">Email address</dt>
        <dd class="text-lg font-semibold">yourname@flowbite.com</dd>
    </div>
</dl>

<ul>
	{#each data.vehiculos as { patente }}
		<li><a href="./vehiculos/{patente}">{patente}</a></li>
	{/each}
</ul>

</div>