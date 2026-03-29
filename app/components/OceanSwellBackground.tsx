"use client";

import { useEffect, useRef, useState, useCallback } from "react";

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
uniform vec2 u_mouse;

// Simplex 3D noise for organic perturbation
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

// FBM for organic shapes
float fbm(vec3 p) {
  return snoise(p) * 0.5 + snoise(p * 2.1) * 0.3 + snoise(p * 4.3) * 0.15 + snoise(p * 8.1) * 0.05;
}

// Curtain: blue flowing down from top, with organic bottom edge
// x_center: horizontal center (0-1 in UV), x_width: horizontal spread
// drop_height: how far down it reaches (0=top, 1=bottom) in screen coords
// Returns intensity 0.0-1.0
float curtain(vec2 uv, float x_center, float x_width, float drop_height, float t, float seed, float aspect) {
  // Horizontal falloff: gaussian centered at x_center
  float dx = (uv.x - x_center) / x_width;
  float hFalloff = exp(-dx * dx * 2.0);

  // Bottom edge: organic, noise-deformed boundary
  float vy = 1.0 - uv.y; // 0=top, 1=bottom
  float bottomEdge = drop_height
    + snoise(vec3(uv.x * aspect * 0.8, seed * 3.0, t * 0.02)) * 0.12
    + snoise(vec3(uv.x * aspect * 1.6, seed * 7.0, t * 0.015)) * 0.06
    + sin(uv.x * aspect * 1.2 + t * 0.04 + seed) * 0.05;

  // Vertical mask: full strength from top, fades at bottom edge
  float vMask = 1.0 - smoothstep(bottomEdge - 0.08, bottomEdge + 0.12, vy);

  return hFalloff * vMask;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  float vy = 1.0 - uv.y; // 0=top, 1=bottom
  float t = u_time + u_seed;

  // --- Color palette ---
  vec3 deepBlue   = vec3(0.004, 0.306, 0.925);  // #014EEC
  vec3 midBlue    = vec3(0.16, 0.44, 1.0);       // #296FFF
  vec3 lightBlue  = vec3(0.55, 0.72, 1.0);
  vec3 paleCyan   = vec3(0.82, 0.92, 0.98);
  vec3 white      = vec3(1.0);

  // --- Base: LIGHT gradient (light blue top → white bottom) ---
  // The blue comes from the curtains, not the base
  vec3 color = mix(lightBlue, white, smoothstep(0.0, 0.7, vy));

  // --- 5 curtain shapes flowing down from top ---
  // Each curtain is a stream of blue dripping from the top edge

  // Curtain 1: wide, left-center, deep drop — main mass
  float c1 = curtain(uv, 0.35, 0.35, 0.55 + sin(t * 0.02) * 0.03, t, u_seed, aspect);
  color = mix(color, deepBlue, c1 * 0.85);

  // Curtain 2: right side, medium drop
  float c2 = curtain(uv, 0.72, 0.30, 0.50 + cos(t * 0.018) * 0.04, t, u_seed + 20.0, aspect);
  color = mix(color, deepBlue, c2 * 0.80);

  // Curtain 3: center, drops lower — the prominent tongue of blue
  float c3 = curtain(uv, 0.55, 0.25, 0.65 + sin(t * 0.025) * 0.03, t, u_seed + 40.0, aspect);
  color = mix(color, midBlue, c3 * 0.75);

  // Curtain 4: far left, shallow
  float c4 = curtain(uv, 0.12, 0.20, 0.40 + cos(t * 0.015) * 0.03, t, u_seed + 60.0, aspect);
  color = mix(color, deepBlue, c4 * 0.70);

  // Curtain 5: far right edge, medium
  float c5 = curtain(uv, 0.90, 0.22, 0.45 + sin(t * 0.022) * 0.04, t, u_seed + 80.0, aspect);
  color = mix(color, midBlue, c5 * 0.65);

  // --- Top reinforcement: solid deep blue at very top ---
  float topCap = smoothstep(0.12, 0.0, vy);
  color = mix(color, deepBlue, topCap);

  // --- Subtle depth noise for organic texture ---
  float depthNoise = fbm(vec3(uv.x * aspect * 0.6, vy * 0.5, t * 0.008 + u_seed * 3.0));
  float blueness = max(c1, max(c2, max(c3, max(c4, c5))));
  color += deepBlue * depthNoise * 0.06 * blueness;

  // --- Bottom: gentle cyan wash ---
  float bottomWash = smoothstep(0.6, 0.9, vy) * (1.0 - blueness);
  color = mix(color, paleCyan, bottomWash * 0.3);

  // --- Mouse interaction: blue-tint ripple ---
  float mDist = length(gl_FragCoord.xy / u_resolution - u_mouse);
  float mouseGlow = exp(-mDist * mDist * 4.0) * 0.12;
  color = mix(color, midBlue, mouseGlow);

  gl_FragColor = vec4(color, 1.0);
}
`;

interface OceanSwellBackgroundProps {
  onWebGLFail?: () => void;
}

export default function OceanSwellBackground({ onWebGLFail }: OceanSwellBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);
  const [webglOk, setWebglOk] = useState(true);

  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) {
      setWebglOk(false);
      onWebGLFail?.();
      return null;
    }

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
    if (!vs || !fs) {
      setWebglOk(false);
      onWebGLFail?.();
      return null;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      setWebglOk(false);
      onWebGLFail?.();
      return null;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), gl.STATIC_DRAW);

    return { gl, program, vs, fs, positionBuffer };
  }, [onWebGLFail]);

  useEffect(() => {
    const resources = initWebGL();
    if (!resources) return;

    const { gl, program, vs, fs, positionBuffer } = resources;
    const canvas = canvasRef.current!;

    const aPosition = gl.getAttribLocation(program, "a_position");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uSeed = gl.getUniformLocation(program, "u_seed");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

    const seed = Math.random() * 100;

    // ResizeObserver instead of resize() per frame
    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
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

    function render() {
      if (!canvas || !gl) return;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);

      gl.enableVertexAttribArray(aPosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(uTime, (performance.now() - startTime) / 1000);
      gl.uniform1f(uSeed, seed);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      gl.deleteProgram(program);
      gl.deleteBuffer(positionBuffer);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [initWebGL]);

  if (!webglOk) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
