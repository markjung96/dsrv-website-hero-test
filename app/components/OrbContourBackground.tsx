"use client";

export default function OrbContourBackground() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img
        src="/hero-v2/orb-contour.svg"
        alt=""
        style={{
          width: "min(80vw, 80vh)",
          height: "auto",
          objectFit: "contain",
          filter: "drop-shadow(0 0 60px rgba(100, 200, 255, 0.3))",
        }}
      />
    </div>
  );
}
