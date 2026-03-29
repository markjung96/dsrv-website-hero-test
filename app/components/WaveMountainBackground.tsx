"use client";

import { useEffect, useRef, useState } from "react";

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
uniform sampler2D u_blobTexture;

void main() {
  float vy = 1.0 - v_uv.y;

  // Background gradient: #014EEC -> transparent -> white
  vec3 deepBlue = vec3(0.004, 0.306, 0.925);
  vec3 white = vec3(1.0);
  float gradMask = smoothstep(0.0, 0.55, vy);
  vec3 bgColor = mix(deepBlue, white, gradMask);

  // Sample blob texture (top-down UV)
  vec4 blob = texture2D(u_blobTexture, vec2(v_uv.x, 1.0 - v_uv.y));

  // Composite
  vec3 color = bgColor * (1.0 - blob.a) + blob.rgb;

  gl_FragColor = vec4(color, 1.0);
}
`;

// Build a self-contained SVG string that includes the blob with all
// Figma transforms, blur, and gradient — the browser handles everything.
function buildBlobSVG(w: number, h: number): string {
  // Scale from Figma's ~960px design width to actual viewport
  const s = w / 960;

  // Container position & size (scaled)
  const left = 49 * s;
  const top = -780 * s;
  const cw = 2142 * s;
  const ch = 1694 * s;
  const cx = left + cw / 2;
  const cy = top + ch / 2;

  // Inner blob dimensions with inset expansion
  const iw = 1956 * s;
  const ih = 1522 * s;
  const exW = iw * 0.0767;
  const exH = ih * 0.0986;
  const dw = iw + exW * 2;
  const dh = ih + exH * 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <filter id="blur75" x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox">
      <feGaussianBlur stdDeviation="${75 * s}" />
    </filter>
    <radialGradient id="blobGrad" cx="0" cy="0" r="1"
      gradientTransform="matrix(457.851 -706.885 2507.26 917.159 1148.86 1070.73)"
      gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#6673FF"/>
      <stop offset="0.764" stop-color="#252EEB"/>
      <stop offset="1" stop-color="#242B9D"/>
    </radialGradient>
  </defs>
  <g transform="translate(${cx},${cy}) rotate(-174.56) skewX(-1.93)"
     filter="url(#blur75)" opacity="0.3">
    <svg x="${-dw / 2}" y="${-dh / 2}" width="${dw}" height="${dh}"
         viewBox="0 0 2255.61 1821.69" preserveAspectRatio="none" overflow="visible">
      <path d="M712.76 566.511C542.987 1147.82 56.7742 613.182 165.75 814.832C92.4229 1140.39 559.665 1310.24 1033.41 1358.79C1284.94 2168.6 2045.35 1166.1 2081.32 1034.04C2232.81 477.859 1636.75 1.73743 1368.8 489.908C1217.92 764.799 1011.97 -457.984 712.76 566.511Z"
            fill="url(#blobGrad)" fill-opacity="0.3"/>
    </svg>
  </g>
</svg>`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export default function WaveMountainBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [ready, setReady] = useState(false);
  const glRef = useRef<{
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    texture: WebGLTexture;
    positionBuffer: WebGLBuffer;
    vs: WebGLShader;
    fs: WebGLShader;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    async function init() {
      const gl = canvas!.getContext("webgl", { antialias: false, alpha: false });
      if (!gl) return;

      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;

      // Build SVG with all transforms baked in at canvas resolution
      const svgStr = buildBlobSVG(canvas!.width, canvas!.height);
      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const img = await loadImage(url);
      URL.revokeObjectURL(url);
      if (cancelled) return;

      // Rasterize SVG to offscreen canvas
      const offscreen = document.createElement("canvas");
      offscreen.width = canvas!.width;
      offscreen.height = canvas!.height;
      const ctx = offscreen.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas!.width, canvas!.height);

      // WebGL setup
      function createShader(type: number, source: string) {
        const shader = gl!.createShader(type)!;
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
      if (!vs || !fs) return;

      const program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

      const positionBuffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW
      );

      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreen);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      glRef.current = { gl, program, texture, positionBuffer, vs, fs };
      setReady(true);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !glRef.current) return;
    const { gl, program, texture, positionBuffer } = glRef.current;
    const canvas = canvasRef.current!;

    const aPosition = gl.getAttribLocation(program, "a_position");
    const uBlobTexture = gl.getUniformLocation(program, "u_blobTexture");

    function render() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(program);

      gl.enableVertexAttribArray(aPosition);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(uBlobTexture, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(rafRef.current); };
  }, [ready]);

  useEffect(() => {
    return () => {
      if (glRef.current) {
        const { gl, program, texture, positionBuffer, vs, fs } = glRef.current;
        gl.deleteTexture(texture);
        gl.deleteBuffer(positionBuffer);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      }
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
