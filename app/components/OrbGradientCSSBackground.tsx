"use client";

export default function OrbGradientCSSBackground() {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "black",
      }}
    >
      {/* Layer 1 - Main gradient vector (Vector 4353) */}
      <img
        src="/hero-v2/vector-gradient.svg"
        alt=""
        style={{
          position: "absolute",
          left: "-6.6%",
          top: "37.2%",
          width: "63.1%",
          height: "38.7%",
          objectFit: "cover",
        }}
      />

      {/* Layer 2 - Color overlay rectangle */}
      <img
        src="/hero-v2/color-overlay.png"
        alt=""
        style={{
          position: "absolute",
          left: "43.7%",
          top: "4.6%",
          width: "62.1%",
          height: "25.8%",
          mixBlendMode: "color",
          objectFit: "cover",
        }}
      />

      {/* Layer 3 - Isolation Mode light */}
      <img
        src="/hero-v2/isolation-light.png"
        alt=""
        style={{
          position: "absolute",
          left: "53.9%",
          top: "25.2%",
          width: "43.6%",
          height: "17.4%",
          filter: "blur(50px)",
          objectFit: "cover",
        }}
      />

      {/* Layer 4 - Small orb container */}
      <div
        style={{
          position: "absolute",
          left: "-6.1%",
          top: "16.1%",
          width: "39.6%",
          height: "15.8%",
          mixBlendMode: "lighten",
          opacity: 0.3,
        }}
      >
        {/* Sub-layer A - saturation */}
        <img
          src="/hero-v2/orb-small-sat.png"
          alt=""
          style={{
            position: "absolute",
            inset: "-15.62% -9.04% -12.95% -18.05%",
            width: "auto",
            height: "auto",
            mixBlendMode: "saturation",
            objectFit: "cover",
          }}
        />
        {/* Sub-layer B - color */}
        <img
          src="/hero-v2/orb-small-color.png"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            mixBlendMode: "color",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Layer 5 - Big orb container */}
      <div
        style={{
          position: "absolute",
          left: "4.3%",
          top: "1.6%",
          width: "55.7%",
          height: "22.0%",
          filter: "blur(100px)",
          opacity: 0.7,
        }}
      >
        {/* Sub-layer A - saturation */}
        <img
          src="/hero-v2/orb-large-sat.png"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            mixBlendMode: "saturation",
            objectFit: "cover",
          }}
        />
        {/* Sub-layer B - color */}
        <img
          src="/hero-v2/orb-large-color.png"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            mixBlendMode: "color",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Layer 6 - Vertical stripe overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(to right, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 42px)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
