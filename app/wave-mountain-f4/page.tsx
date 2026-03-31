"use client";

import VersionSelector from "../components/VersionSelector";
import FlameAuroraLargeBackground from "../components/FlameAuroraLargeBackground";

export default function WaveMountainFlame4Page() {
  return (
    <main className="relative h-screen overflow-hidden">
      <FlameAuroraLargeBackground />

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
