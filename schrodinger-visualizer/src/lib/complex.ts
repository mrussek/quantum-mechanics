/**
 * Minimal complex number utilities operating on parallel real/imaginary Float64Arrays.
 * This avoids object allocation overhead that would kill performance in the tight
 * simulation loop.
 */

/** Pair of arrays representing complex vector: (real[], imag[]) */
export type ComplexArray = { re: Float64Array; im: Float64Array };

export function createComplexArray(n: number): ComplexArray {
  return { re: new Float64Array(n), im: new Float64Array(n) };
}

export function copyComplexArray(src: ComplexArray): ComplexArray {
  return { re: new Float64Array(src.re), im: new Float64Array(src.im) };
}

/**
 * In-place element-wise multiplication: a[i] *= b[i]
 */
export function multiplyInPlace(a: ComplexArray, b: ComplexArray): void {
  const n = a.re.length;
  for (let i = 0; i < n; i++) {
    const ar = a.re[i],
      ai = a.im[i];
    const br = b.re[i],
      bi = b.im[i];
    a.re[i] = ar * br - ai * bi;
    a.im[i] = ar * bi + ai * br;
  }
}

/**
 * Probability density |ψ|² for each grid point.
 */
export function probabilityDensity(psi: ComplexArray): Float64Array {
  const n = psi.re.length;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = psi.re[i] * psi.re[i] + psi.im[i] * psi.im[i];
  }
  return out;
}

/**
 * Norm² = Σ|ψ|² dx  (not multiplied by dx here – caller handles that).
 */
export function normSquared(psi: ComplexArray): number {
  let s = 0;
  const n = psi.re.length;
  for (let i = 0; i < n; i++) {
    s += psi.re[i] * psi.re[i] + psi.im[i] * psi.im[i];
  }
  return s;
}

/**
 * Normalize ψ so that Σ|ψ|² dx = 1.
 */
export function normalize(psi: ComplexArray, dx: number): void {
  const ns = normSquared(psi) * dx;
  if (ns === 0) return;
  const factor = 1 / Math.sqrt(ns);
  const n = psi.re.length;
  for (let i = 0; i < n; i++) {
    psi.re[i] *= factor;
    psi.im[i] *= factor;
  }
}
