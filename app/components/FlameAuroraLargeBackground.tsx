"use client";

import { useEffect, useRef, useCallback } from "react";

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;

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

// fbm removed for performance

// Flame-like blob: a wide soft shape with large-scale animated distortion
float flameBlob(vec2 uv, float cx, float width, float dropBase, float t, float seed, float aspect) {
  // Wide horizontal falloff
  float dx = (uv.x - cx) / width;
  float hFalloff = exp(-dx * dx * 1.2);

  float vy = 1.0 - uv.y; // 0=top, 1=bottom

  // Large-scale flame distortion (2 octaves + sin for performance)
  vec2 flameUV = vec2(uv.x * aspect, vy);
  float edge = dropBase
    + snoise(vec3(flameUV.x * 0.3, seed * 3.0, t * 0.25)) * 0.32
    + snoise(vec3(flameUV.x * 0.6, seed * 7.0 + vy * 0.2, t * 0.35)) * 0.22
    + sin(flameUV.x * 0.8 + t * 0.40 + seed) * 0.08;

  // Wide transition zone for soft, sweeping flame edge (extra blur at bottom)
  float vMask = 1.0 - smoothstep(edge - 0.18, edge + 0.65, vy);

  return hFalloff * vMask;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  float vy = 1.0 - uv.y;
  float t = u_time;

  // --- 3-color gradient layer: c1 (top) → c2 (mid) → c3 (bottom) ---
  vec3 grad = mix(u_c1, u_c2, smoothstep(0.0, 0.45, vy));
  grad = mix(grad, u_c3, smoothstep(0.45, 0.9, vy));

  // --- 5 flame blobs: mountain shape (center tall, edges short, wider coverage) ---
  float b1 = flameBlob(uv, 0.02 + sin(t * 0.04) * 0.06, 0.28, 0.20 + sin(t * 0.07) * 0.10, t, 1.0, aspect);
  float b2 = flameBlob(uv, 0.98 + cos(t * 0.045) * 0.06, 0.28, 0.18 + cos(t * 0.06) * 0.10, t, 30.0, aspect);
  float b3 = flameBlob(uv, 0.48 + sin(t * 0.07 + 2.0) * 0.10, 0.34, 0.50 + sin(t * 0.11 + 3.0) * 0.16, t, 60.0, aspect);
  float b4 = flameBlob(uv, 0.24 + cos(t * 0.05 + 0.5) * 0.08, 0.30, 0.30 + cos(t * 0.09 + 0.8) * 0.14, t, 90.0, aspect);
  float b5 = flameBlob(uv, 0.76 + sin(t * 0.048 + 1.5) * 0.08, 0.30, 0.28 + sin(t * 0.10 + 2.0) * 0.14, t, 120.0, aspect);

  // --- Combined blueness as single organism (additive) ---
  float blueness = clamp(b1 + b2 + b3 + b4 + b5, 0.0, 1.0);

  // --- Base: light gradient background ---
  vec3 white = vec3(1.0);
  vec3 color = mix(u_c3, white, smoothstep(0.0, 0.75, vy));

  // --- Mix blob gradient into base using blueness ---
  color = mix(color, grad, blueness);

  // --- Flame flicker: global brightness pulse ---
  float flicker = 0.96 + 0.04 * snoise(vec3(uv.x * aspect * 0.5, vy * 0.3, t * 2.2));
  color *= mix(1.0, flicker, blueness);

  // --- Mouse glow ---
  float mDist = length(gl_FragCoord.xy / u_resolution - u_mouse);
  float mouseGlow = exp(-mDist * mDist * 5.0) * 0.10;
  color = mix(color, u_c3, mouseGlow);

  gl_FragColor = vec4(color, 1.0);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

interface FlameAuroraLargeProps {
  /** 3 hex colors: [0] top/deepest, [1] mid, [2] bottom/lightest */
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = ["#0A0A0A", "#0A0AAF", "#154AC9"];

export default function FlameAuroraLargeBackground({ colors = DEFAULT_COLORS, className }: FlameAuroraLargeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);
  const colorsRef = useRef(colors);
  colorsRef.current = colors;

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return null;

    function createShader(type: number, source: string) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return null;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return null;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    return { gl, program, vs, fs, positionBuffer };
  }, []);

  useEffect(() => {
    const resources = initWebGL();
    if (!resources) return;

    const { gl, program, vs, fs, positionBuffer } = resources;
    const canvas = canvasRef.current!;

    const aPosition = gl.getAttribLocation(program, "a_position");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uC1 = gl.getUniformLocation(program, "u_c1");
    const uC2 = gl.getUniformLocation(program, "u_c2");
    const uC3 = gl.getUniformLocation(program, "u_c3");

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
    }

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(canvas);

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = [
        (e.clientX - rect.left) / rect.width,
        1.0 - (e.clientY - rect.top) / rect.height,
      ];
    }
    function handleMouseLeave() {
      mouseRef.current = [0.5, 0.5];
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const startTime = performance.now();
    let isVisible = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !rafRef.current) {
          rafRef.current = requestAnimationFrame(render);
        }
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    function render() {
      if (!canvas || !gl || !isVisible) {
        rafRef.current = 0;
        return;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);

      gl.enableVertexAttribArray(aPosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(uTime, (performance.now() - startTime) / 1000);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);

      const c = colorsRef.current;
      const c1 = hexToRgb(c[0] || DEFAULT_COLORS[0]);
      const c2 = hexToRgb(c[1] || DEFAULT_COLORS[1]);
      const c3 = hexToRgb(c[2] || DEFAULT_COLORS[2]);
      gl.uniform3f(uC1, c1[0], c1[1], c1[2]);
      gl.uniform3f(uC2, c2[0], c2[1], c2[2]);
      gl.uniform3f(uC3, c3[0], c3[1], c3[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      gl.deleteProgram(program);
      gl.deleteBuffer(positionBuffer);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [initWebGL]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className || ""}`}
      style={{ display: "block" }}
    />
  );
}
