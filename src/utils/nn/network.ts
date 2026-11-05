import type { Activation, LayerWeights, NetworkWeights, Tensor2D } from "@/types/nn";
import { Activations } from "@/utils/nn/activation";
import { Tensor } from "@/utils/nn/tensor";

export const forwardLayer = ({
  layer,
  activation,
  x,
}: {
  layer: LayerWeights;
  activation: Activation;
  x: Tensor2D;
}): Tensor2D => {
  const z = Tensor.add({ a: Tensor.dot({ a: x, b: layer.w }), b: layer.b });
  return activation.fw({ z });
};

// x -> (linear + activation) * layers -> y
export const predict = ({
  weights,
  x,
  activation = Activations.sigmoid,
}: {
  weights: NetworkWeights;
  x: Tensor2D;
  activation?: Activation;
}): Tensor2D =>
  weights.layers.reduce((curr, layer) => forwardLayer({ layer, activation, x: curr }), x);

export const argmax = ({ values }: { values: number[] }): number =>
  values.reduce((best, v, i) => (v > values[best]! ? i : best), 0);
