import { fitDecisionTree, predictTree, type TreeModel } from "./tree";

export interface ForestModel {
  trees: TreeModel[];
}

export function fitRandomForest(
  X: number[][],
  y: number[],
  opts: { trees?: number; sampleRatio?: number; seed?: number } = {}
): ForestModel {
  const nTrees = opts.trees ?? 24;
  const sampleRatio = opts.sampleRatio ?? 0.72;
  let seed = opts.seed ?? 7;
  const rng = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  const n = X.length;
  const trees: TreeModel[] = [];
  for (let t = 0; t < nTrees; t++) {
    const idx: number[] = [];
    const m = Math.max(50, Math.floor(n * sampleRatio));
    for (let i = 0; i < m; i++) idx.push(Math.floor(rng() * n));
    const Xs = idx.map((i) => X[i]!);
    const ys = idx.map((i) => y[i]!);
    trees.push(
      fitDecisionTree(Xs, ys, {
        maxDepth: 9,
        minLeaf: 28,
        seed: seed + t * 9973,
      })
    );
  }
  return { trees };
}

export function predictForest(model: ForestModel, X: number[][]): number[] {
  const k = model.trees.length;
  const preds = new Array(X.length).fill(0);
  for (const tr of model.trees) {
    const p = predictTree(tr, X);
    for (let i = 0; i < X.length; i++) preds[i] += p[i]!;
  }
  return preds.map((v) => v / k);
}
