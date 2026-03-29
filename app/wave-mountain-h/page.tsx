"use client";

import { useEffect, useRef, useState } from "react";
import VersionSelector from "../components/VersionSelector";
import FlameNoiseOverlay from "../components/FlameNoiseOverlay";

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

const FLICKER_CONFIGS = [
  { // Vector 1: heavy blur (150px) → most aggressive motion
    y: [{ freq: 0.7, amp: 25 }, { freq: 1.6, amp: 15 }, { freq: 2.9, amp: 8 }],
    x: [{ freq: 0.9, amp: 10 }, { freq: 2.1, amp: 6 }],
    scale: { freq: 0.6, amp: 0.03 },
    opacity: { freq: 1.1, amp: 0.1, base: 0.90 },
  },
  { // Vector 2: blur 75px, moderate
    y: [{ freq: 0.6, amp: 20 }, { freq: 1.5, amp: 12 }, { freq: 2.5, amp: 6 }],
    x: [{ freq: 0.8, amp: 8 }, { freq: 1.9, amp: 4 }],
    scale: { freq: 0.5, amp: 0.025 },
    opacity: { freq: 1.3, amp: 0.08, base: 0.92 },
  },
  { // Vector 3: blur 75px, different phase
    y: [{ freq: 0.8, amp: 18 }, { freq: 1.7, amp: 10 }, { freq: 2.7, amp: 5 }],
    x: [{ freq: 1.0, amp: 7 }, { freq: 2.3, amp: 4 }],
    scale: { freq: 0.7, amp: 0.022 },
    opacity: { freq: 0.9, amp: 0.07, base: 0.93 },
  },
  { // Vector 4: blur 75px
    y: [{ freq: 0.55, amp: 22 }, { freq: 1.4, amp: 13 }, { freq: 2.6, amp: 6 }],
    x: [{ freq: 0.85, amp: 9 }, { freq: 2.0, amp: 5 }],
    scale: { freq: 0.65, amp: 0.028 },
    opacity: { freq: 1.2, amp: 0.09, base: 0.91 },
  },
  { // Vector 5: blur 60px → moderate
    y: [{ freq: 0.5, amp: 12 }, { freq: 1.3, amp: 7 }, { freq: 2.3, amp: 4 }],
    x: [{ freq: 0.7, amp: 5 }, { freq: 1.8, amp: 3 }],
    scale: { freq: 0.45, amp: 0.018 },
    opacity: { freq: 0.8, amp: 0.05, base: 0.95 },
  },
];

export default function WaveMountainHPage() {
  const [scale, setScale] = useState(1);
  const flickerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    function updateScale() {
      const scaleX = window.innerWidth / DESIGN_WIDTH;
      const scaleY = window.innerHeight / DESIGN_HEIGHT;
      setScale(Math.max(scaleX, scaleY));
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    const startTime = performance.now();
    let raf = 0;

    function animate() {
      const t = (performance.now() - startTime) / 1000;

      flickerRefs.current.forEach((el, i) => {
        if (!el) return;
        const cfg = FLICKER_CONFIGS[i];
        const seed = i * 17.3;

        let dy = 0;
        cfg.y.forEach(w => { dy += Math.sin(t * w.freq + seed) * w.amp; });
        dy -= Math.abs(Math.sin(t * 0.07 + seed)) * 5;

        let dx = 0;
        cfg.x.forEach(w => { dx += Math.sin(t * w.freq + seed * 1.3) * w.amp; });

        const s = 1 + Math.sin(t * cfg.scale.freq + seed * 0.7) * cfg.scale.amp;
        const opacity = cfg.opacity.base + Math.sin(t * cfg.opacity.freq + seed * 1.7) * cfg.opacity.amp;

        el.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${s})`;
        el.style.opacity = String(Math.max(0, Math.min(1, opacity)));
      });

      raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <main
      className="relative h-screen overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgb(1, 78, 236) 0%, rgba(41, 111, 255, 0) 55%, rgba(255, 255, 255, 0) 100%)",
      }}
    >
      {/* Blob container: 1920px design scaled to viewport width */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: DESIGN_WIDTH,
          height: "100vh",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      >
        {/* Vector 1 (93272): jagged blob, blur 150, rotated -83.46deg */}
        <div
          ref={el => { flickerRefs.current[0] = el; }}
          style={{ position: "absolute", inset: 0, willChange: "transform, opacity" }}
        >
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: "-60.34px",
              top: "47px",
              width: "1144.133px",
              height: "1265.792px",
              filter: "blur(150px)",
            }}
          >
            <div style={{ transform: "rotate(-83.46deg)", flexShrink: 0 }}>
              <div className="relative" style={{ width: "1157.303px", height: "1019px" }}>
                <img
                  alt=""
                  src="/wave-mountain/vector1.svg"
                  className="block absolute"
                  style={{
                    inset: "-29.44% -25.92%",
                    width: "calc(100% + 51.84%)",
                    height: "calc(100% + 58.88%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vector 2 (93273): organic blob, opacity 0.3, blur 75 */}
        <div
          ref={el => { flickerRefs.current[1] = el; }}
          style={{ position: "absolute", inset: 0, willChange: "transform, opacity" }}
        >
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: "49px",
              top: "-780px",
              width: "2142.001px",
              height: "1694.434px",
              filter: "blur(75px)",
            }}
          >
            <div style={{ transform: "rotate(-174.56deg) skewX(-1.93deg)", flexShrink: 0 }}>
              <div className="relative" style={{ width: "1955.609px", height: "1521.687px" }}>
                <img
                  alt=""
                  src="/wave-mountain/vector2.svg"
                  className="block absolute"
                  style={{
                    inset: "-9.86% -7.67%",
                    width: "calc(100% + 15.34%)",
                    height: "calc(100% + 19.72%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vector 3 (93274): same path, full opacity, blur 75 */}
        <div
          ref={el => { flickerRefs.current[2] = el; }}
          style={{ position: "absolute", inset: 0, willChange: "transform, opacity" }}
        >
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: "49px",
              top: "-780px",
              width: "2142.001px",
              height: "1694.434px",
              filter: "blur(75px)",
            }}
          >
            <div style={{ transform: "rotate(-174.56deg) skewX(-1.93deg)", flexShrink: 0 }}>
              <div className="relative" style={{ width: "1955.609px", height: "1521.687px" }}>
                <img
                  alt=""
                  src="/wave-mountain/vector3.svg"
                  className="block absolute"
                  style={{
                    inset: "-9.86% -7.67%",
                    width: "calc(100% + 15.34%)",
                    height: "calc(100% + 19.72%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vector 4 (93275): same path, opacity 0.3, blur 75 */}
        <div
          ref={el => { flickerRefs.current[3] = el; }}
          style={{ position: "absolute", inset: 0, willChange: "transform, opacity" }}
        >
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: "49px",
              top: "-780px",
              width: "2142.001px",
              height: "1694.434px",
              filter: "blur(75px)",
            }}
          >
            <div style={{ transform: "rotate(-174.56deg) skewX(-1.93deg)", flexShrink: 0 }}>
              <div className="relative" style={{ width: "1955.609px", height: "1521.687px" }}>
                <img
                  alt=""
                  src="/wave-mountain/vector4.svg"
                  className="block absolute"
                  style={{
                    inset: "-9.86% -7.67%",
                    width: "calc(100% + 15.34%)",
                    height: "calc(100% + 19.72%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vector 5 (93276): smaller blob, opacity 0.5, blur for smooth blending */}
        <div
          ref={el => { flickerRefs.current[4] = el; }}
          style={{ position: "absolute", inset: 0, willChange: "transform, opacity" }}
        >
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: "274.34px",
              top: "-601.75px",
              width: "1691.332px",
              height: "1337.931px",
              filter: "blur(60px)",
            }}
          >
            <div style={{ transform: "rotate(-174.56deg) skewX(-1.93deg)", flexShrink: 0 }}>
              <div className="relative" style={{ width: "1544.156px", height: "1201.53px" }}>
                <img
                  alt=""
                  src="/wave-mountain/vector5.svg"
                  className="block absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WebGL flame noise overlay: soft-light blend on top of blobs */}
      <FlameNoiseOverlay />

      {/* Vertical stripe overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 42px), repeating-linear-gradient(to right, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0) 42px)",
          backgroundSize: "42px 100%, 42px 100%",
        }}
      />

      <VersionSelector />

      <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6">
        <div className="text-white text-[20px] font-bold tracking-wider">DSRV</div>
        <div className="flex items-center gap-8">
          {["회사소개", "제품", "프로토콜", "스토리", "채용"].map((item) => (
            <span
              key={item}
              className="text-[15px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: "#C8A96E" }}
            >
              {item}
            </span>
          ))}
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <h1 className="text-[80px] font-bold leading-none tracking-[-0.8px]">
          DSRV가 일하는 가치관
        </h1>
      </div>
    </main>
  );
}
