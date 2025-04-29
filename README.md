# Alquilando

Este README proporciona instrucciones sobre cómo configurar y ejecutar el proyecto localmente.

## Prerrequisitos

*   Tener [Git](https://git-scm.com/) instalado en tu sistema.
*   Tener [Bun](https://bun.sh/) instalado en tu sistema.

## Configuración

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/diazmartinx/ING2-UNLP.git
    cd ING2-UNLP
    ```

2.  **Instala las dependencias:**
    ```bash
    bun install
    ```

3.  **Configura las variables de entorno:**
    *   Crea un archivo `.env` en la raíz del proyecto.
    *   Copia el contenido de `.env.example` en tu nuevo archivo `.env`.
    *   Completa los valores requeridos en el archivo `.env`.

## Ejecución del Proyecto

Para iniciar el servidor de desarrollo, ejecuta el siguiente comando en tu terminal:

```bash
bun run dev --open
```

Esto generalmente abrirá la aplicación en tu navegador web predeterminado.
