"use client";

import { useEffect, useRef } from "react";

export type MetaballVariant =
  | "stablecoin"
  | "portal"
  | "allThatNode"
  | "walletHub"
  | "stakingHub"
  | "custody";

type RGB = [number, number, number];

interface ColorScheme {
  color1: RGB;
  color2: RGB;
  color3: RGB;
}

const COLOR_PRESETS: Record<MetaballVariant, ColorScheme> = {
  portal: {
    color1: [0.69, 0.66, 0.78],
    color2: [0.31, 0.78, 0.63],
    color3: [0.16, 0.38, 0.91],
  },
  allThatNode: {
    color1: [0.20, 0.40, 0.88],
    color2: [0.30, 0.70, 0.90],
    color3: [0.70, 0.85, 0.30],
  },
  walletHub: {
    color1: [0.44, 0.82, 0.78],
    color2: [0.41, 0.69, 0.82],
    color3: [0.50, 0.72, 0.85],
  },
  stablecoin: {
    color1: [0.56, 0.75, 0.88],
    color2: [0.47, 0.69, 0.85],
    color3: [0.50, 0.75, 0.82],
  },
  stakingHub: {
    color1: [0.28, 0.47, 0.85],
    color2: [0.38, 0.72, 0.78],
    color3: [0.55, 0.78, 0.44],
  },
  custody: {
    color1: [0.75, 0.50, 0.69],
    color2: [0.40, 0.69, 0.72],
    color3: [0.50, 0.58, 0.82],
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
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec2 u_mouse;

// Simplex noise
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

// Metaball field: returns influence at point p from a blob at center c with radius r
float metaball(vec2 p, vec2 c, float r) {
  float d = length(p - c);
  return r * r / (d * d + 0.001);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 st = vec2(uv.x * aspect, uv.y);

  // Mouse attract
  vec2 mouseST = vec2(u_mouse.x * aspect, u_mouse.y);
  float mouseDist = length(st - mouseST);
  vec2 attractDir = mouseST - st;
  float attractStr = exp(-mouseDist * mouseDist * 2.5) * 0.12;
  st += attractDir * attractStr;

  float t = u_time;
  float halfAspect = aspect * 0.5;

  // Organic shape distortion via noise
  float noiseScale = 1.2;
  float noiseTime = t * 0.25 + u_seed;

  // Main blob — stays near center, minimum radius 0.35
  vec2 c1 = vec2(
    halfAspect + sin(t * 0.08 + u_seed) * 0.08 * aspect,
    0.5 + cos(t * 0.07 + u_seed * 1.3) * 0.06
  );
  float r1 = 0.38 + 0.06 * sin(t * 0.15 + u_seed);

  // Sub blob 1 — orbits more freely
  vec2 c2 = vec2(
    halfAspect + sin(t * 0.15 + u_seed * 2.1) * 0.40 * aspect,
    0.5 + cos(t * 0.12 + u_seed * 1.7) * 0.35
  );
  float r2 = 0.22 + 0.07 * sin(t * 0.18 + u_seed * 3.0);

  // Sub blob 2 — different orbit
  vec2 c3 = vec2(
    halfAspect + cos(t * 0.12 + u_seed * 3.5) * 0.35 * aspect,
    0.5 + sin(t * 0.14 + u_seed * 2.8) * 0.32
  );
  float r3 = 0.19 + 0.06 * cos(t * 0.16 + u_seed * 4.0);

  // Organic shape distortion — warp the sampling point per-blob
  vec2 warp1 = vec2(
    snoise(vec3(st * noiseScale, noiseTime)),
    snoise(vec3(st * noiseScale + 5.0, noiseTime + 3.0))
  ) * 0.25;
  vec2 warp2 = vec2(
    snoise(vec3(st * noiseScale * 1.3 + 10.0, noiseTime * 1.2)),
    snoise(vec3(st * noiseScale * 1.3 + 15.0, noiseTime * 1.2 + 3.0))
  ) * 0.20;

  // Metaball field with warped positions
  float field = 0.0;
  field += metaball(st + warp1, c1, r1);
  field += metaball(st + warp1 * 0.8 + warp2 * 0.2, c2, r2);
  field += metaball(st + warp2, c3, r3);

  // Threshold for blob boundary
  float threshold = 1.0;
  float blobMask = smoothstep(threshold * 0.6, threshold * 1.4, field);

  // Color gradient based on position within the field
  float colorMix = snoise(vec3(st * 0.7 + vec2(u_seed * 2.0), t * 0.04)) * 0.5 + 0.5;
  vec3 blobColor = mix(u_color1, u_color2, smoothstep(0.0, 0.5, colorMix));
  blobColor = mix(blobColor, u_color3, smoothstep(0.4, 1.0, colorMix));

  // Add subtle variation based on which blob is dominant
  float b1 = metaball(st + warp1, c1, r1);
  float b2 = metaball(st + warp1 * 0.8 + warp2 * 0.2, c2, r2);
  float b3 = metaball(st + warp2, c3, r3);
  float total = b1 + b2 + b3 + 0.001;
  vec3 weightedColor = (u_color1 * b1 + u_color2 * b2 + u_color3 * b3) / total;
  blobColor = mix(blobColor, weightedColor, 0.4);

  // Edge fade to white (vignette)
  vec2 center = vec2(0.5, 0.5);
  float vignetteDist = length(uv - center);
  float vignette = smoothstep(0.25, 0.75, vignetteDist);

  // Vertical stripes
  float cssX = gl_FragCoord.x / u_dpr;
  float stripePos = fract(cssX / 42.0);
  float bandGrad = pow(1.0 - stripePos, 1.2);
  float colorDepth = 1.0 - dot(blobColor, vec3(0.333));
  float reactivity = 0.25 + colorDepth * 0.75;
  float stripeEffect = bandGrad * 0.15 * reactivity * blobMask;

  // Compose: blob on white background with edge fade
  vec3 bg = vec3(1.0);
  vec3 color = mix(bg, blobColor, blobMask * (1.0 - vignette * 0.8));
  color = color + (vec3(1.0) - color) * stripeEffect;

  // Mouse glow
  float mDist = length(uv - u_mouse);
  float mouseGlow = exp(-mDist * mDist * 4.0) * 0.30;
  color = mix(color, blobColor * 1.2, mouseGlow * blobMask);

  gl_FragColor = vec4(color, 1.0);
}
`;

interface MetaballBackgroundProps {
  variant?: MetaballVariant;
}

export default function MetaballBackground({ variant = "stablecoin" }: MetaballBackgroundProps) {
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
    const uColor1 = gl.getUniformLocation(program, "u_color1");
    const uColor2 = gl.getUniformLocation(program, "u_color2");
    const uColor3 = gl.getUniformLocation(program, "u_color3");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

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
      gl!.uniform3f(uColor1, colors.color1[0], colors.color1[1], colors.color1[2]);
      gl!.uniform3f(uColor2, colors.color2[0], colors.color2[1], colors.color2[2]);
      gl!.uniform3f(uColor3, colors.color3[0], colors.color3[1], colors.color3[2]);
      gl!.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);

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
