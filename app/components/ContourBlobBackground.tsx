"use client";

import { useEffect, useRef } from "react";

export type ContourVariant =
  | "stablecoin"
  | "portal"
  | "allThatNode"
  | "walletHub"
  | "stakingHub"
  | "custody";

type RGB = [number, number, number];

interface ColorScheme {
  inner: RGB;
  mid1: RGB;
  mid2: RGB;
  mid3: RGB;
  outer: RGB;
  accent: RGB;
}

const COLOR_PRESETS: Record<ContourVariant, ColorScheme> = {
  portal: {
    inner: [0.25, 0.20, 0.70],
    mid1: [0.40, 0.25, 0.80],
    mid2: [0.20, 0.75, 0.80],
    mid3: [0.30, 0.90, 0.50],
    outer: [0.75, 0.92, 0.30],
    accent: [0.90, 0.25, 0.60],
  },
  allThatNode: {
    inner: [0.22, 0.25, 0.75],
    mid1: [0.50, 0.30, 0.85],
    mid2: [0.15, 0.80, 0.78],
    mid3: [0.20, 0.90, 0.45],
    outer: [0.80, 0.95, 0.25],
    accent: [0.95, 0.20, 0.55],
  },
  walletHub: {
    inner: [0.20, 0.30, 0.72],
    mid1: [0.30, 0.45, 0.82],
    mid2: [0.25, 0.70, 0.75],
    mid3: [0.35, 0.82, 0.60],
    outer: [0.60, 0.88, 0.40],
    accent: [0.85, 0.30, 0.55],
  },
  stablecoin: {
    inner: [0.22, 0.28, 0.78],
    mid1: [0.35, 0.40, 0.85],
    mid2: [0.20, 0.65, 0.82],
    mid3: [0.30, 0.80, 0.70],
    outer: [0.55, 0.85, 0.50],
    accent: [0.80, 0.35, 0.60],
  },
  stakingHub: {
    inner: [0.18, 0.22, 0.68],
    mid1: [0.28, 0.35, 0.78],
    mid2: [0.20, 0.60, 0.72],
    mid3: [0.40, 0.78, 0.55],
    outer: [0.70, 0.88, 0.35],
    accent: [0.88, 0.28, 0.50],
  },
  custody: {
    inner: [0.30, 0.18, 0.65],
    mid1: [0.50, 0.25, 0.75],
    mid2: [0.35, 0.55, 0.78],
    mid3: [0.25, 0.72, 0.68],
    outer: [0.50, 0.82, 0.45],
    accent: [0.82, 0.22, 0.65],
  },
};

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float u_time;
uniform float u_seed;
uniform vec2 u_resolution;
uniform float u_dpr;
uniform vec2 u_mouse;
uniform vec3 u_inner;
uniform vec3 u_mid1;
uniform vec3 u_mid2;
uniform vec3 u_mid3;
uniform vec3 u_outer;
uniform vec3 u_accent;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  // Responsive scale
  float cssWidth = u_resolution.x / u_dpr;
  float rScale = clamp(cssWidth / 1440.0, 0.5, 1.0);

  // Center coordinate system
  vec2 st = (uv - 0.5) * vec2(aspect, 1.0);

  // Mouse attract
  vec2 mouseST = (u_mouse - 0.5) * vec2(aspect, 1.0);
  float mouseDist = length(st - mouseST);
  vec2 attractDir = mouseST - st;
  float attractStr = exp(-mouseDist * mouseDist * 3.0) * 0.08;
  st += attractDir * attractStr;

  float t = u_time;

  // Blob center offset (gentle drift)
  vec2 blobCenter = vec2(
    sin(t * 0.06 + u_seed) * 0.05,
    cos(t * 0.05 + u_seed * 1.3) * 0.04
  );
  vec2 p = st - blobCenter;

  // Distance from blob center
  float dist = length(p);

  // Organic distortion via noise — makes the blob shape irregular
  float angle = atan(p.y, p.x);
  float noiseTime = t * 0.12 + u_seed;

  // Very low-frequency for smooth, rounded shape
  float distort = 0.0;
  distort += snoise(vec3(cos(angle) * 0.3, sin(angle) * 0.3, noiseTime)) * 0.08;
  distort += snoise(vec3(cos(angle * 2.0) * 0.2 + 3.0, sin(angle * 2.0) * 0.2, noiseTime * 0.7 + 5.0)) * 0.03;

  // Minimal spatial noise
  float spatialNoise = snoise(vec3(p * 0.6, noiseTime * 0.5)) * 0.015;

  // Effective distance with distortion, scaled by viewport
  float blobRadius = 0.45 * rScale;
  float d = (dist + spatialNoise) / (blobRadius + distort * rScale);

  // Continuous smooth gradient — no banding
  float bandNorm = clamp(d, 0.0, 1.0);

  // Color mapping: smooth spectrum from inner to outer
  vec3 color;
  if (bandNorm < 0.2) {
    color = mix(u_inner, u_mid1, bandNorm / 0.2);
  } else if (bandNorm < 0.4) {
    vec3 accentMix = mix(u_mid1, u_accent, smoothstep(0.2, 0.28, bandNorm));
    accentMix = mix(accentMix, u_mid2, smoothstep(0.28, 0.4, bandNorm));
    color = accentMix;
  } else if (bandNorm < 0.65) {
    color = mix(u_mid2, u_mid3, (bandNorm - 0.4) / 0.25);
  } else if (bandNorm < 0.9) {
    color = mix(u_mid3, u_outer, (bandNorm - 0.65) / 0.25);
  } else {
    color = u_outer;
  }

  // Vertical stripes
  float cssX = gl_FragCoord.x / u_dpr;
  float stripePos = fract(cssX / 42.0);
  float bandGrad = pow(1.0 - stripePos, 1.2);
  float colorDepth = 1.0 - dot(color, vec3(0.333));
  float reactivity = 0.25 + colorDepth * 0.75;
  float stripeEffect = bandGrad * 0.18 * reactivity;
  color = color + (vec3(1.0) - color) * stripeEffect;

  // Fade to white at outer edge
  float edgeFade = smoothstep(0.75, 1.1, d);
  color = mix(color, vec3(1.0), edgeFade);

  // Background white outside the blob
  float outerMask = smoothstep(1.0, 1.15, d);
  color = mix(color, vec3(1.0), outerMask);

  // Soft glow around the blob edge
  float glowDist = smoothstep(1.15, 0.85, d) * smoothstep(0.6, 0.85, d);
  vec3 glowColor = mix(u_outer, u_mid3, 0.5);
  color = mix(color, glowColor, glowDist * 0.15);

  // Mouse glow
  float mDist = length(uv - u_mouse);
  float mouseGlow = exp(-mDist * mDist * 5.0) * 0.20;
  vec3 mouseColor = mix(u_mid2, u_mid3, 0.5);
  float insideBlob = 1.0 - outerMask;
  color = mix(color, mouseColor * 1.3, mouseGlow * insideBlob);

  gl_FragColor = vec4(color, 1.0);
}
`;

interface ContourBlobBackgroundProps {
  variant?: ContourVariant;
}

export default function ContourBlobBackground({ variant = "allThatNode" }: ContourBlobBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);
  const colorsRef = useRef(COLOR_PRESETS[variant]);

  useEffect(() => {
    colorsRef.current = COLOR_PRESETS[variant];
  }, [variant]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    function createShader(gl: WebGLRenderingContext, type: number, source: string) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "a_position");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uSeed = gl.getUniformLocation(program, "u_seed");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uDpr = gl.getUniformLocation(program, "u_dpr");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uInner = gl.getUniformLocation(program, "u_inner");
    const uMid1 = gl.getUniformLocation(program, "u_mid1");
    const uMid2 = gl.getUniformLocation(program, "u_mid2");
    const uMid3 = gl.getUniformLocation(program, "u_mid3");
    const uOuter = gl.getUniformLocation(program, "u_outer");
    const uAccent = gl.getUniformLocation(program, "u_accent");

    const seed = Math.random() * 100;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
    }

    resize();
    window.addEventListener("resize", resize);

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current = [
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height,
      ];
    }
    window.addEventListener("mousemove", handleMouseMove);

    const startTime = performance.now();

    function render() {
      resize();
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.useProgram(program);

      gl!.enableVertexAttribArray(aPosition);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, positionBuffer);
      gl!.vertexAttribPointer(aPosition, 2, gl!.FLOAT, false, 0, 0);

      const dpr = Math.min(window.devicePixelRatio, 2);
      const colors = colorsRef.current;
      gl!.uniform1f(uTime, (performance.now() - startTime) / 1000);
      gl!.uniform1f(uSeed, seed);
      gl!.uniform2f(uResolution, canvas!.width, canvas!.height);
      gl!.uniform1f(uDpr, dpr);
      gl!.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);
      gl!.uniform3f(uInner, colors.inner[0], colors.inner[1], colors.inner[2]);
      gl!.uniform3f(uMid1, colors.mid1[0], colors.mid1[1], colors.mid1[2]);
      gl!.uniform3f(uMid2, colors.mid2[0], colors.mid2[1], colors.mid2[2]);
      gl!.uniform3f(uMid3, colors.mid3[0], colors.mid3[1], colors.mid3[2]);
      gl!.uniform3f(uOuter, colors.outer[0], colors.outer[1], colors.outer[2]);
      gl!.uniform3f(uAccent, colors.accent[0], colors.accent[1], colors.accent[2]);

      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
