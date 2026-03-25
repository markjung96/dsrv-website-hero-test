"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface CarouselItem {
  title: string;
  subtitle: string;
}

interface Carousel3DProps {
  items: CarouselItem[];
}

const VISIBLE_RANGE = 4;
const SPEED = 0.3; // items per second

export default function Carousel3D({ items }: Carousel3DProps) {
  const len = items.length;
  const mod = (n: number) => ((n % len) + len) % len;

  const [position, setPosition] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartPos, setDragStartPos] = useState(0);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const posRef = useRef(position);
  posRef.current = position;

  const prevTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (isHovered || isDragging) {
      prevTimeRef.current = null;
      return;
    }

    const animate = (time: number) => {
      if (prevTimeRef.current !== null) {
        const dt = (time - prevTimeRef.current) / 1000;
        setPosition((prev) => prev + SPEED * dt);
      }
      prevTimeRef.current = time;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isHovered, isDragging]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      setDragStartX(e.clientX);
      setDragStartPos(posRef.current);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const diff = e.clientX - dragStartX;
      setPosition(dragStartPos - diff / 200);
    },
    [isDragging, dragStartX, dragStartPos],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setPosition((prev) => Math.round(prev));
  }, [isDragging]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 5) return;
      e.preventDefault();
      setPosition((prev) => prev + delta * 0.002);
    },
    [],
  );

  const handleCardClick = useCallback((slotIndex: number) => {
    setPosition(slotIndex);
  }, []);

  const centerIndex = Math.round(position);
  const fractional = position - centerIndex;

  const slots = Array.from(
    { length: VISIBLE_RANGE * 2 + 1 },
    (_, i) => centerIndex - VISIBLE_RANGE + i,
  );

  const getCardStyle = (slotIndex: number): React.CSSProperties => {
    const offset = slotIndex - position;
    const absOffset = Math.abs(offset);
    const rotateY = offset * -35;
    const translateX = offset * 110;
    const translateZ = absOffset * 80;
    const opacity = absOffset > 4 ? 0 : 1 - absOffset * 0.15;

    return {
      transform: `translateX(calc(-50% + ${translateX}%)) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
      opacity: Math.max(opacity, 0),
      zIndex: Math.round(10 - absOffset),
      pointerEvents: absOffset > 2 ? "none" : "auto",
      transition: isDragging ? "none" : "opacity 0.3s ease",
    };
  };

  return (
    <div
      className="relative w-full flex items-center justify-center select-none"
      style={{ perspective: "1000px", height: "clamp(350px, 40vw, 540px)" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => { setIsDragging(false); setIsHovered(false); }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onWheel={handleWheel}
    >
      <div className="relative" style={{ transformStyle: "preserve-3d", width: "clamp(250px, 26vw, 380px)", height: "clamp(340px, 36vw, 520px)" }}>
        {slots.map((slotIndex) => {
          const offset = slotIndex - position;
          const absOffset = Math.abs(offset);
          const item = items[mod(slotIndex)];
          const isCardHovered = hoveredSlot === slotIndex;

          return (
            <div
              key={slotIndex}
              className="absolute top-0 left-1/2 w-full h-full"
              style={getCardStyle(slotIndex)}
              onMouseEnter={() => setHoveredSlot(slotIndex)}
              onMouseLeave={() => setHoveredSlot(null)}
            >
              <div
                onClick={() => handleCardClick(slotIndex)}
                className="relative w-full h-full rounded-[40px] cursor-pointer flex flex-col items-center justify-center px-8 text-center overflow-hidden"
                style={{
                  background: isCardHovered
                    ? "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 60%, rgba(255,255,255,0.08) 100%)"
                    : "linear-gradient(130.7deg, rgba(243, 244, 252, 0.1) 23%, rgba(38, 105, 244, 0.1) 96%)",
                  backdropFilter: isCardHovered
                    ? "blur(12px) saturate(200%) brightness(1.12)"
                    : `blur(${4 + absOffset * 4}px) saturate(130%)`,
                  WebkitBackdropFilter: isCardHovered
                    ? "blur(12px) saturate(200%) brightness(1.12)"
                    : `blur(${4 + absOffset * 4}px) saturate(130%)`,
                  border: isCardHovered
                    ? "1.5px solid rgba(255, 255, 255, 0.45)"
                    : "1px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: isCardHovered
                    ? "0 8px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(255,255,255,0.15)"
                    : "0 4px 24px rgba(0, 0, 0, 0.04)",
                  transition: "background 0.3s, backdrop-filter 0.3s, border 0.3s, box-shadow 0.3s",
                }}
              >
                {isCardHovered && (
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
                      isCardHovered
                        ? "text-white text-[clamp(32px,3.3vw,48px)] leading-[1.6]"
                        : "text-[clamp(32px,3.3vw,48px)] leading-[1.2] bg-clip-text text-transparent bg-gradient-to-r from-black to-[#666]"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-[clamp(14px,1.4vw,20px)] font-normal leading-[1.6] tracking-[-0.2px] text-center ${
                      isCardHovered
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
