"use client";

import OrbGradientWebGLBackground from "../components/OrbGradientWebGLBackground";
import VersionSelector from "../components/VersionSelector";

export default function OrbWebGLPage() {
  return (
    <main className="relative h-screen overflow-hidden bg-black">
      <OrbGradientWebGLBackground />

      <VersionSelector />

      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center gap-1 px-4 py-4">
        <button className="px-4 py-2 text-[14px] font-semibold rounded-full bg-white/30 text-white backdrop-blur-md cursor-pointer">
          DSRV Portal
        </button>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <p className="text-[14px] md:text-[17px] lg:text-[20px] font-bold leading-[1.4] tracking-[-0.2px] mb-[8px] md:mb-[12px]">
          한 번의 연동으로 누리는 쉽고 강력한 블록체인 인프라
        </p>
        <h1 className="text-[28px] md:text-[40px] lg:text-[56px] font-bold leading-none tracking-[-0.56px] mb-[16px] md:mb-[24px]">
          DSRV Portal
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
