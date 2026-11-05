import { paddleCells } from "@/client/services/game/bounceGame";
import type { BounceGameState, Cell, GameField } from "@/types/bounceGame";
import type { NetworkWeights } from "@/types/nn";
import { argmax, predict } from "@/utils/nn/network";
import { POLICY } from "@/weights/policy";

export type AgentAction = "moveL" | "moveR" | "stay";

// output index -> action
const ACTIONS: AgentAction[] = ["moveL", "moveR", "stay"];

// 1 on the given cells, 0 elsewhere; index = row * cols + col
const toGrid = ({ cells, field }: { cells: Cell[]; field: GameField }): number[] => {
  const grid = new Array<number>(field.cols * field.rows).fill(0);
  for (const { x, y } of cells) {
    if (x >= 0 && x < field.cols && y >= 0 && y < field.rows) grid[y * field.cols + x] = 1;
  }
  return grid;
};

// input [1 * n] -> output 3 (moveL, moveR, stay) -> action
const decideAction = ({
  weights,
  input,
}: {
  weights: NetworkWeights;
  input: number[];
}): { action: AgentAction; output: number[] } => {
  const output = predict({ weights, x: [input] })[0] ?? [];
  return { action: ACTIONS[argmax({ values: output })] ?? "stay", output };
};

// [currPad (100) | prevPad (100) | currBall (100) | prevBall (100) | blocks (100) | currObs (100) | prevObs (100)] = 700
export const toInput = ({
  state,
  field,
}: {
  state: BounceGameState;
  field: GameField;
}): number[] => [
  ...toGrid({ cells: paddleCells({ paddle: state.currPad }), field }),
  ...toGrid({ cells: paddleCells({ paddle: state.prevPad }), field }),
  ...toGrid({ cells: [state.currBall], field }),
  ...toGrid({ cells: [state.prevBall], field }),
  ...toGrid({ cells: state.blocks, field }),
  ...toGrid({ cells: [state.currObs], field }),
  ...toGrid({ cells: [state.prevObs], field }),
];

// input 700 -> hidden layers -> output 3 (moveL, moveR, stay)
export const decide = ({
  weights = POLICY,
  state,
  field,
}: {
  weights?: NetworkWeights;
  state: BounceGameState;
  field: GameField;
}): { action: AgentAction; output: number[] } =>
  decideAction({ weights, input: toInput({ state, field }) });
