/** Minimal CART regression tree (MSE splits). Column 0 is bias / intercept term and is not used for splitting. */

export interface TreeModel {
  root: TreeNode;
  maxDepth: number;
}

export type TreeNode =
  | { leaf: true; value: number }
  | { leaf: false; feature: number; threshold: number; left: TreeNode; right: TreeNode };

function mean(y: number[]) {
  return y.reduce((a, b) => a + b, 0) / Math.max(1, y.length);
}

function mse(y: number[]) {
  if (!y.length) return 0;
  const m = mean(y);
  return y.reduce((s, v) => s + (v - m) ** 2, 0) / y.length;
}

function build(
  X: number[][],
  y: number[],
  depth: number,
  maxDepth: number,
  minLeaf: number,
  rng: () => number
): TreeNode {
  const n = X.length;
  if (n <= minLeaf || depth >= maxDepth) {
    return { leaf: true, value: mean(y) };
  }
  if (mse(y) < 1e-9) {
    return { leaf: true, value: mean(y) };
  }

  const p = X[0]?.length ?? 0;
  let best: { j: number; thr: number; loss: number; leftIdx: number[]; rightIdx: number[] } | null =
    null;

  // Random feature subset for speed (stochastic tree splits — also used inside RF)
  const feats: number[] = [];
  for (let j = 1; j < p; j++) feats.push(j);
  const nFeat = Math.max(1, Math.floor(Math.sqrt(p - 1)));
  shuffleInPlace(feats, rng);
  const featTry = feats.slice(0, nFeat);

  for (const j of featTry) {
    const order = [...Array(n).keys()].sort((a, b) => X[a]![j]! - X[b]![j]!);
    for (let t = minLeaf; t <= n - minLeaf; t++) {
      const idx = order[t]!;
      const thr = X[idx]![j]!;
      const leftIdx: number[] = [];
      const rightIdx: number[] = [];
      const yL: number[] = [];
      const yR: number[] = [];
      for (let i = 0; i < n; i++) {
        if (X[i]![j]! <= thr) {
          leftIdx.push(i);
          yL.push(y[i]!);
        } else {
          rightIdx.push(i);
          yR.push(y[i]!);
        }
      }
      if (yL.length < minLeaf || yR.length < minLeaf) continue;
      const loss = (yL.length / n) * mse(yL) + (yR.length / n) * mse(yR);
      if (!best || loss < best.loss) {
        best = { j, thr, loss, leftIdx, rightIdx };
      }
    }
  }

  if (!best) {
    return { leaf: true, value: mean(y) };
  }

  const XL = best.leftIdx.map((i) => X[i]!);
  const yL = best.leftIdx.map((i) => y[i]!);
  const XR = best.rightIdx.map((i) => X[i]!);
  const yR = best.rightIdx.map((i) => y[i]!);

  return {
    leaf: false,
    feature: best.j,
    threshold: best.thr,
    left: build(XL, yL, depth + 1, maxDepth, minLeaf, rng),
    right: build(XR, yR, depth + 1, maxDepth, minLeaf, rng),
  };
}

function predictOne(node: TreeNode, x: number[]): number {
  if (node.leaf) return node.value;
  if (x[node.feature]! <= node.threshold) return predictOne(node.left, x);
  return predictOne(node.right, x);
}

export function fitDecisionTree(
  X: number[][],
  y: number[],
  opts: { maxDepth?: number; minLeaf?: number; seed?: number } = {}
): TreeModel {
  const maxDepth = opts.maxDepth ?? 8;
  const minLeaf = opts.minLeaf ?? 35;
  let s = opts.seed ?? 42;
  const rng = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  const root = build(X, y, 0, maxDepth, minLeaf, rng);
  return { root, maxDepth };
}

export function predictTree(model: TreeModel, X: number[][]): number[] {
  return X.map((row) => predictOne(model.root, row));
}

function shuffleInPlace(a: number[], rng: () => number) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
}
