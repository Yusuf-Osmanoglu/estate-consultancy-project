# Frontend — Nuxt 3 Application

Estate Consultancy Transaction Management frontend built with Nuxt 3, Pinia, and Tailwind CSS.

## Features

- **Nuxt 3** with composition API setup
- **Pinia** for centralized state management (`transactions` and `agents` stores)
- **Tailwind CSS** for responsive, modern UI styling
- **Lucide Icons**

## Setup

```bash
# Install dependencies
pnpm install
```

## Environment Variables

The frontend connects to the backend API. The base URL can be defined in `.env` (creates one if not exists). Defaults to `http://localhost:3001` locally.

```env
NUXT_PUBLIC_API_BASE=http://localhost:3001
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm run dev
```

## Production Build

```bash
pnpm run build
pnpm run preview
```

## Structure

- `/components`: UI elements (Dashboard, Tables, Modals, Stage Stepper)
- `/pages`: File-based routing (Dashboard, Transactions List, Detail Pages)
- `/stores`: Pinia state management for cross-component data sharing
- `/assets`: Static resources (Tailwind styles)
