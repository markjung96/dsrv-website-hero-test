"use client";

import { useEffect, useRef, useCallback } from "react";

export type ContourVariant =
  | "stablecoin"
  | "portal"
  | "allThatNode"
  | "walletHub"
  | "stakingHub"
  | "custody";

type RGB = [number, number, number];

interface ColorStop {
  pos: number;
  tr: RGB;
  bl: RGB;
}

const COLOR_STOPS: Record<ContourVariant, ColorStop[]> = {
  allThatNode: [
    { pos: 0.0, tr: [220, 240, 160], bl: [160, 235, 190] },
    { pos: 0.05, tr: [218, 238, 155], bl: [155, 232, 188] },
    { pos: 0.12, tr: [220, 235, 140], bl: [140, 230, 200] },
    { pos: 0.22, tr: [216, 230, 180], bl: [180, 225, 200] },
    { pos: 0.3, tr: [210, 247, 100], bl: [0, 229, 204] },
    { pos: 0.4, tr: [220, 248, 108], bl: [64, 236, 192] },
    { pos: 0.5, tr: [139, 255, 106], bl: [61, 221, 224] },
    { pos: 0.58, tr: [77, 232, 130], bl: [128, 176, 200] },
    { pos: 0.65, tr: [94, 234, 160], bl: [184, 160, 216] },
    { pos: 0.72, tr: [0, 240, 240], bl: [255, 96, 184] },
    { pos: 0.8, tr: [0, 229, 255], bl: [255, 105, 224] },
    { pos: 0.88, tr: [80, 170, 255], bl: [155, 106, 223] },
    { pos: 0.94, tr: [96, 136, 235], bl: [132, 66, 234] },
    { pos: 1.0, tr: [108, 88, 213], bl: [101, 48, 245] },
  ],
  portal: [
    { pos: 0.0, tr: [200, 210, 195], bl: [195, 210, 200] },
    { pos: 0.2, tr: [190, 235, 80], bl: [80, 230, 180] },
    { pos: 0.4, tr: [80, 230, 140], bl: [160, 140, 200] },
    { pos: 0.6, tr: [50, 190, 210], bl: [230, 80, 160] },
    { pos: 0.8, tr: [100, 100, 210], bl: [160, 60, 200] },
    { pos: 1.0, tr: [65, 50, 180], bl: [90, 40, 200] },
  ],
  walletHub: [
    { pos: 0.0, tr: [200, 210, 200], bl: [200, 210, 205] },
    { pos: 0.2, tr: [150, 225, 100], bl: [90, 210, 190] },
    { pos: 0.4, tr: [90, 210, 160], bl: [140, 160, 200] },
    { pos: 0.6, tr: [65, 180, 190], bl: [215, 80, 140] },
    { pos: 0.8, tr: [80, 115, 210], bl: [155, 70, 200] },
    { pos: 1.0, tr: [50, 75, 185], bl: [80, 50, 195] },
  ],
  stablecoin: [
    { pos: 0.0, tr: [200, 210, 200], bl: [200, 210, 205] },
    { pos: 0.2, tr: [140, 220, 130], bl: [80, 200, 180] },
    { pos: 0.4, tr: [50, 165, 210], bl: [155, 130, 200] },
    { pos: 0.6, tr: [55, 160, 210], bl: [205, 90, 155] },
    { pos: 0.8, tr: [90, 100, 215], bl: [140, 65, 195] },
    { pos: 1.0, tr: [55, 70, 200], bl: [85, 50, 210] },
  ],
  stakingHub: [
    { pos: 0.0, tr: [200, 210, 200], bl: [200, 210, 205] },
    { pos: 0.2, tr: [180, 225, 90], bl: [100, 200, 140] },
    { pos: 0.4, tr: [50, 155, 185], bl: [170, 120, 180] },
    { pos: 0.6, tr: [50, 150, 180], bl: [225, 70, 130] },
    { pos: 0.8, tr: [70, 90, 200], bl: [130, 55, 185] },
    { pos: 1.0, tr: [45, 55, 175], bl: [75, 40, 190] },
  ],
  custody: [
    { pos: 0.0, tr: [200, 210, 205], bl: [205, 205, 210] },
    { pos: 0.2, tr: [130, 210, 115], bl: [95, 185, 175] },
    { pos: 0.4, tr: [90, 140, 200], bl: [155, 120, 195] },
    { pos: 0.6, tr: [75, 130, 200], bl: [210, 55, 165] },
    { pos: 0.8, tr: [130, 65, 190], bl: [120, 50, 180] },
    { pos: 1.0, tr: [75, 45, 165], bl: [65, 35, 175] },
  ],
};

function lerpRGB(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function getColors(stops: ColorStop[], pos: number): { tr: RGB; bl: RGB } {
  if (pos <= stops[0].pos) return { tr: stops[0].tr, bl: stops[0].bl };
  if (pos >= stops[stops.length - 1].pos) return { tr: stops[stops.length - 1].tr, bl: stops[stops.length - 1].bl };
  for (let i = 0; i < stops.length - 1; i++) {
    if (pos >= stops[i].pos && pos <= stops[i + 1].pos) {
      const t = (pos - stops[i].pos) / (stops[i + 1].pos - stops[i].pos);
      return {
        tr: lerpRGB(stops[i].tr, stops[i + 1].tr, t),
        bl: lerpRGB(stops[i].bl, stops[i + 1].bl, t),
      };
    }
  }
  return { tr: stops[0].tr, bl: stops[0].bl };
}

/* ── Blob geometry ────────────────────────────────────────── */

const NUM_LAYERS = 150;
const OUTER_COUNT = 40;
const BLOB_PTS = 48;

function getBlobPoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number,
  layerIdx: number,
  progress: number,
): [number, number][] {
  const points: [number, number][] = [];

  const outerFactor = Math.max(0, 1.0 - progress * 4.0);
  const baseDeform = 0.035 * outerFactor;
  const layerNoise = Math.sin(seed * 3.1 + layerIdx * 0.07) * 0.008 * outerFactor;
  const deform = baseDeform + layerNoise;

  const rot = seed * 0.25 + layerIdx * 0.008;
  const cosR = Math.cos(rot);
  const sinR = Math.sin(rot);

  const ph2 = seed * 0.7 + layerIdx * 0.018;
  const ph3 = seed * 1.3 + layerIdx * 0.013;
  const ph4 = seed * 2.1 + layerIdx * 0.009;
  const ph5 = seed * 3.7 + layerIdx * 0.006;

  for (let j = 0; j < BLOB_PTS; j++) {
    const angle = (j / BLOB_PTS) * Math.PI * 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    let r = (rx * ry) / Math.sqrt((ry * cosA) ** 2 + (rx * sinA) ** 2);

    r *=
      1.0 +
      deform * Math.sin(2 * angle + ph2) +
      deform * 0.55 * Math.sin(3 * angle + ph3) +
      deform * 0.25 * Math.sin(4 * angle + ph4) +
      deform * 0.15 * Math.sin(5 * angle + ph5);

    const px = r * cosA;
    const py = r * sinA;
    points.push([cx + px * cosR - py * sinR, cy + px * sinR + py * cosR]);
  }

  return points;
}

function drawBlobPath(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  const n = pts.length;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);

  for (let j = 0; j < n; j++) {
    const p0 = pts[(j - 1 + n) % n];
    const p1 = pts[j];
    const p2 = pts[(j + 1) % n];
    const p3 = pts[(j + 2) % n];

    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
  }

  ctx.closePath();
}

/* ── Component ────────────────────────────────────────────── */

interface ContourBlobBackgroundProps {
  variant?: ContourVariant;
}

export default function ContourBlobBackground({ variant = "allThatNode" }: ContourBlobBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);
  const seedRef = useRef(Math.random() * 100);

  const innerCacheRef = useRef<HTMLCanvasElement | null>(null);
  const lastSizeRef = useRef({ w: 0, h: 0 });
  const lastVariantRef = useRef(variant);

  const drawLayer = (
    ctx: CanvasRenderingContext2D,
    i: number,
    w: number,
    h: number,
    animSx: number,
    animSy: number,
    extraBlur: number = 0,
    sizeScale: number = 1.0,
  ) => {
    const seed = seedRef.current;
    const stops = COLOR_STOPS[variant];
    const progress = i / (NUM_LAYERS - 1);

    const t = progress;
    const easedT =
      t < 0.33
        ? t * 0.85
        : t < 0.65
          ? 0.2805 + (t - 0.33) * 1.35
          : 0.712 + (t - 0.65) * 0.82;
    const maxR = Math.min(w, h) * 0.285 * sizeScale;
    const radius = maxR * (1.0 - easedT * 0.64);

    const driftAngle = seed * 0.4 + 0.3;
    const driftMag = progress * Math.min(w, h) * 0.02;
    const cx = w / 2 + Math.cos(driftAngle) * driftMag;
    const cy = h / 2 + Math.sin(driftAngle) * driftMag;

    const aspect = 1.15;
    const rx = radius * animSx;
    const ry = radius * aspect * animSy;

    const pts = getBlobPoints(cx, cy, rx, ry, seed, i, progress);

    const { tr, bl } = getColors(stops, progress);
    const fadeIn = progress < 0.20 ? (progress / 0.20) ** 2 : 1.0;
    const centerFade = progress > 0.6 ? 1.0 - (progress - 0.6) / 0.4 * 0.45 : 1.0;
    const alpha = fadeIn * centerFade;

    const grad = ctx.createLinearGradient(
      cx + rx * 0.7,
      cy - ry * 0.7,
      cx - rx * 0.7,
      cy + ry * 0.7,
    );
    grad.addColorStop(0, `rgba(${tr[0]},${tr[1]},${tr[2]},${alpha})`);
    grad.addColorStop(1, `rgba(${bl[0]},${bl[1]},${bl[2]},${alpha})`);

    // Heavy blur on outer layers to eliminate visible edges
    const edgeBlur =
      progress < 0.70 ? (1.0 - progress / 0.70) ** 1.0 * 80 : 0;
    const totalBlur = Math.max(edgeBlur, extraBlur);
    if (totalBlur > 1.5) ctx.filter = `blur(${totalBlur}px)`;

    drawBlobPath(ctx, pts);
    ctx.fillStyle = grad;
    ctx.fill();

    if (totalBlur > 1.5) ctx.filter = "none";
  };

  const renderInnerCache = useCallback((w: number, h: number, dpr: number) => {
    if (!innerCacheRef.current) {
      innerCacheRef.current = document.createElement("canvas");
    }
    const off = innerCacheRef.current;
    off.width = w * dpr;
    off.height = h * dpr;
    const ctx = off.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    for (let i = OUTER_COUNT; i < NUM_LAYERS; i++) {
      drawLayer(ctx, i, w, h, 1.0, 1.0, 0, 1.3);
    }

    lastSizeRef.current = { w, h };
    lastVariantRef.current = variant;
  }, [variant]);

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    if (lastSizeRef.current.w !== w || lastSizeRef.current.h !== h || lastVariantRef.current !== variant) {
      renderInnerCache(w, h, dpr);
    }

    const t = time / 1000;
    const seed = seedRef.current;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);

    const outerSx = 0.95 + 0.05 * Math.sin(t * 0.08 + seed * 0.5);
    const outerSy = 1.05 + 0.05 * Math.cos(t * 0.08 + seed * 0.5);
    const scaleStretch = Math.max(outerSx, outerSy) - 1.0;
    const stretchBlur = Math.max(0, scaleStretch) * 60;

    for (let i = 0; i < OUTER_COUNT; i++) {
      const layerT = 1.0 - i / OUTER_COUNT;
      const extra = stretchBlur * layerT;
      drawLayer(ctx, i, w, h, outerSx, outerSy, extra, 1.2);
    }

    if (innerCacheRef.current) {
      ctx.drawImage(innerCacheRef.current, 0, 0, w, h);
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [variant, renderInnerCache]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = [
        (e.clientX - rect.left) / rect.width,
        (e.clientY - rect.top) / rect.height,
      ];
    };
    window.addEventListener("mousemove", handleMouseMove);
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
