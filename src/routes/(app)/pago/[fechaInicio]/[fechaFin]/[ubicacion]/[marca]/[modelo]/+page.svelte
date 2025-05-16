<script lang="ts">
    import type { PageData } from './$types';

    export let data: PageData;
    let fechaInicio = data.fechaInicio;
    let fechaFin = data.fechaFin;
    let ubicacion = decodeURIComponent(data.ubicacion);
    let marca = data.marca; 
    let modelo = data.modelo;
</script>

<p>{fechaInicio} - {fechaFin} - {ubicacion} - {marca} - {modelo}</p>