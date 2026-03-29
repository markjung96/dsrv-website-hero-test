"use client";

import OceanSwellBackground from "../components/OceanSwellBackground";
import VersionSelector from "../components/VersionSelector";

export default function OceanSwellPage() {
  return (
    <main
      className="relative h-screen overflow-hidden"
      style={{ background: "linear-gradient(180deg, #014EEC 0%, #ffffff 100%)" }}
    >
      <OceanSwellBackground />

      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 42px), repeating-linear-gradient(to right, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0) 42px)",
          backgroundSize: "42px 100%, 42px 100%",
        }}
      />

      <VersionSelector />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <h1
          className="text-[80px] font-bold leading-none tracking-[-0.8px]"
          style={{ fontFamily: "'ITC Avant Garde Gothic Std', sans-serif" }}
        >
          DSRV가 일하는 가치관
        </h1>
      </div>
    </main>
  );
}
