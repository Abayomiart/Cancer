import React, { useEffect, useRef } from 'react';

interface OscilloscopeChartProps {
  isConnected: boolean;
  downloadSpeedBps: number;
  uploadSpeedBps: number;
}

export const OscilloscopeChart: React.FC<OscilloscopeChartProps> = ({
  isConnected,
  downloadSpeedBps,
  uploadSpeedBps,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<number[]>(new Array(36).fill(0));
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;

    const render = () => {
      step++;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Dark background with subtle gradient
      ctx.fillStyle = '#0a100d';
      ctx.fillRect(0, 0, width, height);

      // Draw horizontal grid lines
      ctx.strokeStyle = '#122018';
      ctx.lineWidth = 1;
      const lines = 4;
      for (let i = 1; i <= lines; i++) {
        const y = (height / (lines + 1)) * i;
        ctx.beginPath();
        ctx.moveTo(70, y);
        ctx.lineTo(width - 12, y);
        ctx.stroke();
      }

      // Add new sample every ~6 frames
      if (step % 6 === 0) {
        let currentBps = 0;
        if (isConnected) {
          currentBps = downloadSpeedBps + (Math.random() * 800 - 400);
          if (currentBps < 1200) currentBps = 1200 + Math.random() * 3000;
        } else {
          currentBps = 0;
        }
        historyRef.current.push(Math.max(0, currentBps));
        if (historyRef.current.length > 36) {
          historyRef.current.shift();
        }
      }

      // Find max for scaling
      const maxVal = Math.max(10000, ...historyRef.current);

      // Plot smooth cyber green wave
      const points = historyRef.current;
      const startX = 70;
      const endX = width - 12;
      const stepX = (endX - startX) / (points.length - 1);

      ctx.beginPath();
      ctx.strokeStyle = isConnected ? '#10b981' : '#059669';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = isConnected ? 'rgba(16, 185, 129, 0.8)' : 'transparent';
      ctx.shadowBlur = isConnected ? 8 : 0;

      for (let i = 0; i < points.length; i++) {
        const val = points[i];
        // Height padding
        const norm = isConnected ? Math.min(1, val / maxVal) : 0;
        const y = height - 16 - norm * (height - 32);
        const x = startX + i * stepX;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Bezier interpolation
          const prevX = startX + (i - 1) * stepX;
          const prevVal = points[i - 1];
          const prevNorm = isConnected ? Math.min(1, prevVal / maxVal) : 0;
          const prevY = height - 16 - prevNorm * (height - 32);
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw bottom dashed heartbeat baseline (just like in the screenshot)
      ctx.strokeStyle = isConnected ? '#10b981' : '#0e3822';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(70, height - 14);
      ctx.lineTo(width - 14, height - 14);
      ctx.stroke();
      ctx.setLineDash([]);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isConnected, downloadSpeedBps]);

  const formatUnit = (bps: number) => {
    if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(1)} Mbps`;
    if (bps >= 1_000) return `${(bps / 1_000).toFixed(0)} Kbps`;
    return `${Math.round(bps)} bps`;
  };

  return (
    <div className="relative w-full bg-[#0a100d] border border-[#14261c] rounded-2xl p-3 shadow-inner overflow-hidden">
      {/* Static text labels on left side matching screenshot: 0 bps, 1 bps, 1 bps... */}
      <div className="absolute left-3 top-3 bottom-3 flex flex-col justify-between text-[11px] font-mono text-[#527d65] select-none pointer-events-none z-10">
        <span className="tabular-nums">
          {isConnected ? formatUnit(downloadSpeedBps * 1.5 || 2500000) : '0 bps'}
        </span>
        <span className="tabular-nums">
          {isConnected ? formatUnit(downloadSpeedBps * 0.75 || 1200000) : '1 bps'}
        </span>
        <span className="tabular-nums">
          {isConnected ? formatUnit(downloadSpeedBps * 0.3 || 450000) : '1 bps'}
        </span>
        <span className="tabular-nums">
          {isConnected ? formatUnit(downloadSpeedBps * 0.05 || 50000) : '1 bps'}
        </span>
      </div>

      {/* Main Realtime Canvas */}
      <canvas
        ref={canvasRef}
        width={420}
        height={110}
        className="w-full h-[105px] block rounded-xl"
      />
    </div>
  );
};
