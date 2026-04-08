import { Matrix, solve } from "ml-matrix";

/** Ridge regression closed form: beta = (X'X + λI)^(-1) X'y */
export function fitRidgeRegression(X: number[][], y: number[], lambda = 0.5): number[] {
  const p = X[0]?.length ?? 0;
  if (!X.length || !p) return [];
  const Xm = new Matrix(X);
  const yv = Matrix.columnVector(y);
  const Xt = Xm.transpose();
  const XtX = Xt.mmul(Xm);
  for (let i = 0; i < p; i++) {
    XtX.set(i, i, XtX.get(i, i) + lambda);
  }
  const Xty = Xt.mmul(yv);
  const beta = solve(XtX, Xty);
  return beta.to1DArray();
}

export function predictLinear(X: number[][], beta: number[]): number[] {
  const p = beta.length;
  return X.map((row) => {
    let s = 0;
    for (let j = 0; j < p; j++) s += (row[j] ?? 0) * (beta[j] ?? 0);
    return s;
  });
}
