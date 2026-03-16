"use client";

import { useEffect, useRef } from "react";

export type WaveVariant =
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

const COLOR_PRESETS: Record<WaveVariant, ColorScheme> = {
  portal: {
    color1: [0.69, 0.66, 0.78],
    color2: [0.31, 0.78, 0.63],
    color3: [0.16, 0.38, 0.91],
  },
  allThatNode: {
    color1: [0.47, 0.82, 0.72],
    color2: [0.41, 0.72, 0.82],
    color3: [0.50, 0.72, 0.85],
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
uniform vec2 u_resolution;
uniform float u_dpr;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;

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

// Low-octave fbm for very smooth, large shapes
float fbm2(vec3 p) {
  return snoise(p) * 0.6 + snoise(p * 2.0) * 0.3 + snoise(p * 4.0) * 0.1;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  float t = u_time * 0.06;

  // Very large scale, stretched vertically — curtain/swell shapes
  float sx = uv.x * aspect * 0.15;
  float sy = uv.y * 0.6;

  // Slow left → right flow
  float flow = t * 0.3;

  // 2-3 large sweeping curtain bands
  float swell1 = fbm2(vec3(sx - flow, sy, t * 0.08));
  float swell2 = fbm2(vec3(sx * 0.6 - flow * 0.7 + 4.0, sy * 0.8, t * 0.06));

  // Subtle edge warp — very gentle undulation
  float warp = snoise(vec3(sx * 0.3 - flow * 0.5, sy * 0.4, t * 0.05)) * 0.08;

  // Combined wave value
  float wave = swell1 * 0.6 + swell2 * 0.4 + warp;

  // Smooth gradient between 3 colors — large, soft transitions
  float blend1 = smoothstep(-0.3, 0.1, wave);
  float blend2 = smoothstep(-0.05, 0.3, wave);

  vec3 color = mix(u_color1, u_color2, blend1);
  color = mix(color, u_color3, blend2);

  // Subtle bright edge at major color transition
  float edge = smoothstep(0.0, 0.04, abs(wave - 0.0)) ;
  color += vec3((1.0 - edge) * 0.06);

  // Vertical stripes
  float cssX = gl_FragCoord.x / u_dpr;
  float stripePos = fract(cssX / 42.0);
  float bandGrad = pow(1.0 - stripePos, 2.0);
  float stripeFade = smoothstep(0.12, 0.88, uv.y);
  float colorDepth = 1.0 - dot(color, vec3(0.333));
  float reactivity = 0.2 + colorDepth * 0.8;
  float stripeEffect = bandGrad * 0.10 * stripeFade * reactivity;
  color = color + (vec3(1.0) - color) * stripeEffect;

  gl_FragColor = vec4(color, 1.0);
}
`;

interface WaveBackgroundProps {
  variant?: WaveVariant;
}

export default function WaveBackground({ variant = "stablecoin" }: WaveBackgroundProps) {
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
