"use client";

import { useEffect, useRef, useState } from "react";

export default function OrbGradientAssetBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function updateScale() {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;
      setScale(parent.clientWidth / 1920);
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "#000" }}>
      <div
        ref={containerRef}
        style={{
          width: 1920,
          height: 4776,
          position: "absolute",
          left: "50%",
          top: 0,
          transformOrigin: "top center",
          transform: `translateX(-50%) scale(${scale})`,
        }}
      >
        {/* Layer 1: Vector 4353 - Main gradient */}
        <img
          src="/hero-v2/vector-gradient.svg"
          alt=""
          style={{
            position: "absolute",
            left: -127,
            top: 1778,
            width: 1211,
            height: 1847,
          }}
        />

        {/* Layer 2: Color overlay rectangle */}
        <img
          src="/hero-v2/color-overlay.png"
          alt=""
          style={{
            position: "absolute",
            left: 839,
            top: 218,
            width: 1193,
            height: 1232,
            mixBlendMode: "color",
            objectFit: "cover",
          }}
        />

        {/* Layer 3: Isolation mode light */}
        <img
          src="/hero-v2/isolation-light.png"
          alt=""
          style={{
            position: "absolute",
            left: 1036,
            top: 1204,
            width: 838,
            height: 829,
            filter: "blur(50px)",
          }}
        />

        {/* Layer 4: Small orb - CSS gradient matching Figma composite */}
        <div
          style={{
            position: "absolute",
            left: -118,
            top: 770,
            width: 761,
            height: 754,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 45% 45%, #1a3399 0%, #0d1f77 25%, #0a1155 45%, #223366 65%, #445577 80%, transparent 100%)",
            mixBlendMode: "lighten",
            opacity: 0.3,
            filter: "blur(20px)",
          }}
        />

        {/* Layer 5: Big orb - CSS gradient matching Figma composite */}
        <div
          style={{
            position: "absolute",
            left: 82,
            top: 75,
            width: 1069,
            height: 1052,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 50% 75%, #0022aa 0%, #001177 20%, #000a44 40%, #000411 60%, #000000 75%)",
            filter: "blur(100px)",
            opacity: 0.7,
          }}
        />

        {/* Layer 6: Vertical stripe overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(to right, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 42px)",
            backgroundSize: "42px 100%",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
