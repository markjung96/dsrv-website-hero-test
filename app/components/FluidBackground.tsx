"use client";

import { useEffect, useRef } from "react";

export type FluidVariant =
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

const COLOR_PRESETS: Record<FluidVariant, ColorScheme> = {
  stablecoin: {
    color1: [0.314, 0.561, 0.827], // #508FD3
    color2: [0.184, 0.290, 0.894], // #2F4AE4
    color3: [0.231, 0.357, 0.996], // #3B5BFE
  },
  portal: {
    color1: [0.32, 0.72, 0.90],  // bright cyan
    color2: [0.22, 0.48, 0.88],  // blue
    color3: [0.16, 0.34, 0.78],  // deep blue
  },
  allThatNode: {
    color1: [0.20, 0.78, 0.45],  // vivid green
    color2: [0.18, 0.68, 0.72],  // teal
    color3: [0.22, 0.45, 0.85],  // blue
  },
  walletHub: {
    color1: [0.20, 0.78, 0.50],  // vivid green
    color2: [0.15, 0.70, 0.75],  // cyan
    color3: [0.24, 0.46, 0.82],  // blue
  },
  stakingHub: {
    color1: [0.22, 0.40, 0.88],  // blue
    color2: [0.20, 0.65, 0.82],  // cyan
    color3: [0.30, 0.72, 0.48],  // green
  },
  custody: {
    color1: [0.75, 0.42, 0.70],  // vivid pink/mauve
    color2: [0.35, 0.45, 0.85],  // blue
    color3: [0.30, 0.75, 0.68],  // teal/mint
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
uniform vec2 u_resolution;
uniform float u_dpr;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;

// --- Simplex 3D noise (Ashima Arts) ---
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
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 st = vec2(uv.x * aspect, uv.y);

  float t = u_time * 0.12;

  // Cyclic time offsets — prevents drift that causes color to fill the screen
  float cx1 = sin(t * 0.31) * 0.6;
  float cy1 = cos(t * 0.23) * 0.6;
  float cx2 = sin(t * 0.19 + 2.0) * 0.6;
  float cy2 = cos(t * 0.37 + 3.0) * 0.6;
  float cz  = sin(t * 0.11) * 0.4;
  float cz2 = cos(t * 0.08 + 5.0) * 0.4;

  // Domain warping with cyclic movement
  float warp1 = fbm(vec3(st * 0.4 + vec2(cx1, cy1), cz));
  float warp2 = fbm(vec3(st * 0.4 + vec2(cx2, cy2), cz2));
  vec2 warped = st + vec2(warp1, warp2) * 0.3;

  float n1 = fbm(vec3(warped * 0.5 + vec2(sin(t * 0.17) * 0.5, cos(t * 0.13) * 0.5), sin(t * 0.09) * 0.3));
  float n2 = fbm(vec3(warped * 0.35 + vec2(cos(t * 0.14 + 1.0) * 0.5, sin(t * 0.21 + 2.0) * 0.5), cos(t * 0.07) * 0.3 + 10.0));

  float n = n1 * 0.6 + n2 * 0.4;

  float edgeFade = smoothstep(0.0, 0.03, uv.x) * smoothstep(0.0, 0.02, uv.y)
                 * smoothstep(0.0, 0.03, 1.0 - uv.x) * smoothstep(0.0, 0.04, 1.0 - uv.y);

  float intensity = smoothstep(-0.5, 0.15, n) * edgeFade;
  intensity = pow(intensity, 0.45);

  vec3 white = vec3(1.0);

  float colorMix = smoothstep(-0.1, 0.35, n2 + warp1 * 0.3);
  vec3 tinted = mix(u_color1, mix(u_color2, u_color3, colorMix), smoothstep(0.2, 0.7, intensity));
  vec3 color = mix(white, tinted, clamp(intensity, 0.0, 1.0));

  // Vertical stripes — each band has a gradient from bright edge to transparent center
  float cssX = gl_FragCoord.x / u_dpr;
  float stripeWidth = 42.0;
  float stripePos = fract(cssX / stripeWidth);

  float bandGrad = 1.0 - stripePos;
  bandGrad = pow(bandGrad, 2.0);

  float stripeFade = smoothstep(0.12, 0.88, uv.y);

  float colorDepth = 1.0 - dot(color, vec3(0.333));
  float reactivity = 0.2 + colorDepth * 0.8;

  float stripeEffect = bandGrad * 0.12 * stripeFade * reactivity;
  color = color + (vec3(1.0) - color) * stripeEffect;

  gl_FragColor = vec4(color, 1.0);
}
`;

interface FluidBackgroundProps {
  variant?: FluidVariant;
}

export default function FluidBackground({ variant = "stablecoin" }: FluidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
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
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uDpr = gl.getUniformLocation(program, "u_dpr");
    const uColor1 = gl.getUniformLocation(program, "u_color1");
    const uColor2 = gl.getUniformLocation(program, "u_color2");
    const uColor3 = gl.getUniformLocation(program, "u_color3");

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
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
      const colors = colorsRef.current;
      gl!.uniform1f(uTime, (performance.now() - startTime) / 1000);
      gl!.uniform2f(uResolution, canvas!.width, canvas!.height);
      gl!.uniform1f(uDpr, dpr);
      gl!.uniform3f(uColor1, colors.color1[0], colors.color1[1], colors.color1[2]);
      gl!.uniform3f(uColor2, colors.color2[0], colors.color2[1], colors.color2[2]);
      gl!.uniform3f(uColor3, colors.color3[0], colors.color3[1], colors.color3[2]);

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
