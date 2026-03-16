"use client";

import BlobMorphBackground from "../components/BlobMorphBackground";
import VersionSelector from "../components/VersionSelector";

export default function BlobMorphPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-white">
      <BlobMorphBackground />

      <VersionSelector />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <p className="text-[20px] font-bold leading-[1.4] tracking-[-0.2px] mb-[12px]">
          온체인 결제를 단일표준화하는 오케스트레이션 엔진
        </p>
        <h1 className="text-[56px] font-bold leading-none tracking-[-0.56px] mb-[24px]">
          스테이블코인 매니저
        </h1>
        <button className="flex items-center gap-[48px] h-[72px] px-[24px] backdrop-blur-[50px] bg-[rgba(245,246,255,0.4)] border border-transparent text-white text-[24px] font-bold leading-[1.4] tracking-[-0.24px] cursor-pointer transition-all duration-300 hover:bg-[rgba(245,246,255,0.55)]">
          <span className="min-w-[120px]">문의하기</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </main>
  );
}
