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

const NUM_LAYERS = 150;

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

  const OUTER_COUNT = 40; // layers 0~39 animate

  const drawLayer = (ctx: CanvasRenderingContext2D, i: number, w: number, h: number, animSx: number, animSy: number) => {
    const cx = w / 2;
    const cy = h / 2;
    const maxRadius = Math.min(w, h) * 0.42;
    const seed = seedRef.current;
    const stops = COLOR_STOPS[variant];
    const progress = i / (NUM_LAYERS - 1);
    const radius = maxRadius * (1.0 - progress * 0.65);

    const distortAmount = (1.0 - progress) * 0.1;
    const angleOffset = Math.sin(seed + i * 0.04) * distortAmount;

    const layerCx = cx + Math.sin(seed + i * 0.03) * maxRadius * 0.015 * (1.0 - progress);
    const layerCy = cy + Math.cos(seed * 1.3 + i * 0.03) * maxRadius * 0.015 * (1.0 - progress);

    const rX = radius * (1.0 + angleOffset) * animSx;
    const rY = radius * (1.0 - angleOffset * 0.5) * animSy;

    const { tr, bl } = getColors(stops, progress);
    const t3 = progress < 0.3 ? progress / 0.3 : 1.0;
    const edgeAlpha = t3 * t3;

    const gx1 = layerCx + rX * 0.7;
    const gy1 = layerCy - rY * 0.7;
    const gx2 = layerCx - rX * 0.7;
    const gy2 = layerCy + rY * 0.7;

    const grad = ctx.createLinearGradient(gx1, gy1, gx2, gy2);
    grad.addColorStop(0, `rgba(${tr[0]},${tr[1]},${tr[2]},${edgeAlpha})`);
    grad.addColorStop(1, `rgba(${bl[0]},${bl[1]},${bl[2]},${edgeAlpha})`);

    const blurAmount = progress < 0.15 ? (1.0 - progress / 0.15) * 20 : 0;
    if (blurAmount > 0) ctx.filter = `blur(${blurAmount}px)`;

    ctx.beginPath();
    ctx.ellipse(layerCx, layerCy, Math.max(rX, 1), Math.max(rY, 1), 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    if (blurAmount > 0) ctx.filter = "none";
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
      drawLayer(ctx, i, w, h, 1.0, 1.0);
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

    // Draw animated outer layers (0~39) — ellipse stretch animation
    const outerSx = 0.85 + 0.15 * Math.sin(t * 0.09 + seed * 0.5);
    const outerSy = 1.15 + 0.15 * Math.cos(t * 0.09 + seed * 0.5);
    const scaleStretch = Math.max(outerSx, outerSy) - 1.0;
    const stretchBlur = Math.max(0, scaleStretch) * 80;
    for (let i = 0; i < OUTER_COUNT; i++) {
      const layerT = 1.0 - i / OUTER_COUNT;
      const extraBlur = stretchBlur * layerT;
      if (extraBlur > 0) ctx.filter = `blur(${extraBlur}px)`;
      drawLayer(ctx, i, w, h, outerSx, outerSy);
      if (extraBlur > 0) ctx.filter = "none";
    }

    // Draw cached inner layers (40~149) with same breathing scale
    if (innerCacheRef.current) {
      const cx = w / 2;
      const cy = h / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(outerSx, outerSy);
      ctx.translate(-cx, -cy);
      ctx.drawImage(innerCacheRef.current, 0, 0, w, h);
      ctx.restore();
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
