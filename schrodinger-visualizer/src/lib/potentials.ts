/**
 * Potential energy functions V(x) for various 1D quantum systems.
 *
 * All potentials are defined on arbitrary spatial grids and return a
 * Float64Array of V values at each grid point.
 */

export interface PotentialParams {
  /** Grid positions */
  x: Float64Array;
  /** Domain half-width (x goes from -L to +L) */
  L: number;
}

// ── Catalog of available potentials ─────────────────────────────────

export type PotentialType =
  | "free"
  | "harmonicOscillator"
  | "infiniteSquareWell"
  | "finiteSquareWell"
  | "barrier"
  | "doubleBarrier"
  | "step"
  | "doubleWell"
  | "morse";

export interface PotentialInfo {
  type: PotentialType;
  label: string;
  description: string;
}

export const POTENTIAL_CATALOG: PotentialInfo[] = [
  {
    type: "free",
    label: "Free Particle",
    description: "No potential – free propagation showing wave packet spreading",
  },
  {
    type: "harmonicOscillator",
    label: "Harmonic Oscillator",
    description: "Parabolic potential V = ½ω²x² – the quantum spring",
  },
  {
    type: "infiniteSquareWell",
    label: "Infinite Square Well",
    description: "Particle in a box with impenetrable walls",
  },
  {
    type: "finiteSquareWell",
    label: "Finite Square Well",
    description: "Attractive well with finite depth – allows tunneling",
  },
  {
    type: "barrier",
    label: "Potential Barrier",
    description: "Single rectangular barrier – demonstrates quantum tunneling",
  },
  {
    type: "doubleBarrier",
    label: "Double Barrier",
    description: "Two barriers forming a resonant cavity",
  },
  {
    type: "step",
    label: "Potential Step",
    description: "Abrupt step in potential – partial reflection and transmission",
  },
  {
    type: "doubleWell",
    label: "Double Well",
    description: "Two-well potential – shows tunneling between bound states",
  },
  {
    type: "morse",
    label: "Morse Potential",
    description: "Anharmonic oscillator modeling molecular bonds",
  },
];

// ── Potential constructors ──────────────────────────────────────────

const WALL_HEIGHT = 1e6; // "infinite" wall height for numerical purposes

export function buildPotential(
  type: PotentialType,
  params: PotentialParams
): Float64Array {
  const { x, L } = params;
  const n = x.length;
  const V = new Float64Array(n);

  switch (type) {
    case "free":
      // V = 0 everywhere
      break;

    case "harmonicOscillator": {
      const omega = 2.0;
      for (let i = 0; i < n; i++) {
        V[i] = 0.5 * omega * omega * x[i] * x[i];
      }
      break;
    }

    case "infiniteSquareWell": {
      const wallPos = L * 0.45;
      for (let i = 0; i < n; i++) {
        V[i] = Math.abs(x[i]) > wallPos ? WALL_HEIGHT : 0;
      }
      break;
    }

    case "finiteSquareWell": {
      const wellWidth = L * 0.3;
      const depth = 50;
      for (let i = 0; i < n; i++) {
        V[i] = Math.abs(x[i]) < wellWidth ? -depth : 0;
      }
      break;
    }

    case "barrier": {
      const bw = L * 0.03;
      const bh = 60;
      for (let i = 0; i < n; i++) {
        V[i] = Math.abs(x[i]) < bw ? bh : 0;
      }
      break;
    }

    case "doubleBarrier": {
      const separation = L * 0.1;
      const width = L * 0.02;
      const height = 80;
      for (let i = 0; i < n; i++) {
        const ax = Math.abs(x[i]);
        if (
          (ax > separation - width && ax < separation + width)
        ) {
          V[i] = height;
        }
      }
      break;
    }

    case "step": {
      const stepHeight = 40;
      for (let i = 0; i < n; i++) {
        V[i] = x[i] > 0 ? stepHeight : 0;
      }
      break;
    }

    case "doubleWell": {
      const sep = L * 0.2;
      const depth = 80;
      const width = L * 0.12;
      for (let i = 0; i < n; i++) {
        const dx1 = x[i] - sep;
        const dx2 = x[i] + sep;
        const v1 = -depth * Math.exp(-(dx1 * dx1) / (2 * width * width));
        const v2 = -depth * Math.exp(-(dx2 * dx2) / (2 * width * width));
        V[i] = v1 + v2;
      }
      break;
    }

    case "morse": {
      const De = 50;
      const a = 0.5;
      const x0 = -L * 0.2;
      for (let i = 0; i < n; i++) {
        const expTerm = 1 - Math.exp(-a * (x[i] - x0));
        V[i] = De * expTerm * expTerm - De;
      }
      break;
    }
  }

  return V;
}

/**
 * Build a hard boundary mask for potentials with truly infinite walls.
 * Returns a Float64Array where mask[i] = 1 inside the allowed region and
 * mask[i] = 0 in the forbidden (infinite potential) region. Returns null
 * for potentials that don't need hard boundaries.
 *
 * After each time step, psi is multiplied element-wise by this mask to
 * enforce the Dirichlet boundary condition psi = 0 at infinite walls.
 */
export function buildBoundaryMask(
  type: PotentialType,
  params: PotentialParams
): Float64Array | null {
  if (type !== "infiniteSquareWell") return null;

  const { x, L } = params;
  const n = x.length;
  const mask = new Float64Array(n);
  const wallPos = L * 0.45;
  for (let i = 0; i < n; i++) {
    mask[i] = Math.abs(x[i]) <= wallPos ? 1 : 0;
  }
  return mask;
}

/**
 * Suggested initial wave-packet center and momentum for each potential,
 * so the demo looks good out of the box.
 */
export function defaultWavePacketParams(type: PotentialType, L: number) {
  switch (type) {
    case "free":
      return { x0: -L * 0.3, k0: 5, sigma: L * 0.06 };
    case "harmonicOscillator":
      return { x0: -L * 0.25, k0: 0, sigma: L * 0.06 };
    case "infiniteSquareWell":
      return { x0: -L * 0.15, k0: 3, sigma: L * 0.06 };
    case "finiteSquareWell":
      return { x0: -L * 0.5, k0: 6, sigma: L * 0.06 };
    case "barrier":
      return { x0: -L * 0.35, k0: 8, sigma: L * 0.06 };
    case "doubleBarrier":
      return { x0: -L * 0.4, k0: 8, sigma: L * 0.06 };
    case "step":
      return { x0: -L * 0.4, k0: 8, sigma: L * 0.06 };
    case "doubleWell":
      return { x0: -L * 0.2, k0: 0, sigma: L * 0.06 };
    case "morse":
      return { x0: -L * 0.2, k0: 0, sigma: L * 0.06 };
    default:
      return { x0: -L * 0.3, k0: 5, sigma: L * 0.06 };
  }
}
