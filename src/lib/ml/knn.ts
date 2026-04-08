/** k-NN regression on standardized feature space (first column may be bias — skip dist on bias). */

export function knnPredict(
  XTrain: number[][],
  yTrain: number[],
  XTest: number[][],
  k: number
): number[] {
  const useBias = XTrain[0]?.[0] === 1 && XTest[0]?.[0] === 1;
  const start = useBias ? 1 : 0;

  const dist2 = (a: number[], b: number[]) => {
    let s = 0;
    for (let j = start; j < a.length; j++) {
      const d = a[j]! - b[j]!;
      s += d * d;
    }
    return s;
  };

  return XTest.map((xt) => {
    const scored = XTrain.map((xr, i) => ({ i, d: dist2(xr, xt) }));
    scored.sort((a, b) => a.d - b.d);
    const kk = Math.min(k, scored.length);
    let s = 0;
    for (let i = 0; i < kk; i++) s += yTrain[scored[i]!.i]!;
    return s / kk;
  });
}
