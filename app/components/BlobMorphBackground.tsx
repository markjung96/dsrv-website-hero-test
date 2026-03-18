"use client";

import { useEffect, useRef } from "react";

const CYCLE = 30;

const BLOB_FRAMES = [
  [
    { src: "/blobs/frame1/blob-c.svg", left: -7.9, top: 5.6, width: 78.4, height: 104.8, rotate: 0 },
    { src: "/blobs/frame2/blob-c.svg", left: -15.2, top: -38.7, width: 89.7, height: 133.8, rotate: -13.15 },
    { src: "/blobs/frame3/blob-c.svg", left: -9, top: -28.4, width: 101.8, height: 145.2, rotate: 7.27 },
  ],
  [
    { src: "/blobs/frame1/blob-b.svg", left: 63.8, top: -13, width: 29.4, height: 41.1, rotate: -22.16 },
    { src: "/blobs/frame2/blob-b.svg", left: 56.2, top: 0, width: 36.8, height: 55, rotate: 28.05 },
    { src: "/blobs/frame3/blob-b.svg", left: 67.2, top: 20.9, width: 34.5, height: 51.6, rotate: 28.05 },
  ],
  [
    { src: "/blobs/frame1/blob-a.svg", left: 65.8, top: 46.2, width: 38.2, height: 48.7, rotate: 0 },
    { src: "/blobs/frame2/blob-a.svg", left: 50, top: 35, width: 47.6, height: 60.6, rotate: 0 },
    { src: "/blobs/frame3/blob-a.svg", left: 32.6, top: 30.2, width: 54.7, height: 94.1, rotate: 39.23 },
  ],
];

const FRAME_COUNT = 3;
const HOLD_RATIO = 0;

function easeInOutSine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getInterpolation(cycleProgress: number) {
  const segDur = 1 / FRAME_COUNT;
  const segment = Math.min(Math.floor(cycleProgress / segDur), FRAME_COUNT - 1);
  const segProgress = (cycleProgress - segment * segDur) / segDur;

  const fromIdx = segment % FRAME_COUNT;
  const toIdx = (segment + 1) % FRAME_COUNT;

  let t: number;
  if (segProgress < HOLD_RATIO) {
    t = 0;
  } else {
    t = easeInOutSine((segProgress - HOLD_RATIO) / (1 - HOLD_RATIO));
  }

  return { fromIdx, toIdx, t };
}

export default function BlobMorphBackground() {
  const stripesRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<(HTMLDivElement | null)[][]>(
    BLOB_FRAMES.map(() => [null, null, null])
  );
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);

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

  useEffect(() => {
    let animId: number;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = (now - start) / 1000;
      const progress = (elapsed % CYCLE) / CYCLE;
      const { fromIdx, toIdx, t } = getInterpolation(progress);

      for (let bi = 0; bi < BLOB_FRAMES.length; bi++) {
        const frames = BLOB_FRAMES[bi];
        const from = frames[fromIdx];
        const to = frames[toIdx];

        const wrapper = wrapperRefs.current[bi];
        if (wrapper) {
          wrapper.style.left = `${lerp(from.left, to.left, t)}%`;
          wrapper.style.top = `${lerp(from.top, to.top, t)}%`;
          wrapper.style.width = `${lerp(from.width, to.width, t)}%`;
          wrapper.style.height = `${lerp(from.height, to.height, t)}%`;
          wrapper.style.transform = `rotate(${lerp(from.rotate, to.rotate, t)}deg)`;
        }

        for (let fi = 0; fi < FRAME_COUNT; fi++) {
          const imgEl = blobRefs.current[bi][fi];
          if (!imgEl) continue;

          let opacity = 0;
          if (fi === fromIdx && fi === toIdx) {
            opacity = 1;
          } else if (fi === fromIdx) {
            opacity = 1 - t;
          } else if (fi === toIdx) {
            opacity = t;
          }
          imgEl.style.opacity = String(opacity);
        }
      }

      animId = requestAnimationFrame(tick);
    }

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      {BLOB_FRAMES.map((frames, bi) => (
        <div
          key={bi}
          ref={(el) => { wrapperRefs.current[bi] = el; }}
          style={{
            position: "absolute",
            left: `${frames[0].left}%`,
            top: `${frames[0].top}%`,
            width: `${frames[0].width}%`,
            height: `${frames[0].height}%`,
            transform: `rotate(${frames[0].rotate}deg)`,
            willChange: "left, top, width, height, transform",
          }}
        >
          {frames.map((frame, fi) => (
            <img
              key={fi}
              ref={(el) => { blobRefs.current[bi][fi] = el; }}
              src={frame.src}
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                opacity: fi === 0 ? 1 : 0,
              }}
            />
          ))}
        </div>
      ))}

      <div ref={stripesRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }} />
    </div>
  );
}
