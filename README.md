# Kambista FX Web

The web app of a currency exchange system, built with **Vue 3**, **TypeScript**, **Vite** and **Tailwind CSS**. Users register, log in, exchange dollars and soles with the latest SUNAT exchange rate and review their history.

It talks to the **`kambista-api`** repository, which must be running. The interface is in Spanish.

## Features

- Register, log in and log out, with route guards: the app screens need a session.
- Exchange form with the validations of the challenge: no empty fields, different currencies, at most 2 decimals and at most 7 integer digits (9,999,999.99).
- Summary of each exchange: what was sent, what the user receives, the rate that was applied and the date.
- History by date range, in a table with pagination (10 per page, one page asked to the server at a time) and loading, empty and error states.
- **Admin:** an admin sees an extra field, "ID de usuario", to look at the history of any user. Left empty, it shows their own. A regular user never sees the field, and the API ignores a `userId` that does not come from an admin.
- Responsive layout: side menu on wide screens, top bar on small ones.

## Prerequisites

- Node.js 24 and pnpm 11 (the versions it was developed with)
- The API running. In the `kambista-api` repository: `docker compose up -d` and `pnpm start:dev`.

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm dev            # http://localhost:5173
```

Open **http://localhost:5173**. The port is fixed on purpose: the API only accepts requests from the origin in its `CORS_ORIGIN` variable (`http://localhost:5173` by default). If the port is busy, `pnpm dev` fails instead of moving to another port, which would make every request fail with a CORS error.

### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000` | Base URL of the API |

Vite writes this value into the code **when the app is built**, so it has to be set before `pnpm build`, not when the app runs.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Type check and production build in `dist/` |
| `pnpm preview` | Serves the build |
| `pnpm test` | Unit and component tests |
| `pnpm lint` / `pnpm format` | Lint and format |

## Running the tests

```bash
pnpm test
```

They cover what matters most: the route guard and the safe redirect after login, the session store (log in, log out, restore after a reload), the validation rules of the forms, the exchange form and the history table (pagination, empty state, errors and retry), and the time zone conversion of the date range. They run in the time zone of Peru, set in `vite.config.ts`.

## Project structure

```
src/
  main.ts            starts Vue and connects the HTTP client to the session
  router/            routes, route guard and browser tab titles
  layouts/           AuthLayout (login and register), AppLayout (menu and top bar)
  features/
    auth/            login, register, session store, validation
    exchange/        exchange form, validation, money formats
    history/         history table, date range
  shared/
    api/             HTTP client and error messages
    components/      input, select, button, alert, logo, pagination
  style.css          Tailwind theme with the brand colors
```

Each feature keeps its views, API calls and validation together. What several features use lives in `shared/`.

## Decisions

- **The HTTP client does not know about the session.** It is connected in `main.ts` with two functions (get the token, and what to do on a `401`), so `shared/` does not depend on any feature. When the API rejects a token, the app logs out and goes to the login saying the session expired.
- **The amount is a text field**, not `type="number"`. Number inputs accept `1e5`, behave differently by language and do not allow a proper check of the decimals. A decimal comma is rejected with a message asking for a point.
- **Days are sent as exact instants.** A day chosen in the history is converted to the moment it starts and ends in the user's time zone. Sending only a date would mean that day in UTC, and an exchange made at 8 pm in Peru would fall in the next day.
- **The redirect after login only accepts paths inside the app**, so a link cannot send the user to another site.
- **Messages for the user are translated in one place** (`shared/api/error-messages.ts`): the API names its domain errors and each one has a readable message.
- **Pagination is done by the server.** The screen asks for one page at a time (`page` and `limit`) and reads the total of the whole range from the `X-Total-Count` header, so it works with a very long history. Moving between pages uses the days of the **last search**, not what the date inputs say now, which the user may have edited without pressing "Buscar".
- **The admin field only changes what is asked.** The screen does not decide who can see what: it shows the field to an admin as a convenience, and the API is the one that enforces it.

## Deploying

The build is a static site (`pnpm build`, folder `dist/`). Two things are needed:

- Set `VITE_API_URL` **before building**, pointing to the deployed API.
- The web server must answer `index.html` for any address (single page app). Otherwise, reloading on `/historial` returns a 404.

In the API, `CORS_ORIGIN` must be the URL of this app, **without a trailing slash**.

## Not implemented yet

- **"Forgot my password":** it does not exist in the API, so there is no link to it.
- **Browser end-to-end tests** (for example with Playwright). The API has its own end-to-end test.
