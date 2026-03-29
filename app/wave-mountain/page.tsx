"use client";

import { useEffect, useState } from "react";
import VersionSelector from "../components/VersionSelector";

const DESIGN_WIDTH = 1920;
const DESIGN_HEIGHT = 1080;

export default function WaveMountainPage() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function updateScale() {
      const scaleX = window.innerWidth / DESIGN_WIDTH;
      const scaleY = window.innerHeight / DESIGN_HEIGHT;
      setScale(Math.max(scaleX, scaleY));
    }
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <main
      className="relative h-screen overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgb(1, 78, 236) 0%, rgba(41, 111, 255, 0) 55%, rgba(255, 255, 255, 0) 100%)",
      }}
    >
      {/* Blob container: 1920px design scaled to viewport width */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: DESIGN_WIDTH,
          height: "100vh",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      >
        {/* Vector 1 (93272): jagged blob, blur 150, rotated -83.46deg */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: "-60.34px",
            top: "47px",
            width: "1144.133px",
            height: "1265.792px",
            filter: "blur(150px)",
          }}
        >
          <div style={{ transform: "rotate(-83.46deg)", flexShrink: 0 }}>
            <div className="relative" style={{ width: "1157.303px", height: "1019px" }}>
              <img
                alt=""
                src="/wave-mountain/vector1.svg"
                className="block absolute"
                style={{
                  inset: "-29.44% -25.92%",
                  width: "calc(100% + 51.84%)",
                  height: "calc(100% + 58.88%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Vector 2 (93273): organic blob, opacity 0.3, blur 75 */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: "49px",
            top: "-780px",
            width: "2142.001px",
            height: "1694.434px",
            filter: "blur(75px)",
          }}
        >
          <div style={{ transform: "rotate(-174.56deg) skewX(-1.93deg)", flexShrink: 0 }}>
            <div className="relative" style={{ width: "1955.609px", height: "1521.687px" }}>
              <img
                alt=""
                src="/wave-mountain/vector2.svg"
                className="block absolute"
                style={{
                  inset: "-9.86% -7.67%",
                  width: "calc(100% + 15.34%)",
                  height: "calc(100% + 19.72%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Vector 3 (93274): same path, full opacity, blur 75 */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: "49px",
            top: "-780px",
            width: "2142.001px",
            height: "1694.434px",
            filter: "blur(75px)",
          }}
        >
          <div style={{ transform: "rotate(-174.56deg) skewX(-1.93deg)", flexShrink: 0 }}>
            <div className="relative" style={{ width: "1955.609px", height: "1521.687px" }}>
              <img
                alt=""
                src="/wave-mountain/vector3.svg"
                className="block absolute"
                style={{
                  inset: "-9.86% -7.67%",
                  width: "calc(100% + 15.34%)",
                  height: "calc(100% + 19.72%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Vector 4 (93275): same path, opacity 0.3, blur 75 */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: "49px",
            top: "-780px",
            width: "2142.001px",
            height: "1694.434px",
            filter: "blur(75px)",
          }}
        >
          <div style={{ transform: "rotate(-174.56deg) skewX(-1.93deg)", flexShrink: 0 }}>
            <div className="relative" style={{ width: "1955.609px", height: "1521.687px" }}>
              <img
                alt=""
                src="/wave-mountain/vector4.svg"
                className="block absolute"
                style={{
                  inset: "-9.86% -7.67%",
                  width: "calc(100% + 15.34%)",
                  height: "calc(100% + 19.72%)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Vector 5 (93276): smaller blob, opacity 0.5, blur for smooth blending */}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: "274.34px",
            top: "-601.75px",
            width: "1691.332px",
            height: "1337.931px",
            filter: "blur(60px)",
          }}
        >
          <div style={{ transform: "rotate(-174.56deg) skewX(-1.93deg)", flexShrink: 0 }}>
            <div className="relative" style={{ width: "1544.156px", height: "1201.53px" }}>
              <img
                alt=""
                src="/wave-mountain/vector5.svg"
                className="block absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vertical stripe overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to right, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 42px), repeating-linear-gradient(to right, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0) 42px)",
          backgroundSize: "42px 100%, 42px 100%",
        }}
      />

      <VersionSelector />

      <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6">
        <div className="text-white text-[20px] font-bold tracking-wider">DSRV</div>
        <div className="flex items-center gap-8">
          {["회사소개", "제품", "프로토콜", "스토리", "채용"].map((item) => (
            <span
              key={item}
              className="text-[15px] font-medium cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: "#C8A96E" }}
            >
              {item}
            </span>
          ))}
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
        <h1 className="text-[80px] font-bold leading-none tracking-[-0.8px]">
          DSRV가 일하는 가치관
        </h1>
      </div>
    </main>
  );
}
