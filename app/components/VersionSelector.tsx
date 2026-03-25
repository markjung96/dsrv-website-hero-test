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
