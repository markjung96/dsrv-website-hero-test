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

float fbm(vec3 p) {
  return snoise(p) * 0.5 + snoise(p * 2.1) * 0.3 + snoise(p * 4.3) * 0.15 + snoise(p * 8.1) * 0.05;
}

// Flame-like blob: a wide soft shape with large-scale animated distortion
float flameBlob(vec2 uv, float cx, float width, float dropBase, float t, float seed, float aspect) {
  // Wide horizontal falloff
  float dx = (uv.x - cx) / width;
  float hFalloff = exp(-dx * dx * 1.2);

  float vy = 1.0 - uv.y; // 0=top, 1=bottom

  // Large-scale flame distortion: low freq = big sweep, high amp, faster speed
  vec2 flameUV = vec2(uv.x * aspect, vy);
  float edge = dropBase
    + snoise(vec3(flameUV.x * 0.3, seed * 3.0, t * 0.25)) * 0.28
    + snoise(vec3(flameUV.x * 0.6, seed * 7.0 + vy * 0.2, t * 0.35)) * 0.18
    + snoise(vec3(flameUV.x * 1.2, seed * 11.0, t * 0.55)) * 0.10
    + sin(flameUV.x * 0.8 + t * 0.40 + seed) * 0.08;

  // Wide transition zone for soft, sweeping flame edge
  float vMask = 1.0 - smoothstep(edge - 0.12, edge + 0.22, vy);

  return hFalloff * vMask;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  float vy = 1.0 - uv.y;
  float t = u_time;

  // --- Color palette (Figma: #014EEC, #2569F4, #3932B0) ---
  vec3 deepBlue  = vec3(0.004, 0.306, 0.925);  // #014EEC
  vec3 midBlue   = vec3(0.145, 0.412, 0.957);  // #2569F4
  vec3 indigo    = vec3(0.224, 0.196, 0.690);  // #3932B0
  vec3 lightBlue = vec3(0.40, 0.58, 0.95);
  vec3 paleCyan  = vec3(0.70, 0.85, 0.96);
  vec3 white     = vec3(1.0);

  // --- Base: gradient background (starts deeper) ---
  vec3 color = mix(midBlue, white, smoothstep(0.0, 0.75, vy));

  // --- 3 wide flame blobs flowing from top ---

  // Blob 1: left peak — drifts right as it drops
  float b1 = flameBlob(uv, 0.18 + sin(t * 0.06) * 0.08, 0.25, 0.32 + sin(t * 0.08) * 0.18, t, 1.0, aspect);
  color = mix(color, deepBlue, b1 * 0.92);

  // Blob 2: right peak — drifts left (counter to B1)
  float b2 = flameBlob(uv, 0.80 + cos(t * 0.055 + 1.0) * 0.08, 0.22, 0.28 + cos(t * 0.08 + 1.5) * 0.18, t, 30.0, aspect);
  color = mix(color, mix(deepBlue, indigo, 0.3), b2 * 0.88);

  // Blob 3: center tongue — sways side to side
  float b3 = flameBlob(uv, 0.48 + sin(t * 0.07 + 2.0) * 0.10, 0.22, 0.42 + sin(t * 0.11 + 3.0) * 0.16, t, 60.0, aspect);
  color = mix(color, midBlue, b3 * 0.82);

  // Blob 4: left-center — drifts gently
  float b4 = flameBlob(uv, 0.35 + cos(t * 0.05 + 0.5) * 0.06, 0.18, 0.25 + cos(t * 0.09 + 0.8) * 0.12, t, 90.0, aspect);
  color = mix(color, deepBlue, b4 * 0.75);

  // Blob 5: right-center — drifts gently
  float b5 = flameBlob(uv, 0.65 + sin(t * 0.048 + 1.5) * 0.06, 0.18, 0.22 + sin(t * 0.10 + 2.0) * 0.12, t, 120.0, aspect);
  color = mix(color, midBlue, b5 * 0.72);

  // --- Top reinforcement: solid deep blue cap (wider) ---
  float topCap = smoothstep(0.18, 0.0, vy);
  color = mix(color, deepBlue, topCap);

  // --- Flame flicker: global brightness pulse ---
  float blueness = max(b1, max(b2, max(b3, max(b4, b5))));

  // --- Indigo depth layer across blue areas ---
  color = mix(color, indigo, blueness * 0.20);
  float flicker = 0.96 + 0.04 * snoise(vec3(uv.x * aspect * 0.5, vy * 0.3, t * 2.2));
  color *= mix(1.0, flicker, blueness);

  // --- Organic depth texture ---
  float depth = fbm(vec3(uv.x * aspect * 0.7, vy * 0.4, t * 0.012));
  color += deepBlue * depth * 0.05 * blueness;

  // --- Bottom cyan wash ---
  float bottomWash = smoothstep(0.6, 0.9, vy) * (1.0 - blueness);
  color = mix(color, paleCyan, bottomWash * 0.25);

  // --- Mouse glow ---
  float mDist = length(gl_FragCoord.xy / u_resolution - u_mouse);
  float mouseGlow = exp(-mDist * mDist * 5.0) * 0.08;
  color = mix(color, midBlue, mouseGlow);

  gl_FragColor = vec4(color, 1.0);
}
`;

export default function FlameAuroraOriginalLargeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);

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

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
