// [rows][cols]
export type Tensor2D = number[][];

export type Activation = {
  fw: ({ z }: { z: Tensor2D }) => Tensor2D;
};

export type LayerWeights = {
  w: Tensor2D; // [xSize * ySize]
  b: Tensor2D; // [1     * ySize]
};

export type NetworkWeights = {
  layers: LayerWeights[];
};
