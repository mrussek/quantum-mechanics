"use client";

import { useRef, useEffect, useCallback } from "react";
import type { DisplayData } from "@/lib/simulator";

interface Props {
  data: DisplayData | null;
  showReal: boolean;
  showImag: boolean;
  showProb: boolean;
  showPotential: boolean;
  width: number;
  height: number;
}

// Colors
const COLOR_PROB = "#60a5fa"; // blue-400
const COLOR_REAL = "#34d399"; // emerald-400
const COLOR_IMAG = "#f472b6"; // pink-400
const COLOR_POTENTIAL = "#fbbf24"; // amber-400
const COLOR_GRID = "#374151"; // gray-700
const COLOR_AXIS = "#6b7280"; // gray-500
const COLOR_BG = "#111827"; // gray-900

/**
 * High-performance canvas renderer for wavefunction visualization.
 */
export default function WavefunctionCanvas({
  data,
  showReal,
  showImag,
  showProb,
  showPotential,
  width,
  height,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const { x, probDensity, realPart, imagPart, potential } = data;
    const n = x.length;

    // Margins
    const ml = 50,
      mr = 20,
      mt = 20,
      mb = 40;
    const pw = width - ml - mr;
    const ph = height - mt - mb;

    // Clear
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, width, height);

    // Determine y-range for wavefunction components
    let maxWf = 0;
    for (let i = 0; i < n; i++) {
      if (showProb) maxWf = Math.max(maxWf, Math.abs(probDensity[i]));
      if (showReal) maxWf = Math.max(maxWf, Math.abs(realPart[i]));
      if (showImag) maxWf = Math.max(maxWf, Math.abs(imagPart[i]));
    }
    if (maxWf === 0) maxWf = 1;
    maxWf *= 1.15; // padding

    // Mapping functions
    const xMin = x[0],
      xMax = x[n - 1];
    const mapX = (val: number) => ml + ((val - xMin) / (xMax - xMin)) * pw;
    const mapY = (val: number) => mt + ph / 2 - (val / maxWf) * (ph / 2);

    // Grid lines
    ctx.strokeStyle = COLOR_GRID;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 4]);
    // Horizontal zero line
    ctx.beginPath();
    ctx.moveTo(ml, mt + ph / 2);
    ctx.lineTo(ml + pw, mt + ph / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = COLOR_AXIS;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ml, mt);
    ctx.lineTo(ml, mt + ph);
    ctx.lineTo(ml + pw, mt + ph);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = COLOR_AXIS;
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText("x", ml + pw / 2, height - 5);
    ctx.save();
    ctx.translate(14, mt + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("ψ(x, t)", 0, 0);
    ctx.restore();

    // Tick marks on x-axis
    const xRange = xMax - xMin;
    const xStep = Math.pow(10, Math.floor(Math.log10(xRange / 4)));
    const xStart = Math.ceil(xMin / xStep) * xStep;
    ctx.fillStyle = COLOR_AXIS;
    ctx.textAlign = "center";
    for (let v = xStart; v <= xMax; v += xStep) {
      const px = mapX(v);
      ctx.beginPath();
      ctx.moveTo(px, mt + ph);
      ctx.lineTo(px, mt + ph + 4);
      ctx.stroke();
      ctx.fillText(v.toFixed(0), px, mt + ph + 16);
    }

    // Draw potential (scaled separately)
    if (showPotential) {
      let maxV = 0;
      for (let i = 0; i < n; i++) {
        const absV = Math.abs(potential[i]);
        if (absV < 1e3) maxV = Math.max(maxV, absV);
      }
      if (maxV === 0) maxV = 1;
      const scaleV = (ph * 0.4) / maxV;

      ctx.strokeStyle = COLOR_POTENTIAL;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      // Use a stride to avoid drawing every single point
      const stride = Math.max(1, Math.floor(n / pw));
      for (let i = 0; i < n; i += stride) {
        const px = mapX(x[i]);
        const clampedV = Math.max(-maxV, Math.min(maxV, potential[i]));
        const py = mt + ph / 2 - clampedV * scaleV / (ph / 2) * (ph / 2);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Label
      ctx.fillStyle = COLOR_POTENTIAL;
      ctx.globalAlpha = 0.7;
      ctx.font = "11px monospace";
      ctx.textAlign = "right";
      ctx.fillText("V(x)", ml + pw - 4, mt + 14);
      ctx.globalAlpha = 1;
    }

    // Helper to draw a line series
    const drawSeries = (
      values: Float64Array,
      color: string,
      lineWidth: number
    ) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      const stride = Math.max(1, Math.floor(n / (pw * 2)));
      for (let i = 0; i < n; i += stride) {
        const px = mapX(x[i]);
        const py = mapY(values[i]);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };

    // Draw probability density with filled area
    if (showProb) {
      // Fill
      ctx.fillStyle = COLOR_PROB;
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      const stride = Math.max(1, Math.floor(n / (pw * 2)));
      const zeroY = mapY(0);
      ctx.moveTo(mapX(x[0]), zeroY);
      for (let i = 0; i < n; i += stride) {
        ctx.lineTo(mapX(x[i]), mapY(probDensity[i]));
      }
      ctx.lineTo(mapX(x[n - 1]), zeroY);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      // Outline
      drawSeries(probDensity, COLOR_PROB, 2);
    }

    // Draw real part
    if (showReal) {
      drawSeries(realPart, COLOR_REAL, 1.2);
    }

    // Draw imaginary part
    if (showImag) {
      drawSeries(imagPart, COLOR_IMAG, 1.2);
    }

    // Time display
    ctx.fillStyle = "#e5e7eb";
    ctx.font = "13px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`t = ${data.time.toFixed(3)}`, ml + 8, mt + 16);
  }, [data, showReal, showImag, showProb, showPotential, width, height]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="rounded-lg border border-gray-700"
    />
  );
}
