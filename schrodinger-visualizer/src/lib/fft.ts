/**
 * Radix-2 Cooley–Tukey FFT operating on parallel Float64Arrays.
 * N must be a power of 2.
 */

import { ComplexArray } from "./complex";

function bitReverse(x: number, bits: number): number {
  let result = 0;
  for (let i = 0; i < bits; i++) {
    result = (result << 1) | (x & 1);
    x >>= 1;
  }
  return result;
}

/**
 * In-place FFT (direction = 1) or inverse FFT (direction = -1).
 * For IFFT the output is divided by N.
 */
export function fft(data: ComplexArray, direction: 1 | -1): void {
  const n = data.re.length;
  const bits = Math.round(Math.log2(n));

  // Bit-reversal permutation
  for (let i = 0; i < n; i++) {
    const j = bitReverse(i, bits);
    if (j > i) {
      // swap re
      let tmp = data.re[i];
      data.re[i] = data.re[j];
      data.re[j] = tmp;
      // swap im
      tmp = data.im[i];
      data.im[i] = data.im[j];
      data.im[j] = tmp;
    }
  }

  // Butterfly stages
  for (let size = 2; size <= n; size *= 2) {
    const halfSize = size / 2;
    const angle = (direction * 2 * Math.PI) / size;
    const wRe = Math.cos(angle);
    const wIm = Math.sin(angle);

    for (let i = 0; i < n; i += size) {
      let curRe = 1,
        curIm = 0;
      for (let j = 0; j < halfSize; j++) {
        const a = i + j;
        const b = a + halfSize;

        const tRe = curRe * data.re[b] - curIm * data.im[b];
        const tIm = curRe * data.im[b] + curIm * data.re[b];

        data.re[b] = data.re[a] - tRe;
        data.im[b] = data.im[a] - tIm;
        data.re[a] += tRe;
        data.im[a] += tIm;

        const nextRe = curRe * wRe - curIm * wIm;
        const nextIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
        curIm = nextIm;
      }
    }
  }

  // Normalize for inverse FFT
  if (direction === -1) {
    for (let i = 0; i < n; i++) {
      data.re[i] /= n;
      data.im[i] /= n;
    }
  }
}
