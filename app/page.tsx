export default function Home() {
  return (
    <main className="relative h-screen overflow-hidden bg-white">
      {/* Background — 3 SVG vector shapes from Figma */}
      <div className="absolute inset-0">
        {/* Large left blob — Figma: left -152px, top 60px, 1505×1132 */}
        <img
          src="/blobs/blob-left.svg"
          alt=""
          className="blob blob-left"
          aria-hidden="true"
        />
        {/* Right-middle blob — Figma: left 1264px, top 499px, 734×526 */}
        <img
          src="/blobs/blob-right.svg"
          alt=""
          className="blob blob-right"
          aria-hidden="true"
        />
        {/* Upper-right blob — Figma: left 1224px, top -140px, 564×444, rotated -22deg */}
        <img
          src="/blobs/blob-top.svg"
          alt=""
          className="blob blob-top"
          aria-hidden="true"
        />
      </div>

      {/* Stripe Overlay — 42px vertical bars */}
      <div className="absolute inset-0 stripes" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <p className="text-[24px] font-bold leading-[1.4] tracking-[-0.24px] mb-[15px]">
          온체인 결제를 단일표준화하는 오케스트레이션 엔진
        </p>
        <h1 className="text-[64px] font-bold leading-none tracking-[-0.64px] mb-[24px]">
          스테이블코인 매니저
        </h1>
        <div className="text-[16px] font-normal leading-[1.8] tracking-[-0.16px] mb-[48px]">
          <p>가스비 허들과 멀티 체인 복잡성을 제거하고,</p>
          <p>기업의 기존 ERP 시스템과 스테이블코인 결제망을 즉시 연결하세요.</p>
        </div>
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
