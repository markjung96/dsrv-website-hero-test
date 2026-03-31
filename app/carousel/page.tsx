"use client";

import Carousel3D from "../components/Carousel3D";
import VersionSelector from "../components/VersionSelector";

const heroes = [
  {
    title: "Staking Hub",
    subtitle: "기업 자산의 안전한 운용과\n투명한 증빙을 위한 스테이킹 솔루션",
  },
  {
    title: "Stablecoin\nManager",
    subtitle: "온체인 결제와 금융 표준을 연결하는\n기업형 결제 통합 솔루션",
  },
  {
    title: "All That Node",
    subtitle: "검증된 전문성 기반 고성능 멀티체인\nRPC노드 솔루션",
  },
  {
    title: "WaaS",
    subtitle: "Web3의 편의성과 기관급 보안을 결합한\nMPC 지갑 플랫폼",
  },
  {
    title: "Custody",
    subtitle: "콜드월렛(오프라인 보안) 기반\n자산 안전 보관 서비스",
  },
];

export default function CarouselPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <img
          src="/hero-bg.svg"
          alt=""
          className="w-[80vw] max-w-[1200px] h-auto"
        />
      </div>

      <VersionSelector />

      <div className="relative z-10 flex items-center justify-center h-screen px-4">
        <Carousel3D items={heroes} />
      </div>
    </main>
  );
}
