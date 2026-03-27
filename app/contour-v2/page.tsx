"use client";

import { useState } from "react";
import ContourBlobBackgroundV2, { type ContourVariant } from "../components/ContourBlobBackgroundV2";
import VersionSelector from "../components/VersionSelector";

const heroes: { variant: ContourVariant; title: string; subtitle: string }[] = [
  { variant: "portal", title: "DSRV Portal", subtitle: "한 번의 연동으로 누리는 쉽고 강력한 블록체인 인프라" },
  { variant: "allThatNode", title: "All That Node", subtitle: "복잡한 멀티체인 인프라를 하나로 잇는 가장 견고한 게이트웨이" },
  { variant: "walletHub", title: "Wallet Hub", subtitle: "보안과 사용성을 동시에 확보하는 MPC 지갑 인터페이스" },
  { variant: "stablecoin", title: "Stablecoin Manager", subtitle: "온체인 결제를 단일표준화하는 오케스트레이션 엔진" },
  { variant: "stakingHub", title: "Staking Hub", subtitle: "기업 자산의 안전한 운용과 투명한 증빙을 위한 스테이킹 솔루션" },
  { variant: "custody", title: "Custody", subtitle: "모든 위협으로부터 자산을 격리하는 엔터프라이즈 수탁의 기준" },
];

export default function ContourV2Page() {
  const [activeIdx, setActiveIdx] = useState(0);
  const { variant } = heroes[activeIdx];

  return (
    <main className="relative h-screen overflow-hidden bg-white">
      <ContourBlobBackgroundV2 key={variant} variant={variant} />

      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 42px), repeating-linear-gradient(to right, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0) 42px)",
          backgroundSize: "42px 100%, 42px 100%",
        }}
      />

      <VersionSelector />

      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center gap-1 px-4 py-4">
        {heroes.map((h, i) => (
          <button
            key={h.variant}
            onClick={() => setActiveIdx(i)}
            className={`px-4 py-2 text-[14px] font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              i === activeIdx
                ? "bg-white/30 text-white backdrop-blur-md"
                : "text-white/60 hover:text-white/90 hover:bg-white/10"
            }`}
          >
            {h.title}
          </button>
        ))}
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center h-full" />
    </main>
  );
}
