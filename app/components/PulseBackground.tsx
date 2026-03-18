"use client";

import { useEffect, useRef } from "react";

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

// Blob shape — same as Bubble, slow morph only
float morphBlob(vec2 st, vec2 center, vec2 radii, float t, float seed) {
  vec2 delta = st - center;
  float dist = length(delta / radii);
  float angle = atan(delta.y, delta.x);

  float a2 = 0.18 + 0.08 * sin(t * 0.15 + seed);
  float a3 = 0.12 + 0.05 * cos(t * 0.12 + seed * 1.5);
  float a4 = 0.05 + 0.025 * sin(t * 0.1 + seed * 2.0);

  float r_mod = a2 * sin(2.0 * angle + t * 0.2 + seed)
              + a3 * sin(3.0 * angle + t * 0.15 + seed * 1.7)
              + a4 * sin(4.0 * angle + t * 0.18 + seed * 0.8);

  float boundary = 1.0 + r_mod;
  float d = dist / boundary;

  float inner = smoothstep(1.05, 0.55, d);
  float outer = smoothstep(1.25, 0.7, d);
  return mix(outer * 0.25, 1.0, inner);
}

// Heartbeat: lub-dub with organic timing variation
float heartbeat(float t, float seed) {
  // Resting heartbeat ~2.2s cycle, gentle drift ±0.15s
  float basePeriod = 2.2;
  float drift = sin(t * 0.25 + seed) * 0.08 + sin(t * 0.17 + seed * 2.1) * 0.07;
  float period = basePeriod + drift;

  float cycle = mod(t + seed * 3.7, period);

  // Lub (moderate, smooth attack)
  float lub = exp(-cycle * 8.0) * 0.7;
  // Dub (soft follow-up ~0.28s later)
  float dubDelay = 0.28 + sin(t * 0.15 + seed * 1.3) * 0.02;
  float dub = exp(-max(cycle - dubDelay, 0.0) * 10.0) * 0.4;

  return max(lub, dub);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  float tReal = u_time;
  float tSlow = u_time * 0.1 + u_seed;

  // === HEARTBEAT THUMP ===
  float thump = heartbeat(tReal, u_seed);

  // Zoom toward screen center — whole scene briefly scales up
  float zoom = 1.0 - thump * 0.07;
  vec2 screenCenter = vec2(0.5, 0.5);
  uv = (uv - screenCenter) * zoom + screenCenter;

  vec2 st = vec2(uv.x * aspect, uv.y);

  // Main blob — FIXED center, slow morph (same as Bubble)
  vec2 c1 = vec2(0.46 * aspect, 0.48);
  float blob1 = morphBlob(st, c1, vec2(0.55, 0.38), tSlow, u_seed);

  // Secondary blob — drifts around slowly
  vec2 c2Base = vec2(0.85 * aspect, 0.38);
  vec2 c2 = c2Base + vec2(
    sin(u_time * 0.04 + u_seed * 1.7) * 0.12 * aspect,
    cos(u_time * 0.03 + u_seed * 2.3) * 0.1
  );
  float blob2 = morphBlob(st, c2, vec2(0.18, 0.20), tSlow + 5.0, u_seed + 10.0);

  float field = max(blob1, blob2 * 0.8);

  // Color: multi-zone gradient from Figma palette
  float tColor = u_time * 0.05 + u_seed * 3.0;
  vec2 seedOff = vec2(u_seed * 5.0, u_seed * 3.7);
  float n1 = snoise(vec3(st * 1.1 + seedOff, tColor)) * 0.5 + 0.5;
  float n2 = snoise(vec3(st * 2.5 + seedOff * 0.7 + 5.0, tColor * 1.5 + 8.0));
  float colorVal = clamp(n1 + n2 * 0.15, 0.0, 1.0);

  vec3 mintGreen = vec3(0.45, 0.82, 0.68);
  vec3 lightCyan = vec3(0.52, 0.78, 0.92);
  vec3 skyBlue   = vec3(0.40, 0.65, 0.90);
  vec3 medBlue   = vec3(0.28, 0.50, 0.87);
  vec3 deepBlue  = vec3(0.20, 0.38, 0.80);

  vec3 blobColor = mix(mintGreen, lightCyan, smoothstep(0.0, 0.25, colorVal));
  blobColor = mix(blobColor, skyBlue, smoothstep(0.20, 0.45, colorVal));
  blobColor = mix(blobColor, medBlue, smoothstep(0.40, 0.65, colorVal));
  blobColor = mix(blobColor, deepBlue, smoothstep(0.65, 1.0, colorVal));

  // Stripe grid — distance from nearest separator line
  float cssX = gl_FragCoord.x / u_dpr;
  float stripePos = fract(cssX / 42.0);
  float distFromLine = min(stripePos, 1.0 - stripePos);
  float thinLine = 1.0 - smoothstep(0.0, 0.04, distFromLine);

  // Near blob edge: color fades based on distance from separator line
  float edgeProximity = 1.0 - smoothstep(0.12, 0.4, field);
  float distFade = smoothstep(0.0, 0.5, distFromLine);
  float fieldReduction = distFade * edgeProximity * 0.18;
  float finalField = field - fieldReduction;

  float alpha = smoothstep(0.0, 0.65, finalField) * 0.88;

  vec3 bg = vec3(0.93);
  vec3 color = mix(bg, blobColor, alpha);

  // Thump brightness boost
  color = mix(color, blobColor * 1.2, thump * alpha * 0.4);

  // Separator lines: subtle white tint
  float lineWhite = thinLine * smoothstep(0.05, 0.35, field) * 0.13;
  color = mix(color, bg, lineWhite);

  gl_FragColor = vec4(color, 1.0);
}
`;

export default function PulseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

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
    const seed = Math.random() * 100;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas!.width = canvas!.clientWidth * dpr;
      canvas!.height = canvas!.clientHeight * dpr;
    }

    resize();
    window.addEventListener("resize", resize);
    const startTime = performance.now();

    function render() {
      resize();
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.useProgram(program);
      gl!.enableVertexAttribArray(aPosition);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, positionBuffer);
      gl!.vertexAttribPointer(aPosition, 2, gl!.FLOAT, false, 0, 0);
      const dpr = Math.min(window.devicePixelRatio, 2);
      gl!.uniform1f(uTime, (performance.now() - startTime) / 1000);
      gl!.uniform1f(uSeed, seed);
      gl!.uniform2f(uResolution, canvas!.width, canvas!.height);
      gl!.uniform1f(uDpr, dpr);
      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
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
