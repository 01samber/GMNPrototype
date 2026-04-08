/** Pearson correlation for paired numeric arrays (aligned indices). */
export function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;
  let sumA = 0,
    sumB = 0;
  for (let i = 0; i < n; i++) {
    sumA += a[i]!;
    sumB += b[i]!;
  }
  const meanA = sumA / n,
    meanB = sumB / n;
  let num = 0,
    denA = 0,
    denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i]! - meanA;
    const db = b[i]! - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB);
  return den > 1e-12 ? num / den : 0;
}

export function correlationMatrix(
  cols: { key: string; values: number[] }[]
): { keys: string[]; matrix: number[][] } {
  const keys = cols.map((c) => c.key);
  const n = cols.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const v =
        i === j ? 1 : pearson(cols[i]!.values, cols[j]!.values);
      matrix[i]![j] = v;
      matrix[j]![i] = v;
    }
  }
  return { keys, matrix };
}
