"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const VERSIONS = [
  { path: "/wave-flow", label: "Wave Flow" },
  { path: "/random-color", label: "Random Color" },
  { path: "/blob-morph", label: "Blob Morph" },
] as const;

export default function VersionSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = VERSIONS.find((v) => v.path === pathname) ?? VERSIONS[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="absolute top-4 left-4 z-30" style={{ minWidth: 180 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-white text-[14px] font-semibold cursor-pointer transition-all duration-200 hover:bg-white/30"
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
        <div className="mt-1 rounded-xl overflow-hidden bg-white/20 backdrop-blur-xl border border-white/10">
          {VERSIONS.map((v) => (
            <button
              key={v.path}
              onClick={() => {
                setOpen(false);
                if (v.path !== pathname) router.push(v.path);
              }}
              className={`w-full text-left px-4 py-2.5 text-[14px] font-medium transition-colors duration-150 cursor-pointer ${
                v.path === pathname
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
