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
uniform vec2 u_resolution;
uniform float u_dpr;
uniform vec2 u_mouse;

// Smooth gaussian falloff
float gaussian(float dist, float sigma) {
  return exp(-(dist * dist) / (2.0 * sigma * sigma));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  // Flip Y so uv.y=0 is top
  uv.y = 1.0 - uv.y;

  float t = u_time;

  // ---- 1. Base vertical gradient ----
  // black at top (uv.y=0) → deep blue at ~35% → blue at ~55% → white at bottom
  vec3 colorTop    = vec3(0.0, 0.0, 0.0);
  vec3 colorMidLow = vec3(0.0, 0.08, 0.55);
  vec3 colorMid    = vec3(0.0, 0.15, 0.72);
  vec3 colorBot    = vec3(1.0, 1.0, 1.0);

  vec3 baseColor;
  if (uv.y < 0.35) {
    baseColor = mix(colorTop, colorMidLow, smoothstep(0.0, 0.35, uv.y));
  } else if (uv.y < 0.55) {
    baseColor = mix(colorMidLow, colorMid, smoothstep(0.35, 0.55, uv.y));
  } else {
    baseColor = mix(colorMid, colorBot, smoothstep(0.55, 1.0, uv.y));
  }

  // ---- 2. Big orb (upper-left, dark, blur 100px equivalent) ----
  // Figma: position (82,75) size 1069x1052 in 1920-wide frame → center x=82/1920+1069/1920/2=~0.32, y=75/4776+1052/4776/2=~0.13 from top
  // In normalized 0-1 coords with y-flip: center around (0.08, 0.15) top area
  float bigOrbDriftX = sin(t * 0.07) * 0.025;
  float bigOrbDriftY = cos(t * 0.05) * 0.015;
  // Mouse influence
  vec2 mouseInfluence = (u_mouse - vec2(0.5, 0.5)) * 0.04;
  vec2 bigOrbCenter = vec2(0.28 + bigOrbDriftX + mouseInfluence.x, 0.13 + bigOrbDriftY + mouseInfluence.y);
  float aspect = u_resolution.x / u_resolution.y;
  vec2 bigOrbDist = (uv - bigOrbCenter) * vec2(aspect, 1.0);
  float bigOrbR = length(bigOrbDist);
  // Wide gaussian for blur(100px) equivalent
  float bigOrbGlow = gaussian(bigOrbR, 0.22);
  // Dark orb: subtract from base, creates darkening
  vec3 darkOrbColor = vec3(0.0, 0.0, 0.05);
  baseColor = mix(baseColor, darkOrbColor, bigOrbGlow * 0.7);

  // ---- 3. Small iridescent orb (left side, lighten blend, 30% opacity) ----
  // Figma: position (-118,770) size 761x754 in 1920x4776 → center x=(-118+761/2)/1920≈-0.06+0.2≈0.06, y from top=(770+754/2)/4776≈0.24
  float smallOrbDriftX = cos(t * 0.11 + 1.2) * 0.02;
  float smallOrbDriftY = sin(t * 0.09 + 0.5) * 0.015;
  vec2 smallOrbCenter = vec2(-0.06 + smallOrbDriftX + mouseInfluence.x * 0.5, 0.20 + smallOrbDriftY + mouseInfluence.y * 0.5);
  vec2 smallOrbDist = (uv - smallOrbCenter) * vec2(aspect, 1.0);
  float smallOrbR = length(smallOrbDist);

  // Iridescent rainbow edge glow
  float edgeMask = smoothstep(0.18, 0.22, smallOrbR) * (1.0 - smoothstep(0.22, 0.32, smallOrbR));
  float hueShift = atan(smallOrbDist.y, smallOrbDist.x) / (2.0 * 3.14159) + 0.5 + t * 0.05;
  // Simple hue to RGB
  float h6 = mod(hueShift * 6.0, 6.0);
  float c = 1.0;
  float x = c * (1.0 - abs(mod(h6, 2.0) - 1.0));
  vec3 hueColor;
  if (h6 < 1.0)      hueColor = vec3(c, x, 0.0);
  else if (h6 < 2.0) hueColor = vec3(x, c, 0.0);
  else if (h6 < 3.0) hueColor = vec3(0.0, c, x);
  else if (h6 < 4.0) hueColor = vec3(0.0, x, c);
  else if (h6 < 5.0) hueColor = vec3(x, 0.0, c);
  else               hueColor = vec3(c, 0.0, x);

  float innerFill = gaussian(smallOrbR, 0.12);
  vec3 orbInner = vec3(0.05, 0.10, 0.35);
  vec3 smallOrbColor = mix(orbInner, hueColor * 0.9, edgeMask) * (innerFill + edgeMask * 0.6);

  // Lighten blend: max of each channel
  vec3 lightenResult = max(baseColor, smallOrbColor);
  baseColor = mix(baseColor, lightenResult, 0.3); // 30% opacity lighten

  // ---- 4. Bright blue glow upper right ----
  // Figma: rounded rect position (839,218) size 1193x1232 → center x=(839+1193/2)/1920≈0.75, y=(218+1232/2)/4776≈0.17
  float brightDriftX = sin(t * 0.08 + 2.0) * 0.02;
  float brightDriftY = cos(t * 0.06 + 1.0) * 0.015;
  vec2 brightOrbCenter = vec2(0.75 + brightDriftX - mouseInfluence.x * 0.3, 0.17 + brightDriftY - mouseInfluence.y * 0.3);
  vec2 brightOrbDist = (uv - brightOrbCenter) * vec2(aspect, 1.0);
  float brightOrbR = length(brightOrbDist);
  float brightGlow = gaussian(brightOrbR, 0.28);
  vec3 brightBlue = vec3(0.0, 0.25, 1.0);
  baseColor = mix(baseColor, brightBlue, brightGlow * 0.55);

  // ---- 5. Cyan/teal accent (right center area) ----
  // Isolation_Mode: position (1036,1204) size 838x829 → center x=(1036+838/2)/1920≈0.76, y=(1204+829/2)/4776≈0.34
  float cyanDriftX = cos(t * 0.09 + 3.0) * 0.018;
  float cyanDriftY = sin(t * 0.07 + 2.0) * 0.012;
  vec2 cyanCenter = vec2(0.76 + cyanDriftX - mouseInfluence.x * 0.2, 0.34 + cyanDriftY);
  vec2 cyanDist = (uv - cyanCenter) * vec2(aspect, 1.0);
  float cyanR = length(cyanDist);
  float cyanGlow = gaussian(cyanR, 0.18);
  vec3 cyanColor = vec3(0.0, 0.85, 0.90);
  // Color blend: shift hue toward cyan
  baseColor = mix(baseColor, cyanColor, cyanGlow * 0.35);

  // ---- 6. Vertical stripe texture ----
  // 42px stripes across 1920px → stripe period in uv space = 42/1920 ≈ 0.02188
  float cssWidth = u_resolution.x / u_dpr;
  float stripeUV = uv.x * cssWidth / 42.0;
  float stripe = step(0.5, fract(stripeUV));
  float stripeOpacity = 0.04;
  // Darker stripes on dark area, lighter on light area
  float lumBase = dot(baseColor, vec3(0.299, 0.587, 0.114));
  vec3 stripeColor = mix(vec3(1.0), vec3(0.0), lumBase);
  baseColor = mix(baseColor, stripeColor, stripe * stripeOpacity);

  // ---- 7. Mouse glow interaction ----
  vec2 mouseUV = vec2(u_mouse.x, 1.0 - u_mouse.y);
  float mouseDist = length((uv - mouseUV) * vec2(aspect, 1.0));
  float mouseGlow = gaussian(mouseDist, 0.15) * 0.15;
  baseColor = mix(baseColor, vec3(0.2, 0.4, 1.0), mouseGlow);

  gl_FragColor = vec4(baseColor, 1.0);
}
`;

export default function OrbGradientWebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef<[number, number]>([0.5, 0.5]);

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
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPosition = gl.getAttribLocation(program, "a_position");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uDpr = gl.getUniformLocation(program, "u_dpr");
    const uMouse = gl.getUniformLocation(program, "u_mouse");

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
      gl!.uniform1f(uTime, (performance.now() - startTime) / 1000);
      gl!.uniform2f(uResolution, canvas!.width, canvas!.height);
      gl!.uniform1f(uDpr, dpr);
      gl!.uniform2f(uMouse, mouseRef.current[0], mouseRef.current[1]);

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
