export interface RegressionMetrics {
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
  /** Only meaningful for linear regression with intercept; else omitted */
  adjustedR2?: number;
}

export function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function evaluateRegression(yTrue: number[], yPred: number[], numFeatures?: number): RegressionMetrics {
  const n = yTrue.length;
  if (n === 0 || yPred.length !== n) {
    return { mae: 0, mse: 0, rmse: 0, r2: 0 };
  }
  let mae = 0,
    mse = 0;
  const yBar = mean(yTrue);
  let ssTot = 0,
    ssRes = 0;
  for (let i = 0; i < n; i++) {
    const e = yTrue[i]! - yPred[i]!;
    mae += Math.abs(e);
    mse += e * e;
    ssTot += (yTrue[i]! - yBar) ** 2;
    ssRes += e * e;
  }
  mae /= n;
  mse /= n;
  const rmse = Math.sqrt(mse);
  const r2 = ssTot > 1e-12 ? 1 - ssRes / ssTot : 0;
  let adjustedR2: number | undefined;
  if (numFeatures != null && n > numFeatures + 1) {
    adjustedR2 = 1 - (1 - r2) * ((n - 1) / (n - numFeatures - 1));
  }
  return { mae, mse, rmse, r2, adjustedR2 };
}
