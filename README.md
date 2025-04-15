# Alquilando  🚀

> Una breve descripción de lo que hace el proyecto. Por ejemplo: "Aplicación web X construida con el stack moderno de Bun, Hono y Cloudflare".

Este repositorio contiene el código fuente para alquilando, una aplicación web que permite alquilar vehículos. Está construido utilizando un stack enfocado en la velocidad y el despliegue en el edge.

## Tabla de Contenidos

* [Stack Tecnológico](#stack-tecnológico-)
* [Prerrequisitos](#prerrequisitos-)
* [Primeros Pasos](#primeros-pasos-)
* [Desarrollo Local](#desarrollo-local-)
* [Migraciones de Base de Datos](#migraciones-de-base-de-datos-)
* [Despliegue en Cloudflare](#despliegue-en-cloudflare-)
* [Scripts Importantes](#scripts-importantes-)

## Stack Tecnológico 🛠️

Este proyecto utiliza las siguientes tecnologías principales:

* **[Bun](https://bun.sh/):** Runtime de JavaScript/TypeScript ultrarrápido, bundler, gestor de paquetes y test runner, todo en uno. Usado para correr el proyecto, instalar dependencias y ejecutar scripts.
* **[Hono](https://hono.dev/):** Framework web minimalista y rápido para aplicaciones en el edge (y otros entornos JS). Ideal para Cloudflare Workers/Pages.
* **[Cloudflare D1](https://developers.cloudflare.com/d1/):** Base de datos SQL serverless de Cloudflare, construida sobre SQLite. Usada como base de datos principal.
* **[Cloudflare Pages](https://pages.cloudflare.com/):** Plataforma para desplegar aplicaciones web estáticas y dinámicas (Full-Stack) directamente desde repositorios Git, con integración nativa con Workers y D1.
* **[Tailwind CSS](https://tailwindcss.com/):** Framework CSS utility-first para construir interfaces de usuario rápidamente.
* **[Daisy UI](https://daisyui.com/):** Librería de componentes UI construida sobre Tailwind CSS, que añade clases semánticas para componentes comunes.
* **[HTMX](https://htmx.org/):** Librería que permite acceder a funcionalidades modernas del navegador (AJAX, WebSockets, etc.) directamente desde HTML, sin necesidad de escribir mucho JavaScript.

## Prerrequisitos 📋

Antes de empezar, asegúrate de tener instalado lo siguiente:

1.  **[Bun](https://bun.sh/docs/installation):** Sigue las instrucciones de instalación en su sitio web.
    ```bash
    curl -fsSL [https://bun.sh/install](https://bun.sh/install) | bash
    ```
2.  **[Git](https://git-scm.com/):** Para clonar el repositorio.
3.  **[Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/):** La herramienta de línea de comandos de Cloudflare. Necesaria para desplegar y gestionar recursos como D1.
    ```bash
    bun install -g wrangler # O usa npm/yarn si prefieres
    ```
4.  **Una cuenta de Cloudflare:** Necesaria para desplegar la base de datos D1 y la aplicación en Pages. Debes estar logueado con Wrangler (`wrangler login`).

## Primeros Pasos 🚀

1.  **Clona el repositorio:**
    ```bash
    git clone [URL_DEL_REPOSITORIO]
    cd [NOMBRE_DEL_DIRECTORIO_DEL_PROYECTO]
    ```
2.  **Instala las dependencias:**
    ```bash
    bun install
    ```

## Desarrollo Local 💻

Para trabajar en el proyecto en tu máquina local:

1.  **Aplica las migraciones de la base de datos local:**
    Asegúrate de que tu esquema de base de datos local esté actualizado. Esto usará la configuración de D1 local definida (probablemente en `wrangler.toml`).
    ```bash
    bun db:migrate:local
    ```
    *Nota: Ejecuta este comando cada vez que haya cambios en las migraciones o al configurar el proyecto por primera vez.*

2.  **Inicia el servidor de desarrollo:**
    Esto levantará la aplicación Hono, generalmente en `http://localhost:3000` (o el puerto configurado). El servidor se recargará automáticamente al detectar cambios en el código fuente.
    ```bash
    bun dev
    ```

## Migraciones de Base de Datos 💾

Las migraciones gestionan los cambios en el esquema de tu base de datos Cloudflare D1.

* **Para desarrollo local:** Usa `bun db:migrate:local`. Esto aplica las migraciones pendientes a tu base de datos D1 local configurada en `wrangler.toml`.
* **Para producción:** Usa `bun db:migrate:prod`. Esto aplica las migraciones pendientes a tu base de datos D1 de producción en Cloudflare. **¡Ten cuidado al ejecutar este comando!**

Puedes crear nuevas migraciones usando Wrangler directamente (consulta la documentación de D1 y Wrangler para los comandos específicos, como `wrangler d1 migrations create ...`).

## Despliegue en Cloudflare ☁️

Para desplegar la aplicación en Cloudflare Pages y la base de datos en D1:

1.  **Asegúrate de estar logueado en Wrangler:**
    ```bash
    wrangler login
    ```
    Sigue las instrucciones para autenticarte con tu cuenta de Cloudflare.

2.  **Aplica las migraciones a la base de datos de producción (D1):**
    Antes de desplegar el código de la aplicación, asegúrate de que el esquema de la base de datos de producción esté actualizado.
    ```bash
    bun db:migrate:prod
    ```

3.  **Despliega la aplicación a Cloudflare Pages:**
    Este comando ejecutará el proceso de build (si es necesario) y desplegará tu aplicación a Cloudflare Pages.
    ```bash
    bun run deploy
    ```
    Wrangler gestionará la subida de los archivos y la configuración asociada definida en `wrangler.jsonc`.

## Scripts Importantes 📜

Aquí un resumen de los comandos definidos en `package.json`:

* `bun install`: Instala todas las dependencias del proyecto.
* `bun dev`: Inicia el servidor de desarrollo local con recarga automática.
* `bun db:migrate:local`: Aplica migraciones a la base de datos D1 local.
* `bun db:migrate:prod`: Aplica migraciones a la base de datos D1 de producción. **¡Usar con precaución!**
* `bun run deploy`: Despliega la aplicación a Cloudflare Pages.
