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
    inner: [0.25, 0.20, 0.70], mid1: [0.40, 0.25, 0.80], mid2: [0.20, 0.75, 0.80],
    mid3: [0.30, 0.90, 0.50], outer: [0.75, 0.92, 0.30], accent: [0.90, 0.25, 0.60],
  },
  allThatNode: {
    inner: [0.22, 0.25, 0.75], mid1: [0.50, 0.30, 0.85], mid2: [0.15, 0.80, 0.78],
    mid3: [0.20, 0.90, 0.45], outer: [0.80, 0.95, 0.25], accent: [0.95, 0.20, 0.55],
  },
  walletHub: {
    inner: [0.20, 0.30, 0.72], mid1: [0.30, 0.45, 0.82], mid2: [0.25, 0.70, 0.75],
    mid3: [0.35, 0.82, 0.60], outer: [0.60, 0.88, 0.40], accent: [0.85, 0.30, 0.55],
  },
  stablecoin: {
    inner: [0.22, 0.28, 0.78], mid1: [0.35, 0.40, 0.85], mid2: [0.20, 0.65, 0.82],
    mid3: [0.30, 0.80, 0.70], outer: [0.55, 0.85, 0.50], accent: [0.80, 0.35, 0.60],
  },
  stakingHub: {
    inner: [0.18, 0.22, 0.68], mid1: [0.28, 0.35, 0.78], mid2: [0.20, 0.60, 0.72],
    mid3: [0.40, 0.78, 0.55], outer: [0.70, 0.88, 0.35], accent: [0.88, 0.28, 0.50],
  },
  custody: {
    inner: [0.30, 0.18, 0.65], mid1: [0.50, 0.25, 0.75], mid2: [0.35, 0.55, 0.78],
    mid3: [0.25, 0.72, 0.68], outer: [0.50, 0.82, 0.45], accent: [0.82, 0.22, 0.65],
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
uniform vec3 u_inner, u_mid1, u_mid2, u_mid3, u_outer, u_accent;
uniform float u_active;       // active card index (float for smooth transitions)
uniform float u_carouselY;    // carousel vertical center in UV (0=bottom, 1=top)

#define NUM_CARDS 5
#define CARD_W 0.38
#define CARD_H 0.48
#define CORNER_R 0.04
#define CARD_SPACING 0.82
#define CARD_DEPTH 0.2
#define CARD_ROT 0.611

// === Noise ===
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
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
  vec3 ns = n_ * D.wyz - D.xzx;
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
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// === Background color ===
vec3 bgColor(vec2 uv) {
  float aspect = u_resolution.x / u_resolution.y;
  float cssWidth = u_resolution.x / u_dpr;
  float rScale = clamp(cssWidth / 1440.0, 0.5, 1.0);

  vec2 st = (uv - 0.5) * vec2(aspect, 1.0);

  vec2 mouseST = (u_mouse - 0.5) * vec2(aspect, 1.0);
  float mouseDist = length(st - mouseST);
  st += (mouseST - st) * exp(-mouseDist * mouseDist * 3.0) * 0.08;

  float t = u_time;
  vec2 blobCenter = vec2(sin(t*0.06+u_seed)*0.05, cos(t*0.05+u_seed*1.3)*0.04);
  vec2 p = st - blobCenter;

  float dist = length(p);
  float angle = atan(p.y, p.x);
  float noiseTime = t * 0.12 + u_seed;

  float distort = snoise(vec3(cos(angle)*0.6, sin(angle)*0.6, noiseTime)) * 0.12
                + snoise(vec3(cos(angle*2.0)*0.4+3.0, sin(angle*2.0)*0.4, noiseTime*0.7+5.0)) * 0.05;
  float spatialNoise = snoise(vec3(p * 1.2, noiseTime * 0.6)) * 0.03;

  float blobRadius = 0.45 * rScale;
  float d = (dist + spatialNoise) / (blobRadius + distort * rScale);

  float numBands = 50.0;
  float bandIndex = floor(d * numBands);
  float bandFrac = fract(d * numBands);
  float bandNorm = bandIndex / numBands;

  vec3 color;
  if (bandNorm < 0.2) {
    color = mix(u_inner, u_mid1, bandNorm / 0.2);
  } else if (bandNorm < 0.4) {
    vec3 am = mix(u_mid1, u_accent, smoothstep(0.2, 0.28, bandNorm));
    color = mix(am, u_mid2, smoothstep(0.28, 0.4, bandNorm));
  } else if (bandNorm < 0.65) {
    color = mix(u_mid2, u_mid3, (bandNorm-0.4)/0.25);
  } else if (bandNorm < 0.9) {
    color = mix(u_mid3, u_outer, (bandNorm-0.65)/0.25);
  } else {
    color = u_outer;
  }

  float lineWidth = 0.06;
  float line = smoothstep(0.0, lineWidth, bandFrac) * smoothstep(1.0, 1.0-lineWidth, bandFrac);
  color *= 0.92 + 0.08 * line;

  color = mix(color, vec3(1.0), smoothstep(0.75, 1.1, d));
  color = mix(color, vec3(1.0), smoothstep(1.0, 1.15, d));

  float glowDist = smoothstep(1.15, 0.85, d) * smoothstep(0.6, 0.85, d);
  color = mix(color, mix(u_outer, u_mid3, 0.5), glowDist * 0.15);

  float mDist = length(uv - u_mouse);
  float mouseGlow = exp(-mDist*mDist*5.0) * 0.20;
  float insideBlob = 1.0 - smoothstep(1.0, 1.15, d);
  color = mix(color, mix(u_mid2, u_mid3, 0.5) * 1.3, mouseGlow * insideBlob);

  return color;
}

// === 2D rounded rect SDF ===
float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

// === Rotation matrix ===
mat3 rotateY(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
}

void main() {
  vec2 screenUV = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  // Background
  vec3 bg = bgColor(screenUV);

  // === 3D Card Carousel ===
  // Camera: perspective matching ~1000px CSS perspective
  float focalLength = 1.8;
  vec2 ndc = (screenUV - 0.5) * vec2(aspect, 1.0);
  // Offset to carousel vertical position
  ndc.y -= (u_carouselY - 0.5);

  vec3 ro = vec3(0.0, 0.0, 0.0);
  vec3 rd = normalize(vec3(ndc, focalLength));

  // Track closest card hit
  float closestT = 1e10;
  int closestCard = -1;
  vec2 closestLocalUV = vec2(0.0);
  float closestSDF = 0.0;

  for (int i = 0; i < NUM_CARDS; i++) {
    float offset = float(i) - u_active;
    float absOff = abs(offset);

    if (absOff > 2.5) continue;

    // Card 3D position (concave: sides closer to camera)
    float x = offset * CARD_SPACING;
    float z = focalLength + 1.5 - absOff * CARD_DEPTH;
    float y = 0.0;
    vec3 cardCenter = vec3(x, y, z);

    // Card rotation (sides tilt inward toward center)
    float rot = offset * CARD_ROT;
    mat3 rotM = rotateY(rot);
    vec3 cardNormal = rotM * vec3(0.0, 0.0, -1.0);
    vec3 cardRight = rotM * vec3(1.0, 0.0, 0.0);
    vec3 cardUp = vec3(0.0, 1.0, 0.0);

    // Ray-plane intersection
    float denom = dot(rd, cardNormal);
    if (abs(denom) < 0.001) continue;

    float t = dot(cardCenter - ro, cardNormal) / denom;
    if (t <= 0.0 || t >= closestT) continue;

    // Hit point in card local space
    vec3 hitWorld = ro + rd * t;
    vec3 localP = hitWorld - cardCenter;
    vec2 cardUV = vec2(dot(localP, cardRight), dot(localP, cardUp));

    // Rounded rect test
    float sdf = sdRoundedRect(cardUV, vec2(CARD_W, CARD_H), CORNER_R);

    if (sdf < 0.01) {
      closestT = t;
      closestCard = i;
      closestLocalUV = cardUV;
      closestSDF = sdf;
    }
  }

  vec3 color = bg;

  if (closestCard >= 0) {
    float offset = float(closestCard) - u_active;
    float absOff = abs(offset);
    bool isActive = absOff < 0.5;

    // Edge glow
    float edgeMask = 1.0 - smoothstep(-0.01, 0.005, closestSDF);
    float borderMask = smoothstep(-0.015, -0.005, closestSDF) * (1.0 - smoothstep(-0.005, 0.005, closestSDF));

    if (isActive) {
      // Active card: nearly transparent, subtle refraction
      vec2 refractUV = screenUV + closestLocalUV * 0.008;
      vec3 refracted = bgColor(refractUV);

      // Very slight glass tint
      refracted = mix(refracted, vec3(0.85, 0.85, 0.95), 0.06);

      // Chromatic aberration at edges
      float edgeDist = length(closestLocalUV / vec2(CARD_W, CARD_H));
      float chromaStr = edgeDist * 0.006;
      vec3 chromaColor = vec3(
        bgColor(refractUV + vec2(chromaStr, 0.0)).r,
        refracted.g,
        bgColor(refractUV - vec2(chromaStr, 0.0)).b
      );
      refracted = mix(refracted, chromaColor, smoothstep(0.3, 1.0, edgeDist));

      color = mix(bg, refracted, edgeMask);

      // Subtle white border
      color = mix(color, vec3(1.0), borderMask * 0.6);

      // Specular highlight (top area)
      float spec = smoothstep(0.1, -0.3, closestLocalUV.y / CARD_H) * 0.04;
      color += vec3(spec) * edgeMask;

    } else {
      // Inactive cards: frosted glass
      vec3 frosted = bgColor(screenUV);

      // Desaturate + shift toward white (fake blur)
      float gray = dot(frosted, vec3(0.299, 0.587, 0.114));
      frosted = mix(frosted, vec3(gray), 0.3 + absOff * 0.1);
      frosted = mix(frosted, vec3(1.0), 0.35 + absOff * 0.15);

      // Slight color tint
      frosted = mix(frosted, vec3(0.92, 0.92, 0.96), 0.15);

      color = mix(bg, frosted, edgeMask);

      // Border
      color = mix(color, vec3(1.0), borderMask * 0.35);
    }

    // Fade opacity for far cards
    float fadeAlpha = 1.0 - smoothstep(1.5, 2.5, absOff);
    color = mix(bg, color, fadeAlpha);
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

interface ContourGlassBackgroundProps {
  variant?: ContourVariant;
  activeCard?: number;
  carouselY?: number;
}

export default function ContourGlassBackground({
  variant = "allThatNode",
  activeCard = 2,
  carouselY = 0.38,
}: ContourGlassBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);
  const colorsRef = useRef(COLOR_PRESETS[variant]);
  const activeRef = useRef(activeCard);
  const smoothActiveRef = useRef(activeCard);

  useEffect(() => { colorsRef.current = COLOR_PRESETS[variant]; }, [variant]);
  useEffect(() => { activeRef.current = activeCard; }, [activeCard]);

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
        console.error("Shader error:", gl.getShaderInfoLog(shader));
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
      console.error("Link error:", gl.getProgramInfoLog(program));
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);

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
    const uActive = gl.getUniformLocation(program, "u_active");
    const uCarouselY = gl.getUniformLocation(program, "u_carouselY");

    const seed = Math.random() * 100;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas!.width = canvas!.clientWidth * dpr;
      canvas!.height = canvas!.clientHeight * dpr;
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
      // Smooth active card transition
      smoothActiveRef.current += (activeRef.current - smoothActiveRef.current) * 0.08;

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
      gl!.uniform1f(uActive, smoothActiveRef.current);
      gl!.uniform1f(uCarouselY, carouselY);

      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [carouselY]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
