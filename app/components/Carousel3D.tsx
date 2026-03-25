"use client";

import { useState, useCallback } from "react";

interface CarouselItem {
  title: string;
  subtitle: string;
}

interface Carousel3DProps {
  items: CarouselItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

export default function Carousel3D({ items, activeIndex, onSelect }: Carousel3DProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      setIsDragging(false);
      const diff = e.clientX - dragStartX;
      if (Math.abs(diff) > 50) {
        const next = diff < 0
          ? Math.min(activeIndex + 1, items.length - 1)
          : Math.max(activeIndex - 1, 0);
        onSelect(next);
      }
    },
    [isDragging, dragStartX, activeIndex, items.length, onSelect],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 10) return;
      e.preventDefault();
      const next = delta > 0
        ? Math.min(activeIndex + 1, items.length - 1)
        : Math.max(activeIndex - 1, 0);
      if (next !== activeIndex) onSelect(next);
    },
    [activeIndex, items.length, onSelect],
  );

  const getCardStyle = (index: number): React.CSSProperties => {
    const offset = index - activeIndex;
    const absOffset = Math.abs(offset);

    const rotateY = offset * -35;
    const translateX = offset * 110;
    const translateZ = absOffset * 80;
    const opacity = absOffset > 2 ? 0 : 1 - absOffset * 0.2;

    return {
      transform: `translateX(calc(-50% + ${translateX}%)) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
      opacity: Math.max(opacity, 0),
      zIndex: 10 - absOffset,
      pointerEvents: absOffset > 1 ? "none" : "auto",
      transition: "all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)",
    };
  };

  return (
    <div
      className="relative w-full flex items-center justify-center select-none"
      style={{ perspective: "1000px", height: "clamp(350px, 40vw, 540px)" }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => setIsDragging(false)}
      onWheel={handleWheel}
    >
      <div className="relative" style={{ transformStyle: "preserve-3d", width: "clamp(250px, 26vw, 380px)", height: "clamp(340px, 36vw, 520px)" }}>
        {items.map((item, i) => {
          const isActive = i === activeIndex;
          const offset = i - activeIndex;
          const absOffset = Math.abs(offset);

          return (
            <div
              key={i}
              className="absolute top-0 left-1/2 w-full h-full"
              style={getCardStyle(i)}
            >
              <div
                onClick={() => onSelect(i)}
                className="relative w-full h-full rounded-[40px] cursor-pointer flex flex-col items-center justify-center px-8 text-center overflow-hidden"
                style={isActive ? {
                  background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.08) 100%)",
                  backdropFilter: "blur(12px) saturate(200%) brightness(1.12)",
                  WebkitBackdropFilter: "blur(12px) saturate(200%) brightness(1.12)",
                  border: "1.5px solid rgba(255, 255, 255, 0.45)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(255,255,255,0.15)",
                } : {
                  background: "linear-gradient(130.7deg, rgba(243, 244, 252, 0.1) 23%, rgba(38, 105, 244, 0.1) 96%)",
                  backdropFilter: `blur(${4 + absOffset * 4}px) saturate(130%)`,
                  WebkitBackdropFilter: `blur(${4 + absOffset * 4}px) saturate(130%)`,
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04)",
                }}
              >
                {isActive && (
                  <div
                    className="absolute top-0 left-0 right-0 h-[40%] pointer-events-none rounded-t-[40px]"
                    style={{
                      background: "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)",
                    }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-[16px] text-center">
                  <h3
                    className={`font-bold tracking-[-0.48px] text-center ${
                      isActive
                        ? "text-white text-[clamp(32px,3.3vw,48px)] leading-[1.6]"
                        : "text-[clamp(32px,3.3vw,48px)] leading-[1.2] bg-clip-text text-transparent bg-gradient-to-r from-black to-[#666]"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-[clamp(14px,1.4vw,20px)] font-normal leading-[1.6] tracking-[-0.2px] text-center ${
                      isActive
                        ? "text-white"
                        : "bg-clip-text text-transparent bg-gradient-to-r from-black to-[#666]"
                    }`}
                  >
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
