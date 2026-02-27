/**
 * Split-operator Fourier method for the 1D time-dependent Schrödinger equation.
 *
 * The propagator is factored as:
 *   e^{-iHΔt/ℏ} ≈ e^{-iV Δt/2ℏ} · e^{-iT Δt/ℏ} · e^{-iV Δt/2ℏ}
 *
 * where T = p²/2m is applied in momentum space (via FFT) and V is applied in
 * position space. This is second-order accurate in Δt and unconditionally
 * stable (unitary).
 *
 * We work in natural units where ℏ = m = 1.
 */

import {
  ComplexArray,
  createComplexArray,
  copyComplexArray,
  multiplyInPlace,
  normalize,
  probabilityDensity,
} from "./complex";
import { fft } from "./fft";
import { buildPotential, buildBoundaryMask, PotentialType, defaultWavePacketParams } from "./potentials";

// ── Wave packet types ───────────────────────────────────────────────

export type WavePacketType =
  | "gaussian"
  | "planeWave"
  | "positionDelta"
  | "momentumDelta";

export interface WavePacketInfo {
  type: WavePacketType;
  label: string;
  description: string;
}

export const WAVE_PACKET_CATALOG: WavePacketInfo[] = [
  {
    type: "gaussian",
    label: "Gaussian",
    description: "Standard Gaussian wave packet with tunable position, momentum, and width",
  },
  {
    type: "planeWave",
    label: "Plane Wave",
    description: "Uniform amplitude with definite momentum e^{ikx} (windowed to fit the grid)",
  },
  {
    type: "positionDelta",
    label: "\u03B4(x) Position",
    description: "Narrow spike in position space \u2014 maximally uncertain momentum",
  },
  {
    type: "momentumDelta",
    label: "\u03B4(k) Momentum",
    description: "Narrow spike in momentum space \u2014 nearly uniform in position, definite k",
  },
];

export interface WavePacketConfig {
  type: WavePacketType;
  /** Mean position */
  x0: number;
  /** Mean wave number (momentum / \u0127) */
  k0: number;
  /** Width (std dev) of the Gaussian envelope */
  sigma: number;
}

// ── Simulation parameters ───────────────────────────────────────────

export interface SimulationConfig {
  /** Number of grid points (must be power of 2) */
  N: number;
  /** Spatial domain half-width: x ∈ [-L, L] */
  L: number;
  /** Time step */
  dt: number;
  /** Sub-steps per animation frame (increase for faster evolution) */
  stepsPerFrame: number;
  /** Selected potential */
  potential: PotentialType;
  /** Wave packet initial state */
  wavePacket: WavePacketConfig;
}

export const DEFAULT_CONFIG: SimulationConfig = {
  N: 1024,
  L: 15,
  dt: 0.01,
  stepsPerFrame: 4,
  potential: "barrier",
  wavePacket: {
    type: "gaussian",
    ...defaultWavePacketParams("barrier", 15),
  },
};

// ── Simulator state ─────────────────────────────────────────────────

export interface SimulatorState {
  /** Spatial grid */
  x: Float64Array;
  /** Momentum grid */
  k: Float64Array;
  /** Grid spacing */
  dx: number;
  /** Wavefunction */
  psi: ComplexArray;
  /** Potential array */
  V: Float64Array;
  /** Half-step potential propagator: e^{-iV dt/2} */
  expV_half: ComplexArray;
  /** Full-step kinetic propagator: e^{-iT dt} */
  expT: ComplexArray;
  /** Hard boundary mask: psi is zeroed where mask[i] === 0 (for infinite walls) */
  boundaryMask: Float64Array | null;
  /** Current time */
  time: number;
  /** Config snapshot */
  config: SimulationConfig;
}

// ── Wave packet constructors ────────────────────────────────────────

/**
 * Gaussian wave packet:
 *   ψ(x) ∝ exp(-(x-x0)² / 4σ²) exp(i k0 x)
 */
function gaussianWavePacket(
  x: Float64Array,
  x0: number,
  k0: number,
  sigma: number,
  dx: number
): ComplexArray {
  const n = x.length;
  const psi = createComplexArray(n);
  const prefactor = Math.pow(2 * Math.PI * sigma * sigma, -0.25);
  for (let i = 0; i < n; i++) {
    const dx_ = x[i] - x0;
    const envelope = prefactor * Math.exp(-(dx_ * dx_) / (4 * sigma * sigma));
    psi.re[i] = envelope * Math.cos(k0 * x[i]);
    psi.im[i] = envelope * Math.sin(k0 * x[i]);
  }
  normalize(psi, dx);
  return psi;
}

/**
 * Windowed plane wave: e^{ikx} with a broad cosine window to avoid
 * hard edges (which would create spurious high-frequency ringing).
 */
function planeWavePacket(
  x: Float64Array,
  k0: number,
  dx: number,
  L: number
): ComplexArray {
  const n = x.length;
  const psi = createComplexArray(n);
  const windowWidth = L * 0.85;
  for (let i = 0; i < n; i++) {
    // Tukey-style cosine window
    const r = Math.abs(x[i]) / windowWidth;
    const window = r < 1 ? 0.5 * (1 + Math.cos(Math.PI * r)) : 0;
    psi.re[i] = window * Math.cos(k0 * x[i]);
    psi.im[i] = window * Math.sin(k0 * x[i]);
  }
  normalize(psi, dx);
  return psi;
}

/**
 * Position-space delta: a very narrow Gaussian (sigma_narrow) centered at x0
 * with carrier momentum k0. This approximates δ(x - x0) · e^{ik0 x}.
 */
function positionDelta(
  x: Float64Array,
  x0: number,
  k0: number,
  dx: number,
  L: number
): ComplexArray {
  const sigma = L * 0.008; // very narrow
  return gaussianWavePacket(x, x0, k0, sigma, dx);
}

/**
 * Momentum-space delta: a very broad Gaussian in position space (= narrow
 * in k-space), giving nearly definite momentum k0 centered at x0.
 */
function momentumDelta(
  x: Float64Array,
  x0: number,
  k0: number,
  dx: number,
  L: number
): ComplexArray {
  const sigma = L * 0.4; // very broad
  return gaussianWavePacket(x, x0, k0, sigma, dx);
}

/**
 * Build a wave packet from a WavePacketConfig.
 */
function buildWavePacket(
  wp: WavePacketConfig,
  x: Float64Array,
  dx: number,
  L: number
): ComplexArray {
  switch (wp.type) {
    case "gaussian":
      return gaussianWavePacket(x, wp.x0, wp.k0, wp.sigma, dx);
    case "planeWave":
      return planeWavePacket(x, wp.k0, dx, L);
    case "positionDelta":
      return positionDelta(x, wp.x0, wp.k0, dx, L);
    case "momentumDelta":
      return momentumDelta(x, wp.x0, wp.k0, dx, L);
  }
}

/**
 * Initialize a fresh simulation state from a config.
 */
export function initSimulator(config: SimulationConfig): SimulatorState {
  const { N, L, dt, potential } = config;
  const dx = (2 * L) / N;

  // Spatial grid
  const x = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    x[i] = -L + i * dx;
  }

  // Momentum grid (FFT-ordered: 0..N/2-1, -N/2..-1)
  const dk = (2 * Math.PI) / (N * dx);
  const k = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    k[i] = i < N / 2 ? i * dk : (i - N) * dk;
  }

  // Potential
  const V = buildPotential(potential, { x, L });

  // Propagators
  const expV_half = createComplexArray(N);
  const expT = createComplexArray(N);

  for (let i = 0; i < N; i++) {
    const phaseV = -V[i] * dt * 0.5; // ℏ = 1
    expV_half.re[i] = Math.cos(phaseV);
    expV_half.im[i] = Math.sin(phaseV);

    const phaseT = -0.5 * k[i] * k[i] * dt; // T = k²/2m, m=1
    expT.re[i] = Math.cos(phaseT);
    expT.im[i] = Math.sin(phaseT);
  }

  // Hard boundary mask for infinite walls
  const boundaryMask = buildBoundaryMask(potential, { x, L });

  // Initial wave packet
  const psi = buildWavePacket(config.wavePacket, x, dx, L);

  // Apply mask to initial state
  if (boundaryMask) {
    for (let i = 0; i < N; i++) {
      psi.re[i] *= boundaryMask[i];
      psi.im[i] *= boundaryMask[i];
    }
    normalize(psi, dx);
  }

  return { x, k, dx, psi, V, expV_half, expT, boundaryMask, time: 0, config };
}

/**
 * Advance the wavefunction by one time step using the split-operator method.
 */
export function step(state: SimulatorState): void {
  // Half-step in V
  multiplyInPlace(state.psi, state.expV_half);

  // Full step in T (momentum space)
  fft(state.psi, 1);
  multiplyInPlace(state.psi, state.expT);
  fft(state.psi, -1);

  // Half-step in V
  multiplyInPlace(state.psi, state.expV_half);

  // Enforce hard boundary conditions (infinite walls)
  if (state.boundaryMask) {
    const n = state.psi.re.length;
    for (let i = 0; i < n; i++) {
      state.psi.re[i] *= state.boundaryMask[i];
      state.psi.im[i] *= state.boundaryMask[i];
    }
  }

  state.time += state.config.dt;
}

/**
 * Advance by multiple steps (used per animation frame).
 */
export function stepMultiple(state: SimulatorState, count: number): void {
  for (let i = 0; i < count; i++) {
    step(state);
  }
}

/**
 * Extract display data from current state.
 */
export interface DisplayData {
  x: Float64Array;
  probDensity: Float64Array;
  realPart: Float64Array;
  imagPart: Float64Array;
  potential: Float64Array;
  time: number;
}

export function getDisplayData(state: SimulatorState): DisplayData {
  return {
    x: state.x,
    probDensity: probabilityDensity(state.psi),
    realPart: new Float64Array(state.psi.re),
    imagPart: new Float64Array(state.psi.im),
    potential: state.V,
    time: state.time,
  };
}
