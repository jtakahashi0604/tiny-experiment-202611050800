import type { Tensor2D } from "@/types/nn";

export const Tensor = {
  rand: ({ ySize, xSize, value = 1 }: { ySize: number; xSize: number; value?: number }): Tensor2D =>
    Array.from({ length: ySize }, () =>
      Array.from({ length: xSize }, () => Math.random() * (value * 2) - value),
    ),

  fill: ({ ySize, xSize, value = 0 }: { ySize: number; xSize: number; value?: number }): Tensor2D =>
    Array.from({ length: ySize }, () => new Array<number>(xSize).fill(value)),

  dot: ({ a, b }: { a: Tensor2D; b: Tensor2D }): Tensor2D => {
    // prettier-ignore
    const rows  = a.length;
    // prettier-ignore
    const inner = b.length;
    // prettier-ignore
    const cols  = b[0]?.length ?? 0;

    const result = Tensor.fill({ ySize: rows, xSize: cols });
    for (let i = 0; i < rows; i++) {
      for (let k = 0; k < inner; k++) {
        for (let j = 0; j < cols; j++) {
          result[i]![j]! += a[i]![k]! * b[k]![j]!;
        }
      }
    }
    return result;
  },

  add: ({ a, b }: { a: Tensor2D; b: Tensor2D }): Tensor2D =>
    a.map((row, i) => row.map((v, j) => v + b[i]![j]!)),

  map: ({ a, fn }: { a: Tensor2D; fn: (v: number) => number }): Tensor2D =>
    a.map((row) => row.map(fn)),
};
