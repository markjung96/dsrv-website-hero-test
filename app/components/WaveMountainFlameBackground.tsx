"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform float u_time;
uniform vec2 u_resolution;

// Simplex 3D noise
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

void main() {
  float t = u_time;
  vec2 uv = v_uv;
  float vy = 1.0 - uv.y; // 0=top, 1=bottom

  // --- Noise UV displacement (flame effect) ---
  // Large slow movement
  float nx1 = snoise(vec3(uv * 2.0, t * 0.12)) * 0.022;
  float ny1 = snoise(vec3(uv * 2.0 + 10.0, t * 0.12 + t * 0.06)) * 0.028;
  // Medium detail
  float nx2 = snoise(vec3(uv * 4.5, t * 0.22)) * 0.009;
  float ny2 = snoise(vec3(uv * 4.5 + 20.0, t * 0.22 + t * 0.08)) * 0.012;
  // Fine flicker
  float nx3 = snoise(vec3(uv * 9.0, t * 0.45)) * 0.004;
  float ny3 = snoise(vec3(uv * 9.0 + 30.0, t * 0.45)) * 0.005;

  vec2 displacement = vec2(nx1 + nx2 + nx3, ny1 + ny2 + ny3);

  // Stronger displacement where there's more blue (top area)
  float topWeight = smoothstep(0.6, 0.0, vy);
  displacement *= (0.5 + topWeight * 0.5);

  vec2 displaced_uv = uv + displacement;

  // Sample texture
  vec4 tex = texture2D(u_texture, displaced_uv);

  // Background gradient: #014EEC -> transparent -> white
  vec3 deepBlue = vec3(0.004, 0.306, 0.925);
  vec3 white = vec3(1.0);
  float gradMask = smoothstep(0.0, 0.55, vy);
  vec3 bgColor = mix(deepBlue, white, gradMask);

  // Flicker: subtle brightness variation
  float flicker = 0.97 + 0.03 * snoise(vec3(uv * 0.8, t * 2.0));

  // Color temperature shift: lighter blue at high-intensity regions
  vec3 warmBlue = vec3(0.15, 0.40, 1.0);
  float intensity = tex.a;
  vec3 tinted = mix(tex.rgb, warmBlue * tex.a, intensity * 0.15);

  // Composite
  vec3 color = bgColor * (1.0 - tex.a) + tinted * flicker;

  gl_FragColor = vec4(color, 1.0);
}
`;

interface LayerConfig {
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  insetX: number;
  insetY: number;
  rotate: number;
  skewX: number;
  blur: number;
  opacity: number;
}

const LAYERS: LayerConfig[] = [
  {
    src: "/wave-mountain/vector1.svg",
    left: -60.34, top: 47, width: 1144.133, height: 1265.792,
    innerWidth: 1157.303, innerHeight: 1019,
    insetX: 0.2592, insetY: 0.2944,
    rotate: -83.46, skewX: 0,
    blur: 150, opacity: 1.0,
  },
  {
    src: "/wave-mountain/vector2.svg",
    left: 49, top: -780, width: 2142.001, height: 1694.434,
    innerWidth: 1955.609, innerHeight: 1521.687,
    insetX: 0.0767, insetY: 0.0986,
    rotate: -174.56, skewX: -1.93,
    blur: 75, opacity: 1.0,
  },
  {
    src: "/wave-mountain/vector3.svg",
    left: 49, top: -780, width: 2142.001, height: 1694.434,
    innerWidth: 1955.609, innerHeight: 1521.687,
    insetX: 0.0767, insetY: 0.0986,
    rotate: -174.56, skewX: -1.93,
    blur: 75, opacity: 1.0,
  },
  {
    src: "/wave-mountain/vector4.svg",
    left: 49, top: -780, width: 2142.001, height: 1694.434,
    innerWidth: 1955.609, innerHeight: 1521.687,
    insetX: 0.0767, insetY: 0.0986,
    rotate: -174.56, skewX: -1.93,
    blur: 75, opacity: 1.0,
  },
  {
    src: "/wave-mountain/vector5.svg",
    left: 274.34, top: -601.75, width: 1691.332, height: 1337.931,
    innerWidth: 1544.156, innerHeight: 1201.53,
    insetX: 0, insetY: 0,
    rotate: -174.56, skewX: -1.93,
    blur: 60, opacity: 1.0,
  },
];

const DESIGN_W = 1920;
const DESIGN_H = 1080;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function WaveMountainFlameBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [webglOk, setWebglOk] = useState(true);

  const init = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const canvasW = canvas.clientWidth * dpr;
    const canvasH = canvas.clientHeight * dpr;
    canvas.width = canvasW;
    canvas.height = canvasH;

    // Load all SVG images in parallel
    const images = await Promise.all(
      LAYERS.map(
        (layer) =>
          new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = layer.src;
          })
      )
    );

    // Rasterize all layers onto a low-resolution offscreen canvas.
    // Drawing at 1/3 resolution keeps blur values small and avoids expensive
    // high-DPR canvas filters. WebGL LINEAR upsampling provides natural softening.
    const offW = Math.ceil(canvasW / 3);
    const offH = Math.ceil(canvasH / 3);
    const offscreen = document.createElement("canvas");
    offscreen.width = offW;
    offscreen.height = offH;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return null;

    const drawScale = Math.max(offW / DESIGN_W, offH / DESIGN_H);

    for (let i = 0; i < LAYERS.length; i++) {
      const layer = LAYERS[i];
      const img = images[i];

      ctx.save();
      ctx.globalAlpha = layer.opacity;
      ctx.filter = `blur(${Math.max(layer.blur * drawScale * 0.3, 2)}px)`;

      // Center of the layer in offscreen canvas space
      const cx = (layer.left + layer.width / 2) * drawScale;
      const cy = (layer.top + layer.height / 2) * drawScale;
      ctx.translate(cx, cy);

      // Apply rotation and skew
      const rad = (layer.rotate * Math.PI) / 180;
      const skewRad = (layer.skewX * Math.PI) / 180;
      ctx.transform(
        Math.cos(rad),
        Math.sin(rad),
        -Math.sin(rad) + Math.cos(rad) * Math.tan(skewRad),
        Math.cos(rad) + Math.sin(rad) * Math.tan(skewRad),
        0,
        0
      );

      // Draw the image centered with inset expansion
      const drawW = layer.innerWidth * (1 + layer.insetX * 2) * drawScale;
      const drawH = layer.innerHeight * (1 + layer.insetY * 2) * drawScale;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    // Set up WebGL
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) {
      setWebglOk(false);
      return null;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) {
      setWebglOk(false);
      return null;
    }

    const program = gl.createProgram();
    if (!program) {
      setWebglOk(false);
      return null;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      setWebglOk(false);
      return null;
    }

    // Upload offscreen canvas as texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreen);

    // Fullscreen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    return { gl, program, vs, fs, positionBuffer, texture };
  }, []);

  useEffect(() => {
    let resources: Awaited<ReturnType<typeof init>> = null;
    let cancelled = false;
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    async function setup() {
      resources = await init();
      if (cancelled || !resources) return;

      const { gl, program, positionBuffer } = resources;
      const canvas = canvasRef.current!;

      const aPosition = gl.getAttribLocation(program, "a_position");
      const uTime = gl.getUniformLocation(program, "u_time");
      const uResolution = gl.getUniformLocation(program, "u_resolution");
      const uTexture = gl.getUniformLocation(program, "u_texture");

      const startTime = performance.now();

      function render() {
        if (cancelled || !resources) return;
        const { gl, program, positionBuffer } = resources;

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(program);

        gl.enableVertexAttribArray(aPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, resources.texture);
        gl.uniform1i(uTexture, 0);

        gl.uniform1f(uTime, (performance.now() - startTime) / 1000);
        gl.uniform2f(uResolution, canvas.width, canvas.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        rafRef.current = requestAnimationFrame(render);
      }

      rafRef.current = requestAnimationFrame(render);
    }

    function cleanup() {
      if (!resources) return;
      const { gl, program, vs, fs, positionBuffer, texture } = resources;
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(positionBuffer);
      gl.deleteTexture(texture);
      resources = null;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(rafRef.current);
        cleanup();
        if (!cancelled) setup();
      }, 200);
    });

    resizeObserver.observe(canvas);
    setup();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
      cleanup();
    };
  }, [init]);

  if (!webglOk) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
