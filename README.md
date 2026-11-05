# tiny experiment of Weight-Space Programming

<video src="demo.mp4" width="480" autoplay loop muted playsinline controls>
  <a href="demo.mp4">demo.mp4</a>
</video>

A tiny block-breaking game on a 10 × 10 grid, played by a hand-designed neural network (no training).

## Run

```sh
bun install
bun dev
```

## Game

Break 3 rows of blocks (refilled when cleared) with a ball moving 1 cell diagonally per tick; the paddle edge sets its direction, and missing it or touching the obstacle walking randomly on row 5 ends the game.

## Agent

Each tick the agent reads the state as 7 one-hot grids of 10 × 10 and picks `moveL` / `moveR` / `stay`:

```
[currPad | prevPad | currBall | prevBall | blocks | currObs | prevObs] = 700 -> hidden (sigmoid) -> 3 (moveL, moveR, stay)
```

The weights (`src/weights/policy.ts`, 700 -> 48 -> 7 -> 6 -> 3) are written by hand in closed form; the derivation is in the comment at the top of the file.

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
  types/<name>.ts
  utils/<name>.ts
  utils/nn/*.ts
  weights/policy.ts
  client/
    index.html / frontend.tsx
    App.tsx
    index.css
    services/game/bounceGame.ts
    services/agent/bounceGameAgent.ts
    components/
      ui/
      app/<model>/<index|edit|show>.tsx
  server/
    index.ts
    services/<model>.ts
```
