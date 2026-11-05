// breakout: 3 rows of blocks, refilled when all are broken (score = blocks broken)

export type GameStatus = "ready" | "playing" | "over";

// all positions are cell indices on the grid (col / row, row 0 = top)
export type Cell = {
  x: number;
  y: number;
};

export type Ball = Cell & {
  vx: -1 | 1;
  vy: -1 | 1;
};

export type Paddle = {
  x: number; // cell of edgeL
  y: number; // row
  width: number; // cells
};

// moves randomly along one row, touching it is game over
export type Obstacle = Cell & {
  vx: -1 | 1;
};

export type BounceGameState = {
  status: GameStatus;
  currBall: Ball;
  prevBall: Ball; // ball one tick before (same as currBall at the start)
  currPad: Paddle;
  prevPad: Paddle; // paddle one tick before (same as currPad at the start)
  interval: number; // seconds per tick
  score: number;
  blocks: Cell[]; // remaining blocks
  currObs: Obstacle;
  prevObs: Obstacle; // obstacle one tick before (same as currObs at the start)
};

export type GameField = {
  cols: number;
  rows: number;
};
