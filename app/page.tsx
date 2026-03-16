import FluidBackground, { type FluidVariant } from "./components/FluidBackground";

const heroes: { variant: FluidVariant; title: string; subtitle: string }[] = [
  { variant: "stablecoin", title: "스테이블코인 매니저", subtitle: "온체인 결제를 단일표준화하는 오케스트레이션 엔진" },
  { variant: "portal", title: "DSRV Portal", subtitle: "한 번의 연동으로 누리는 쉽고 강력한 블록체인 인프라" },
  { variant: "allThatNode", title: "All That Node", subtitle: "복잡한 멀티체인 인프라를 하나로 잇는 가장 견고한 게이트웨이" },
  { variant: "walletHub", title: "Wallet Hub", subtitle: "보안과 사용성을 동시에 확보하는 MPC 지갑 인터페이스" },
  { variant: "stakingHub", title: "Staking Hub", subtitle: "기업 자산의 안전한 운용과 투명한 증빙을 위한 스테이킹 솔루션" },
  { variant: "custody", title: "Custody", subtitle: "모든 위협으로부터 자산을 격리하는 엔터프라이즈 수탁의 기준" },
];

export default function Home() {
  return (
    <main className="bg-white">
      {heroes.map(({ variant, title, subtitle }) => (
        <section key={variant} className="relative h-screen overflow-hidden">
          <FluidBackground variant={variant} />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <p className="text-[20px] font-bold leading-[1.4] tracking-[-0.2px] mb-[12px]">
              {subtitle}
            </p>
            <h1 className="text-[56px] font-bold leading-none tracking-[-0.56px] mb-[24px]">
              {title}
            </h1>
            <button className="flex items-center gap-[48px] h-[72px] px-[24px] backdrop-blur-[50px] bg-[rgba(245,246,255,0.4)] border border-transparent text-white text-[24px] font-bold leading-[1.4] tracking-[-0.24px] cursor-pointer transition-all duration-300 hover:bg-[rgba(245,246,255,0.55)]">
              <span className="min-w-[120px]">문의하기</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </section>
      ))}
    </main>
  );
}
