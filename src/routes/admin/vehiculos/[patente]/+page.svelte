<script lang="ts">
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<h1>
    {data.vehiculo.patente} - {data.vehiculo.idSucursal} {data.vehiculo.estado}
</h1>
