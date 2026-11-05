import type { Activation } from "@/types/nn";
import { Tensor } from "@/utils/nn/tensor";

export const Activations = {
  sigmoid: {
    fw: ({ z }) => Tensor.map({ a: z, fn: (v) => 1 / (1 + Math.exp(-v)) }),
  },
} satisfies Record<string, Activation>;
