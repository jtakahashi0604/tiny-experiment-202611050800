import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/client/components/ui/button";
import { decide } from "@/client/services/agent/bounceGameAgent";
import { createGame, paddleCells, shiftPaddle, stepGame } from "@/client/services/game/bounceGame";
import type { BounceGameState, Cell, GameField, GameStatus } from "@/types/bounceGame";

const FIELD: GameField = { cols: 10, rows: 10 };

// prettier-ignore
const CELL   = 36; // px
// prettier-ignore
const SQUARE = 24; // px, side of a grid square
// prettier-ignore
const RADIUS =  4; // px, corner radius of a grid square
// prettier-ignore
const HOLE   = 10; // px, side of the hole in the obstacle

const readColor = ({ name }: { name: string }) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// rounded square centered in the cell
const square = ({
  ctx,
  col,
  row,
  size = SQUARE,
}: {
  ctx: CanvasRenderingContext2D;
  col: number;
  row: number;
  size?: number;
}) => {
  const offset = (CELL - size) / 2;
  ctx.beginPath();
  ctx.roundRect(col * CELL + offset, row * CELL + offset, size, size, RADIUS);
};

// grid: empty = outlined, lit (ball / paddle / blocks) = filled,
// marked (obstacle) = filled with a hole
const draw = ({
  ctx,
  field,
  lit,
  marked,
}: {
  ctx: CanvasRenderingContext2D;
  field: GameField;
  lit: Cell[];
  marked: Cell[];
}) => {
  // prettier-ignore
  const background = readColor({ name: "--background" });
  // prettier-ignore
  const foreground = readColor({ name: "--foreground" });

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, field.cols * CELL, field.rows * CELL);

  const isLit = new Set(lit.map(({ x, y }) => y * field.cols + x));
  ctx.fillStyle = foreground;
  ctx.strokeStyle = foreground;
  ctx.lineWidth = 2;
  for (let row = 0; row < field.rows; row++) {
    for (let col = 0; col < field.cols; col++) {
      square({ ctx, col, row });
      if (isLit.has(row * field.cols + col)) ctx.fill();
      else ctx.stroke();
    }
  }

  for (const { x, y } of marked) {
    ctx.fillStyle = foreground;
    square({ ctx, col: x, row: y });
    ctx.fill();
    ctx.fillStyle = background;
    square({ ctx, col: x, row: y, size: HOLE });
    ctx.fill();
  }
};

export const BounceGameIndex = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<BounceGameState>(createGame({ field: FIELD }));

  const [status, setStatus] = useState<GameStatus>("ready");
  const [score, setScore] = useState(0);

  const start = () => {
    stateRef.current = { ...createGame({ field: FIELD }), status: "playing" };
    setStatus("playing");
    setScore(0);
  };

  // game loop
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let last = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      elapsed += (now - last) / 1000;
      last = now;

      let state = stateRef.current;

      // one grid tick: AI presses L / R (or nothing) once, then the ball moves one cell
      if (state.status !== "playing") {
        elapsed = 0;
      } else if (elapsed >= state.interval) {
        elapsed = 0;
        const { action } = decide({ state, field: FIELD });
        // prettier-ignore
        const dx = action === "moveL" ? -1 : action === "moveR" ? 1 : 0;
        state = stepGame({ state, field: FIELD, dx });
      }

      stateRef.current = state;

      setStatus(state.status);
      setScore(state.score);
      draw({
        ctx,
        field: FIELD,
        lit: [...paddleCells({ paddle: state.currPad }), state.currBall, ...state.blocks],
        marked: [state.currObs],
      });

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // L / R buttons (1 click = 1 step)
  const move = ({ direction }: { direction: -1 | 1 }) => {
    stateRef.current = shiftPaddle({ state: stateRef.current, field: FIELD, dx: direction });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="w-full max-w-90 text-right font-bold tabular-nums">score {score}</p>

      <canvas
        ref={canvasRef}
        width={FIELD.cols * CELL}
        height={FIELD.rows * CELL}
        className="block aspect-square w-full max-w-90 rounded-lg border-2"
      />

      <Button size="lg" className="w-full max-w-90" disabled={status === "playing"} onClick={start}>
        <Play />
        start
      </Button>

      <div className="flex w-full max-w-90 gap-4">
        <Button
          size="lg"
          variant="outline"
          aria-label="moveL"
          className="flex-1 touch-manipulation select-none"
          onClick={() => move({ direction: -1 })}
        >
          L
        </Button>
        <Button
          size="lg"
          variant="outline"
          aria-label="moveR"
          className="flex-1 touch-manipulation select-none"
          onClick={() => move({ direction: 1 })}
        >
          R
        </Button>
      </div>
    </div>
  );
};
