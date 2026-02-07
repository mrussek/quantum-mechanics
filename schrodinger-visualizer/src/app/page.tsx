"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import WavefunctionCanvas from "@/components/WavefunctionCanvas";
import Controls from "@/components/Controls";
import {
  SimulationConfig,
  DEFAULT_CONFIG,
  SimulatorState,
  initSimulator,
  stepMultiple,
  getDisplayData,
  DisplayData,
} from "@/lib/simulator";

export default function Home() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [isRunning, setIsRunning] = useState(false);
  const [displayData, setDisplayData] = useState<DisplayData | null>(null);

  // Display toggles
  const [showReal, setShowReal] = useState(true);
  const [showImag, setShowImag] = useState(true);
  const [showProb, setShowProb] = useState(true);
  const [showPotential, setShowPotential] = useState(true);

  // Canvas sizing
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation state lives in a ref to avoid re-renders on every frame
  const simRef = useRef<SimulatorState | null>(null);
  const runningRef = useRef(false);
  const animFrameRef = useRef<number>(0);
  const configRef = useRef(config);

  // Keep configRef in sync
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Initialize / reset simulation when config.potential changes
  const resetSimulation = useCallback(
    (cfg: SimulationConfig) => {
      simRef.current = initSimulator(cfg);
      setDisplayData(getDisplayData(simRef.current));
    },
    []
  );

  // Initialize on mount and when potential changes
  useEffect(() => {
    resetSimulation(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.potential, resetSimulation]);

  // Responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = Math.min(Math.max(w * 0.55, 350), 600);
        setCanvasSize({ width: w, height: h });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Animation loop
  useEffect(() => {
    runningRef.current = isRunning;

    if (!isRunning) return;

    const animate = () => {
      if (!runningRef.current || !simRef.current) return;
      stepMultiple(simRef.current, configRef.current.stepsPerFrame);
      setDisplayData(getDisplayData(simRef.current));
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning]);

  const handleConfigChange = (newConfig: SimulationConfig) => {
    setConfig(newConfig);
    // If potential changed, reset is handled by the useEffect above.
    // For other changes (dt, stepsPerFrame), update the live state's config
    if (
      simRef.current &&
      newConfig.potential === config.potential
    ) {
      // Rebuild propagators with new dt
      if (newConfig.dt !== config.dt) {
        const newSim = initSimulator(newConfig);
        // Preserve the current wavefunction
        newSim.psi = simRef.current.psi;
        newSim.time = simRef.current.time;
        simRef.current = newSim;
      } else {
        simRef.current.config = newConfig;
      }
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    resetSimulation(config);
  };

  const handleStep = () => {
    if (!simRef.current) return;
    stepMultiple(simRef.current, config.stepsPerFrame);
    setDisplayData(getDisplayData(simRef.current));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-100">
          Schrodinger Equation Visualizer
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          1D time-dependent Schrodinger equation &mdash; split-operator
          Fourier method
        </p>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Canvas area */}
        <main className="flex-1 p-4 lg:p-6" ref={containerRef}>
          <WavefunctionCanvas
            data={displayData}
            showReal={showReal}
            showImag={showImag}
            showProb={showProb}
            showPotential={showPotential}
            width={canvasSize.width}
            height={canvasSize.height}
          />

          {/* Quick stats */}
          {displayData && (
            <div className="mt-3 flex gap-6 text-xs text-gray-500 font-mono">
              <span>
                N = {config.N}
              </span>
              <span>
                L = {config.L}
              </span>
              <span>
                dt = {config.dt.toFixed(3)}
              </span>
              <span>
                steps/frame = {config.stepsPerFrame}
              </span>
              <span>
                t = {displayData.time.toFixed(3)}
              </span>
            </div>
          )}

          {/* Keyboard shortcut hint */}
          <p className="mt-4 text-xs text-gray-700">
            Tip: Select a potential on the right, then press Play to watch the
            wave packet evolve in real time.
          </p>
        </main>

        {/* Sidebar controls */}
        <aside className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-800 p-4 lg:p-5 overflow-y-auto">
          <Controls
            config={config}
            onConfigChange={handleConfigChange}
            isRunning={isRunning}
            onToggleRunning={() => setIsRunning((r) => !r)}
            onReset={handleReset}
            onStep={handleStep}
            showReal={showReal}
            showImag={showImag}
            showProb={showProb}
            showPotential={showPotential}
            onToggleReal={() => setShowReal((v) => !v)}
            onToggleImag={() => setShowImag((v) => !v)}
            onToggleProb={() => setShowProb((v) => !v)}
            onTogglePotential={() => setShowPotential((v) => !v)}
          />
        </aside>
      </div>
    </div>
  );
}
