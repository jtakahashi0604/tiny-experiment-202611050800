import type { Ball, BounceGameState, Cell, GameField, Obstacle, Paddle } from "@/types/bounceGame";

// prettier-ignore
const PADDLE_WIDTH   = 3;
// prettier-ignore
const START_INTERVAL = 0.25; // s / tick
// prettier-ignore
const MIN_INTERVAL   = 0.08; // s / tick
// prettier-ignore
const SPEED_UP       = 0.95; // interval multiplier per paddle hit

const clamp = ({ value, min, max }: { value: number; min: number; max: number }) =>
  Math.min(Math.max(value, min), max);

const randomSign = (): -1 | 1 => (Math.random() < 0.5 ? -1 : 1);

const createPaddle = ({ field }: { field: GameField }): Paddle => ({
  x: Math.floor((field.cols - PADDLE_WIDTH) / 2),
  y: field.rows - 1,
  width: PADDLE_WIDTH,
});

export const paddleCells = ({ paddle }: { paddle: Paddle }): Cell[] =>
  Array.from({ length: paddle.width }, (_, i) => ({ x: paddle.x + i, y: paddle.y }));

export const movePaddle = ({
  state,
  field,
  x,
}: {
  state: BounceGameState;
  field: GameField;
  x: number;
}): BounceGameState => ({
  ...state,
  currPad: {
    ...state.currPad,
    x: clamp({ value: x, min: 0, max: field.cols - state.currPad.width }),
  },
});

// dx in cells
export const shiftPaddle = ({
  state,
  field,
  dx,
}: {
  state: BounceGameState;
  field: GameField;
  dx: number;
}): BounceGameState => movePaddle({ state, field, x: state.currPad.x + dx });

const bounceWalls = ({ ball, field }: { ball: Ball; field: GameField }): Ball => ({
  ...ball,
  vx: ball.x + ball.vx < 0 || ball.x + ball.vx > field.cols - 1 ? (-ball.vx as -1 | 1) : ball.vx,
  vy: ball.y + ball.vy < 0 ? 1 : ball.vy,
});

// paddle: the ball is about to enter the paddle row on a paddle cell
const bouncePaddle = ({
  ball,
  paddle,
  field,
  interval,
}: {
  ball: Ball;
  paddle: Paddle;
  field: GameField;
  interval: number;
}): { ball: Ball; interval: number; hit: boolean } => {
  const offset = ball.x + ball.vx - paddle.x; // 0 .. width - 1 when on the paddle
  if (!(ball.vy > 0 && ball.y + ball.vy === paddle.y && offset >= 0 && offset < paddle.width)) {
    return { ball, interval, hit: false };
  }
  // edgeL -> vx = -1, edgeR -> vx = +1, middle -> keep
  // prettier-ignore
  const vx = offset === 0 ? -1 : offset === paddle.width - 1 ? 1 : ball.vx;
  return {
    ball: bounceWalls({ ball: { ...ball, vx, vy: -1 }, field }),
    interval: Math.max(interval * SPEED_UP, MIN_INTERVAL),
    hit: true,
  };
};

const moveBall = ({ ball }: { ball: Ball }): Ball => ({
  ...ball,
  x: ball.x + ball.vx,
  y: ball.y + ball.vy,
});

const isMiss = ({ ball, field }: { ball: Ball; field: GameField }): boolean =>
  ball.y > field.rows - 1;

// prettier-ignore
const BLOCK_ROWS = 3; // rows of blocks on the top (row 0 ..)
// prettier-ignore
const OBSTACLE_ROW = 5; // row 6 (0-based 5)

// full set of blocks, except the cell the ball is on
const createBlocks = ({ field, ball }: { field: GameField; ball?: Cell }): Cell[] =>
  Array.from({ length: BLOCK_ROWS * field.cols }, (_, i) => ({
    x: i % field.cols,
    y: Math.floor(i / field.cols),
  })).filter((b) => !(ball && b.x === ball.x && b.y === ball.y));

// the ball starts just above the paddle center, going up
export const createGame = ({ field }: { field: GameField }): BounceGameState => {
  const pad = createPaddle({ field });
  const ball: Ball = {
    x: pad.x + Math.floor(pad.width / 2),
    y: pad.y - 1,
    vx: randomSign(),
    vy: -1,
  };
  const obs: Obstacle = {
    x: Math.floor(Math.random() * field.cols),
    y: OBSTACLE_ROW,
    vx: randomSign(),
  };
  return {
    status: "ready",
    currBall: ball,
    prevBall: ball,
    currPad: pad,
    prevPad: pad,
    interval: START_INTERVAL,
    score: 0,
    blocks: createBlocks({ field }),
    currObs: obs,
    prevObs: obs,
  };
};

// advance one tick: the paddle moves dx cells (the agent's action), then the ball moves one cell diagonally
export const stepGame = ({
  state: prevState,
  field,
  dx = 0,
}: {
  state: BounceGameState;
  field: GameField;
  dx?: number;
}): BounceGameState => {
  if (prevState.status !== "playing") return prevState;

  const state = shiftPaddle({ state: prevState, field, dx });
  const walled = bounceWalls({ ball: state.currBall, field });
  const { ball: afterBlock, blocks } = hitBlock({
    ball: walled,
    blocks: state.blocks,
    field,
  });
  const { ball: bounced, interval } = bouncePaddle({
    ball: afterBlock,
    paddle: state.currPad,
    field,
    interval: state.interval,
  });
  // still facing a block (boxed in) -> stay this tick
  const blocked = blocks.some(
    (b) => b.x === bounced.x + bounced.vx && b.y === bounced.y + bounced.vy,
  );
  const ball = blocked ? bounced : moveBall({ ball: bounced });

  const score = state.score + (state.blocks.length - blocks.length);

  // all blocks broken -> a new set of blocks
  const nextBlocks = blocks.length === 0 ? createBlocks({ field, ball }) : blocks;

  const obs = moveObstacle({ obstacle: state.currObs, field });

  // touching the obstacle (before or after it moves) / missing the ball -> game over
  const touched = isOn({ ball, cell: state.currObs }) || isOn({ ball, cell: obs });
  const status = touched || isMiss({ ball, field }) ? "over" : "playing";

  return {
    ...state,
    currBall: ball,
    prevBall: state.currBall,
    prevPad: prevState.currPad,
    interval,
    blocks: nextBlocks,
    currObs: obs,
    prevObs: state.currObs,
    score,
    status,
  };
};

// blocks: bounce off the cells the ball is about to run into (and break them)
//   above / below (x, y + vy)  -> flip vy
//   side          (x + vx, y)  -> flip vx
//   corner        (x + vx, y + vy), only when both above are free -> flip vy
// repeated (max 3) because the new direction can face another block
const hitBlock = ({
  ball,
  blocks,
  field,
}: {
  ball: Ball;
  blocks: Cell[];
  field: GameField;
}): { ball: Ball; blocks: Cell[] } => {
  const at = ({ x, y }: Cell) => blocks.find((b) => b.x === x && b.y === y);

  for (let i = 0; i < 3; i++) {
    const vertical = at({ x: ball.x, y: ball.y + ball.vy });
    const side = at({ x: ball.x + ball.vx, y: ball.y });
    const corner = vertical || side ? undefined : at({ x: ball.x + ball.vx, y: ball.y + ball.vy });
    const hits = [vertical, side, corner].filter((b) => b !== undefined);
    if (hits.length === 0) break;

    blocks = blocks.filter((b) => !hits.includes(b));
    ball = bounceWalls({
      ball: {
        ...ball,
        vx: side ? (-ball.vx as -1 | 1) : ball.vx,
        vy: vertical || corner ? (-ball.vy as -1 | 1) : ball.vy,
      },
      field,
    });
  }

  return { ball, blocks };
};

const isOn = ({ ball, cell }: { ball: Cell; cell: Cell }): boolean =>
  ball.x === cell.x && ball.y === cell.y;

// obstacle: moveL / moveR 1 cell at random per tick, turn back at the walls
const moveObstacle = ({ obstacle, field }: { obstacle: Obstacle; field: GameField }): Obstacle => {
  const last = field.cols - 1;
  const moved = obstacle.x + randomSign();
  // prettier-ignore
  const { x, vx }: { x: number; vx: -1 | 1 } =
    moved > last ? { x: last - 1, vx: -1 } :
    moved < 0    ? { x: 1,        vx:  1 } :
                   { x: moved,    vx: moved > obstacle.x ? 1 : -1 };
  return { ...obstacle, x, vx };
};
