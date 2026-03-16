"use client";

import { useEffect, useRef } from "react";

const CYCLE = 18;

const FRAMES = [
  {
    blobs: [
      { src: "/blobs/frame1/blob-c.svg", left: "-7.9%", top: "5.6%", width: "78.4%", height: "104.8%", rotate: 0 },
      { src: "/blobs/frame1/blob-b.svg", left: "63.8%", top: "-13%", width: "29.4%", height: "41.1%", rotate: -22.16 },
      { src: "/blobs/frame1/blob-a.svg", left: "65.8%", top: "46.2%", width: "38.2%", height: "48.7%", rotate: 0 },
    ],
  },
  {
    blobs: [
      { src: "/blobs/frame2/blob-c.svg", left: "-15.2%", top: "-38.7%", width: "89.7%", height: "133.8%", rotate: -13.15 },
      { src: "/blobs/frame2/blob-b.svg", left: "56.2%", top: "0%", width: "36.8%", height: "55%", rotate: 28.05 },
      { src: "/blobs/frame2/blob-a.svg", left: "50%", top: "35%", width: "47.6%", height: "60.6%", rotate: 0 },
    ],
  },
  {
    blobs: [
      { src: "/blobs/frame3/blob-c.svg", left: "-9%", top: "-28.4%", width: "101.8%", height: "145.2%", rotate: 7.27 },
      { src: "/blobs/frame3/blob-b.svg", left: "67.2%", top: "20.9%", width: "34.5%", height: "51.6%", rotate: 28.05 },
      { src: "/blobs/frame3/blob-a.svg", left: "32.6%", top: "30.2%", width: "54.7%", height: "94.1%", rotate: 39.23 },
    ],
  },
];

export default function BlobMorphBackground() {
  const stripesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stripesRef.current) return;
    const el = stripesRef.current;
    const count = Math.ceil(window.innerWidth / 42) + 2;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const stripe = document.createElement("div");
      stripe.style.cssText = `
        position:absolute;left:${i * 42}px;top:0;width:42px;height:100%;
        background:linear-gradient(to bottom,rgba(255,255,255,0.1),rgba(255,255,255,0));
        pointer-events:none;
      `;
      frag.appendChild(stripe);
    }
    el.appendChild(frag);
  }, []);

  return (
    <>
      <style>{`
        @keyframes morphFade1 {
          0%, 10%   { opacity: 1; }
          28%, 33%  { opacity: 0; }
          90%, 100% { opacity: 1; }
        }
        @keyframes morphFade2 {
          0%, 10%   { opacity: 0; }
          28%, 43%  { opacity: 1; }
          61%, 100% { opacity: 0; }
        }
        @keyframes morphFade3 {
          0%, 43%   { opacity: 0; }
          61%, 76%  { opacity: 1; }
          90%, 100% { opacity: 0; }
        }

        @keyframes drift1 {
          0%, 10%   { transform: translate(0%, 0%) scale(1); }
          28%, 33%  { transform: translate(1.5%, -2%) scale(1.03); }
          61%, 76%  { transform: translate(-1%, 1.5%) scale(0.98); }
          90%, 100% { transform: translate(0%, 0%) scale(1); }
        }
        @keyframes drift2 {
          0%, 10%   { transform: translate(0%, 0%) scale(1); }
          28%, 33%  { transform: translate(-1%, 1%) scale(1.02); }
          61%, 76%  { transform: translate(2%, -1.5%) scale(0.97); }
          90%, 100% { transform: translate(0%, 0%) scale(1); }
        }
        @keyframes drift3 {
          0%, 10%   { transform: translate(0%, 0%) scale(1); }
          28%, 33%  { transform: translate(1%, 2%) scale(0.98); }
          61%, 76%  { transform: translate(-1.5%, -1%) scale(1.04); }
          90%, 100% { transform: translate(0%, 0%) scale(1); }
        }

        .morph-frame-1 { animation: morphFade1 ${CYCLE}s ease-in-out infinite, drift1 ${CYCLE}s ease-in-out infinite; }
        .morph-frame-2 { animation: morphFade2 ${CYCLE}s ease-in-out infinite, drift2 ${CYCLE}s ease-in-out infinite; }
        .morph-frame-3 { animation: morphFade3 ${CYCLE}s ease-in-out infinite, drift3 ${CYCLE}s ease-in-out infinite; }
      `}</style>

      <div className="absolute inset-0 overflow-hidden bg-white">
        {FRAMES.map((frame, fi) => (
          <div
            key={fi}
            className={`absolute inset-0 morph-frame-${fi + 1}`}
            style={{ willChange: "opacity, transform" }}
          >
            {frame.blobs.map((blob, bi) => (
              <img
                key={bi}
                src={blob.src}
                alt=""
                style={{
                  position: "absolute",
                  left: blob.left,
                  top: blob.top,
                  width: blob.width,
                  height: blob.height,
                  transform: `rotate(${blob.rotate}deg)`,
                }}
              />
            ))}
          </div>
        ))}

        <div
          ref={stripesRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 10 }}
        />
      </div>
    </>
  );
}
