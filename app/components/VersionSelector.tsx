"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface VersionItem {
  path: string;
  label: string;
  desc: string;
}

interface VersionGroup {
  group: string;
  items: VersionItem[];
}

const VERSION_GROUPS: VersionGroup[] = [
  {
    group: "기존 배경",
    items: [
      { path: "/wave-flow", label: "Wave Flow", desc: "노이즈 기반 유체 흐름" },
      { path: "/random-color", label: "Random Color", desc: "유체 + 랜덤 컬러" },
      { path: "/blob-morph", label: "Blob Morph", desc: "SVG 블롭 프레임 보간" },
      { path: "/bubble", label: "Bubble", desc: "WebGL 버블 셰이더" },
      { path: "/pulse", label: "Pulse", desc: "WebGL 펄스 셰이더" },
      { path: "/carousel", label: "Carousel", desc: "3D 캐러셀 카드" },
      { path: "/ocean-swell", label: "Ocean Swell", desc: "독립 너울 레이어 + caustic" },
    ],
  },
  {
    group: "메타볼",
    items: [
      { path: "/metaball", label: "Metaball", desc: "3개 블롭 합쳐지고 분리" },
    ],
  },
  {
    group: "등고선",
    items: [
      { path: "/contour", label: "Contour Blob", desc: "등고선 스펙트럼 블롭" },
    ],
  },
  {
    group: "단일 블롭 모프",
    items: [
      { path: "/morph-blob", label: "Morph Blob", desc: "대각선 고정 그라데이션" },
      { path: "/morph-rotate", label: "Morph Rotate", desc: "회전 그라데이션" },
      { path: "/morph-vivid", label: "Morph Vivid", desc: "진한 경계 버전" },
      { path: "/morph-vivid-rotate", label: "Morph Vivid Rotate", desc: "진한 경계 + 회전 그라데이션" },
    ],
  },
  {
    group: "소프트 블롭",
    items: [
      { path: "/soft-blob", label: "Soft Blob", desc: "가우시안 페이드, 깨끗한 그라데이션" },
      { path: "/soft-blob-rotate", label: "Soft Blob Rotate", desc: "가우시안 페이드 + 회전 그라데이션" },
    ],
  },
  {
    group: "파도 산",
    items: [
      { path: "/wave-mountain-a", label: "Wave Mountain (정적)", desc: "피그마 SVG 블롭 레이어" },
      { path: "/wave-mountain-f", label: "Wave Mountain Flame (소)", desc: "프로시저럴 불꽃 — 세밀한 일렁임" },
      { path: "/wave-mountain-f2", label: "Flame 블루바이올렛", desc: "#292BEC → #165DEC → #A4C0F9" },
      { path: "/wave-mountain-f3", label: "Flame 다크", desc: "#0A0A0A → #0A0AAF → #154AC9" },
      { path: "/wave-mountain-f4", label: "Flame (대) 다크 그라데이션", desc: "#0A0A0A → #0A0AAF → #154AC9 투명 블롭" },
      { path: "/wave-mountain-f5", label: "Wave Mountain Flame (대) 원본", desc: "프로시저럴 불꽃 — 큰 스윕 + 수평 드리프트" },
    ],
  },
  {
    group: "Orb 그라데이션 (Figma V2)",
    items: [
      { path: "/orb-webgl", label: "Orb WebGL", desc: "WebGL 셰이더로 프로시저럴 재현" },
      { path: "/orb-css", label: "Orb CSS", desc: "CSS mix-blend-mode + blur 레이어 합성" },
      { path: "/orb-asset", label: "Orb Asset", desc: "Figma 에셋 픽셀 좌표 직접 배치" },
      { path: "/orb-contour", label: "Orb Contour", desc: "Figma 등고선 오브 에셋 직접 사용" },
    ],
  },
];

const ALL_VERSIONS = VERSION_GROUPS.flatMap((g) => g.items);

export default function VersionSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = ALL_VERSIONS.find((v) => v.path === pathname) ?? ALL_VERSIONS[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="absolute top-4 left-4 z-30" style={{ minWidth: 260 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:bg-black/70"
      >
        <span>{current.label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 200ms" }}
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="mt-1 rounded-xl overflow-hidden bg-black/60 backdrop-blur-xl border border-white/20 max-h-[70vh] overflow-y-auto">
          {VERSION_GROUPS.map((group) => (
            <div key={group.group}>
              <div className="px-4 py-2 text-[11px] font-bold text-white/40 uppercase tracking-wider">
                {group.group}
              </div>
              {group.items.map((v) => (
                <button
                  key={v.path}
                  onClick={() => {
                    setOpen(false);
                    if (v.path !== pathname) router.push(v.path);
                  }}
                  className={`w-full text-left px-4 py-2 transition-colors duration-150 cursor-pointer ${
                    v.path === pathname
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="text-[14px] font-medium">{v.label}</div>
                  <div className="text-[11px] text-white/50">{v.desc}</div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
