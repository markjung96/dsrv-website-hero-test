"use client";

import { useState } from "react";
import MorphBlobBackground, { type MorphVariant } from "../components/MorphBlobBackground";
import VersionSelector from "../components/VersionSelector";

const heroes: { variant: MorphVariant; title: string; subtitle: string }[] = [
  { variant: "portal", title: "DSRV Portal", subtitle: "한 번의 연동으로 누리는 쉽고 강력한 블록체인 인프라" },
  { variant: "allThatNode", title: "All That Node", subtitle: "복잡한 멀티체인 인프라를 하나로 잇는 가장 견고한 게이트웨이" },
  { variant: "walletHub", title: "Wallet Hub", subtitle: "보안과 사용성을 동시에 확보하는 MPC 지갑 인터페이스" },
  { variant: "stablecoin", title: "Stablecoin Manager", subtitle: "온체인 결제를 단일표준화하는 오케스트레이션 엔진" },
  { variant: "stakingHub", title: "Staking Hub", subtitle: "기업 자산의 안전한 운용과 투명한 증빙을 위한 스테이킹 솔루션" },
  { variant: "custody", title: "Custody", subtitle: "모든 위협으로부터 자산을 격리하는 엔터프라이즈 수탁의 기준" },
];

export default function MorphVividPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const { variant, title, subtitle } = heroes[activeIdx];

  return (
    <main className="relative h-screen overflow-hidden bg-white">
      <MorphBlobBackground key={variant} variant={variant} softEdge={false} />

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

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <p className="text-[14px] md:text-[17px] lg:text-[20px] font-bold leading-[1.4] tracking-[-0.2px] mb-[8px] md:mb-[12px]">
          {subtitle}
        </p>
        <h1 className="text-[28px] md:text-[40px] lg:text-[56px] font-bold leading-none tracking-[-0.56px] mb-[16px] md:mb-[24px]">
          {title}
        </h1>
        <button className="flex items-center gap-[24px] md:gap-[36px] lg:gap-[48px] h-[48px] md:h-[60px] lg:h-[72px] px-[16px] md:px-[20px] lg:px-[24px] backdrop-blur-[50px] bg-[rgba(245,246,255,0.4)] border border-transparent text-white text-[16px] md:text-[20px] lg:text-[24px] font-bold leading-[1.4] tracking-[-0.24px] cursor-pointer transition-all duration-300 hover:bg-[rgba(245,246,255,0.55)]">
          <span className="min-w-[80px] md:min-w-[100px] lg:min-w-[120px]">문의하기</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </main>
  );
}
