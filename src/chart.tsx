/** @jsx createElement */
import { createElement } from './jsx-runtime';
import type { DataPoint } from './data-service';

export type ChartType = 'bar' | 'line' | 'pie';

interface ChartProps {
  type: ChartType;
  data: DataPoint[];
  height?: number; // width auto-fits parent
}

export const Chart = ({ type, data, height = 340 }: ChartProps) => {
  let raf = 0;

  const draw = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const cssW = Math.max(320, Math.floor(canvas.parentElement?.clientWidth || 640));
      const cssH = height;
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const pxW = Math.floor(cssW * dpr), pxH = Math.floor(cssH * dpr);

      if (canvas.width !== pxW || canvas.height !== pxH) {
        canvas.width = pxW; canvas.height = pxH;
        canvas.style.width = cssW + 'px'; canvas.style.height = cssH + 'px';
      }

      const ctx = canvas.getContext('2d')!;
      ctx.save(); ctx.scale(dpr, dpr); ctx.clearRect(0, 0, cssW, cssH);

      if (type === 'bar') drawBar(ctx, data, cssW, cssH);
      else if (type === 'line') drawLine(ctx, data, cssW, cssH);
      else drawPie(ctx, data, cssW, cssH);

      ctx.restore();
    });
  };

  return (
    <canvas
      ref={draw}
      style={{ display: 'block', width: '100%', maxWidth: '100%', border: '1px solid #ddd', borderRadius: 8 }}
    />
  );
};

const maxY = (ds: DataPoint[]) => Math.max(1, ...ds.map(d => d.y));

function drawBar(ctx: CanvasRenderingContext2D, ds: DataPoint[], w: number, h: number) {
  const pad = 24, aw = w - pad * 2, ah = h - pad * 2;
  const bw = aw / Math.max(1, ds.length);
  const m = maxY(ds);
  ds.forEach((d, i) => {
    const x = pad + i * bw;
    const bh = (d.y / m) * ah;
    ctx.fillStyle = `hsl(${(i / Math.max(1, ds.length)) * 360},60%,55%)`;
    ctx.fillRect(x + 4, h - pad - bh, Math.max(1, bw - 8), bh);
  });
  ctx.strokeStyle = '#888'; ctx.beginPath();
  ctx.moveTo(pad + 0.5, h - pad + 0.5);
  ctx.lineTo(w - pad + 0.5, h - pad + 0.5);
  ctx.stroke();
}

function drawLine(ctx: CanvasRenderingContext2D, ds: DataPoint[], w: number, h: number) {
  const pad = 24, aw = w - pad * 2, ah = h - pad * 2;
  const m = maxY(ds);
  ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath();
  ds.forEach((d, i) => {
    const x = pad + (i / Math.max(1, ds.length - 1)) * aw;
    const y = h - pad - (d.y / m) * ah;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  });
  ctx.stroke();
  ctx.fillStyle = '#333';
  ds.forEach((d, i) => {
    const x = pad + (i / Math.max(1, ds.length - 1)) * aw;
    const y = h - pad - (d.y / m) * ah;
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
  });
}

function drawPie(ctx: CanvasRenderingContext2D, ds: DataPoint[], w: number, h: number) {
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.35;
  const sum = ds.reduce((s, d) => s + d.y, 0) || 1;
  let a0 = 0;
  ds.forEach((d, i) => {
    const a1 = a0 + (d.y / sum) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.fillStyle = `hsl(${(i / Math.max(1, ds.length)) * 360},60%,55%)`;
    ctx.arc(cx, cy, r, a0, a1); ctx.closePath(); ctx.fill();
    a0 = a1;
  });
}
