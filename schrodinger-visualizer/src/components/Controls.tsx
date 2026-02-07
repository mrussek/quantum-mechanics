"use client";

import { POTENTIAL_CATALOG, PotentialType } from "@/lib/potentials";
import type { SimulationConfig } from "@/lib/simulator";

interface Props {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  onStep: () => void;
  showReal: boolean;
  showImag: boolean;
  showProb: boolean;
  showPotential: boolean;
  onToggleReal: () => void;
  onToggleImag: () => void;
  onToggleProb: () => void;
  onTogglePotential: () => void;
}

export default function Controls({
  config,
  onConfigChange,
  isRunning,
  onToggleRunning,
  onReset,
  onStep,
  showReal,
  showImag,
  showProb,
  showPotential,
  onToggleReal,
  onToggleImag,
  onToggleProb,
  onTogglePotential,
}: Props) {
  const selectedInfo = POTENTIAL_CATALOG.find(
    (p) => p.type === config.potential
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Potential selector */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Potential V(x)
        </h3>
        <div className="grid grid-cols-1 gap-1.5">
          {POTENTIAL_CATALOG.map((p) => (
            <button
              key={p.type}
              onClick={() =>
                onConfigChange({ ...config, potential: p.type as PotentialType })
              }
              className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                config.potential === p.type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {selectedInfo && (
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            {selectedInfo.description}
          </p>
        )}
      </section>

      {/* Playback controls */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Simulation
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onToggleRunning}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isRunning
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            {isRunning ? "Pause" : "Play"}
          </button>
          <button
            onClick={onStep}
            disabled={isRunning}
            className="px-3 py-2 rounded-md text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-40 transition-colors"
          >
            Step
          </button>
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-md text-sm font-medium bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
        </div>
      </section>

      {/* Speed control */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Speed (steps/frame)
        </h3>
        <input
          type="range"
          min={1}
          max={20}
          value={config.stepsPerFrame}
          onChange={(e) =>
            onConfigChange({
              ...config,
              stepsPerFrame: parseInt(e.target.value),
            })
          }
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span className="text-gray-400">{config.stepsPerFrame}</span>
          <span>20</span>
        </div>
      </section>

      {/* Time step control */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Time Step (dt)
        </h3>
        <input
          type="range"
          min={1}
          max={50}
          value={config.dt * 1000}
          onChange={(e) =>
            onConfigChange({
              ...config,
              dt: parseInt(e.target.value) / 1000,
            })
          }
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.001</span>
          <span className="text-gray-400">{config.dt.toFixed(3)}</span>
          <span>0.050</span>
        </div>
      </section>

      {/* Display toggles */}
      <section>
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">
          Display
        </h3>
        <div className="flex flex-col gap-2">
          <Toggle
            label="|ψ|² Probability"
            color="#60a5fa"
            checked={showProb}
            onChange={onToggleProb}
          />
          <Toggle
            label="Re(ψ)"
            color="#34d399"
            checked={showReal}
            onChange={onToggleReal}
          />
          <Toggle
            label="Im(ψ)"
            color="#f472b6"
            checked={showImag}
            onChange={onToggleImag}
          />
          <Toggle
            label="V(x) Potential"
            color="#fbbf24"
            checked={showPotential}
            onChange={onTogglePotential}
          />
        </div>
      </section>

      {/* Legend / info */}
      <section className="text-xs text-gray-600 leading-relaxed border-t border-gray-800 pt-4">
        <p>
          Solver: Split-operator Fourier method (SOFT). The propagator
          is factored as e<sup>-iVdt/2</sup> e<sup>-iTdt</sup> e<sup>-iVdt/2</sup> and
          the kinetic term is applied via FFT in momentum space. Units: &#x210F; = m = 1.
        </p>
      </section>
    </div>
  );
}

function Toggle({
  label,
  color,
  checked,
  onChange,
}: {
  label: string;
  color: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        className="w-3 h-3 rounded-sm border"
        style={{
          backgroundColor: checked ? color : "transparent",
          borderColor: color,
        }}
        onClick={onChange}
      />
      <span
        className={`text-sm ${checked ? "text-gray-200" : "text-gray-500"}`}
        onClick={onChange}
      >
        {label}
      </span>
    </label>
  );
}
