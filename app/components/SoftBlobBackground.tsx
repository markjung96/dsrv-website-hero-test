"use client";

import { useEffect, useRef } from "react";

export type SoftBlobVariant =
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
}

const COLOR_PRESETS: Record<SoftBlobVariant, ColorScheme> = {
  portal: {
    color1: [0.0, 0.33, 1.0],
    color2: [0.70, 0.40, 0.92],
  },
  allThatNode: {
    color1: [0.20, 0.40, 0.88],
    color2: [0.70, 0.85, 0.30],
  },
  walletHub: {
    color1: [0.44, 0.82, 0.78],
    color2: [0.50, 0.72, 0.85],
  },
  stablecoin: {
    color1: [0.23, 0.37, 0.96],
    color2: [0.50, 0.75, 0.82],
  },
  stakingHub: {
    color1: [0.28, 0.47, 0.85],
    color2: [0.55, 0.78, 0.44],
  },
  custody: {
    color1: [0.75, 0.50, 0.69],
    color2: [0.50, 0.58, 0.82],
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
uniform vec2 u_mouse;
uniform float u_rotate;

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

  // Responsive scale
  float cssWidth = u_resolution.x / u_dpr;
  float rScale = clamp(cssWidth / 1440.0, 0.45, 1.0);

  // Organic shape distortion via noise
  float noiseScale = 1.4;
  float noiseTime = t * 0.35 + u_seed;

  // Single large blob — center with movement
  vec2 c1 = vec2(
    halfAspect + sin(t * 0.09 + u_seed) * 0.10 * aspect,
    0.5 + cos(t * 0.07 + u_seed * 1.3) * 0.08
  );
  float r1 = (0.495 + 0.08 * sin(t * 0.15 + u_seed)) * rScale;

  // Warp for organic shape
  vec2 warp1 = vec2(
    snoise(vec3(st * noiseScale, noiseTime)),
    snoise(vec3(st * noiseScale + 5.0, noiseTime + 3.0))
  ) * 0.25;

  // Distance with warp applied
  float d = length(st + warp1 - c1) / r1;

  // Gaussian-like fade: wide smooth falloff
  float blobMask = smoothstep(2.5, 0.2, d);

  // Color: diagonal gradient with optional rotation
  float speedVar = 0.175 + 0.075 * snoise(vec3(t * 0.03, u_seed, 0.0));
  float rotAngle = speedVar * t;
  float gradAngle = mix(0.785, rotAngle, u_rotate);
  vec2 gradDir = vec2(cos(gradAngle), sin(gradAngle));
  float diag = dot(uv - 0.5, gradDir) + 0.5;
  vec3 blobColor = mix(u_color1, u_color2, smoothstep(0.2, 0.8, diag));

  // Compose on white
  vec3 bg = vec3(1.0);
  vec3 color = mix(bg, blobColor, blobMask);

  // Mouse glow
  float mDist = length(uv - u_mouse);
  float mouseGlow = exp(-mDist * mDist * 4.0) * 0.30;
  color = mix(color, blobColor * 1.15, mouseGlow * blobMask);

  gl_FragColor = vec4(color, 1.0);
}
`;

interface SoftBlobBackgroundProps {
  variant?: SoftBlobVariant;
  rotateGradient?: boolean;
}

export default function SoftBlobBackground({ variant = "portal", rotateGradient = false }: SoftBlobBackgroundProps) {
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
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uRotate = gl.getUniformLocation(program, "u_rotate");

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
      gl!.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);
      gl!.uniform1f(uRotate, rotateGradient ? 1.0 : 0.0);

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
