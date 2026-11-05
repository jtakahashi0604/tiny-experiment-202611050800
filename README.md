# tiny-experiment-202611050800

Bun + TypeScript + React + Tailwind CSS + shadcn/ui boilerplate.

## Scripts

| command                | description                     |
| ---------------------- | ------------------------------- |
| `bun dev`              | dev server with HMR             |
| `bun run build`        | build static assets to `dist/`  |
| `bun start`            | production server               |
| `bun run lint`         | ESLint                          |
| `bun run lint:fix`     | ESLint with autofix             |
| `bun run format`       | Prettier write                  |
| `bun run format:check` | Prettier check                  |
| `bun run typecheck`    | `tsc --noEmit`                  |
| `bun run check`        | typecheck + lint + format:check |

## Structure

```
src/
  types/<name>.ts             # shared (client / server)
  utils/<name>.ts             # shared (client / server)
  client/
    index.html / frontend.tsx # client entry
    App.tsx
    index.css                 # Tailwind + design tokens
    components/
      ui/                     # shadcn (bunx --bun shadcn@latest add <component>)
      app/<model>/<index|edit|show>.tsx
  server/
    index.ts                  # Bun server (routes / API)
    services/<model>.ts
```

Imports use `@/` → `src/` (e.g. `@/types/...`, `@/client/...`, `@/server/...`).
Client must not import from `@/server/*`; share through `types/` and `utils/`.

## Example

Click **ping** → the server console logs `pong` (`POST /api/ping`).
