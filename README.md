# Kambista FX Web

Aplicación web de cambio de dólares y soles, hecha con **Vue 3**, **TypeScript**, **Vite** y **Tailwind CSS**. El usuario se registra, inicia sesión, cambia dinero con el último tipo de cambio de SUNAT y revisa su historial.

Necesita la API (`kambista-api`) corriendo. La interfaz está en español.

## Qué incluye

- Registro, login y cierre de sesión, con rutas protegidas.
- Formulario de cambio con las validaciones del reto: sin campos vacíos, monedas distintas, máximo 2 decimales y 7 dígitos enteros (9.999.999,99).
- Resumen de cada cambio: lo enviado, lo que recibe, la tasa aplicada y la fecha.
- Historial por rango de fechas, **paginado en el servidor** (10 por página), con estados de carga, vacío y error.
- **Admin:** ve un campo extra, "ID de usuario", para consultar el historial de cualquier usuario. Vacío, muestra el suyo. El usuario común no ve el campo.
- El menú del avatar muestra el rol (Administrador o Usuario).
- Diseño responsive: menú lateral en pantallas grandes y barra superior en las chicas.

## Cómo correrlo

Requisitos: Node.js 24, pnpm 11 y la API corriendo (en `kambista-api`: `docker compose up -d` y `pnpm start:dev`).

```bash
pnpm install
cp .env.example .env
pnpm dev            # http://localhost:5173
```

Abrí **http://localhost:5173**. El puerto es fijo a propósito: la API solo acepta pedidos del origen que tenga en `CORS_ORIGIN` (por defecto ese). Si el puerto está ocupado, `pnpm dev` falla en vez de cambiar de puerto, porque con otro puerto todos los pedidos darían error de CORS.

| Variable | Por defecto | Para qué sirve |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000` | URL base de la API |

Vite escribe este valor en el código **al hacer el build**, así que hay que definirlo antes de `pnpm build`.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Revisa tipos y genera `dist/` |
| `pnpm preview` | Sirve el build |
| `pnpm test` | Tests unitarios y de componentes |
| `pnpm lint` / `pnpm format` | Lint y formato |

Los tests cubren lo más importante: la protección de rutas, la sesión, las validaciones, el formulario de cambio, el historial (paginación, vacío, errores y reintento) y la conversión de zona horaria. Corren en la hora de Perú (se configura en `vite.config.ts`).

## Estructura

```
src/
  main.ts            arranca Vue y conecta el cliente HTTP con la sesión
  router/            rutas, protección y títulos de pestaña
  layouts/           AuthLayout (login y registro), AppLayout (menú y barra)
  features/
    auth/            login, registro, sesión, validación
    exchange/        formulario de cambio, validación, formatos de dinero
    history/         tabla del historial, rango de fechas
  shared/
    api/             cliente HTTP y mensajes de error
    components/      input, select, botón, alerta, logo, paginación
  style.css          tema de Tailwind con los colores de la marca
```

Cada feature guarda junto sus pantallas, llamadas a la API y validaciones. Lo que usan varias va en `shared/`.

## Decisiones

- **El cliente HTTP no conoce la sesión.** Se conecta en `main.ts` con dos funciones (obtener el token y qué hacer ante un `401`). Si la API rechaza el token, la app cierra la sesión y avisa que expiró.
- **El monto es un campo de texto**, no `type="number"`: ese tipo acepta `1e5`, cambia según el idioma y no permite validar bien los decimales. La coma decimal se rechaza pidiendo usar punto.
- **Los días se envían como instantes exactos.** Un día del historial se convierte al momento en que empieza y termina en la zona horaria del usuario. Enviar solo la fecha sería ese día en UTC, y un cambio hecho a las 8 pm en Perú caería en el día siguiente.
- **La redirección tras el login solo acepta rutas de la app**, para que un enlace no pueda llevar a otro sitio.
- **Los mensajes de error están en un solo lugar** (`shared/api/error-messages.ts`): la API nombra sus errores y cada uno tiene un texto legible.
- **La paginación la hace el servidor.** La pantalla pide una página a la vez (`page` y `limit`) y lee el total del header `X-Total-Count`. Al cambiar de página se usan los días de la **última búsqueda**, no lo que digan los campos ahora, que el usuario pudo editar sin apretar "Buscar".
- **El campo de admin solo cambia lo que se pide.** La pantalla no decide quién ve qué: lo muestra al admin por comodidad, y quien lo hace cumplir es la API.

## Despliegue

El resultado es un sitio estático (`pnpm build`, carpeta `dist/`). Hacen falta dos cosas:

- Definir `VITE_API_URL` **antes del build**, apuntando a la API desplegada.
- Que el servidor devuelva `index.html` para cualquier ruta (aplicación de una sola página). Si no, recargar en `/historial` da 404.

En la API, `CORS_ORIGIN` debe ser la URL de esta app, **sin barra final**.

## Pendiente

- **"Olvidé mi contraseña":** la API no lo tiene, por eso no hay enlace.
- **Tests end-to-end en el navegador** (por ejemplo con Playwright). La API tiene su propio test E2E.
