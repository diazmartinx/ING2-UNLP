<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

{#each data.categorias as categoria}
<p class="font-semibold text-red-500 p-8 text-2xl">{categoria.nombre}</p>

{
/each
}