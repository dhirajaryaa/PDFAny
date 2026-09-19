import { ImageResponse } from "next/og";
import { LOGO_DATA_URI_INVERTED } from "@/lib/logo";

const AVATAR = "https://github.com/dhirajaryaa.png";

export function buildOgImage(opts: {
  titleLines: string[];
  subtitle: string;
  accent?: string;
}) {
  const { titleLines, subtitle, accent = "#6366f1" } = opts;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0c0a1d",
          color: "#f4f4f5",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- inline data-URI raster (brand logo, inverted for dark OG card) */}
          <img src={LOGO_DATA_URI_INVERTED} alt="" width={56} height={56} style={{ borderRadius: 16 }} />
          <span style={{ fontSize: 30, fontWeight: 700 }}>PDFAny</span>
          <span style={{ fontSize: 24, color: "#9ca3af" }}>· Free PDF tools</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {titleLines.map((line) => (
            <div
              key={line}
              style={{
                display: "flex",
                fontSize: 68,
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                color: accent === "#eab308" ? "#fde047" : "#ffffff",
              }}
            >
              {line}
            </div>
          ))}
          <div style={{ display: "flex", fontSize: 30, color: "#a1a1aa" }}>
            {subtitle}
          </div>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote avatar raster for satori */}
            <img
              src={AVATAR}
              alt=""
              width={48}
              height={48}
              style={{ borderRadius: 24, border: "2px solid #818cf8" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 20, fontWeight: 600 }}>Made by Dhiraj Arya</span>
              <span style={{ fontSize: 17, color: "#a1a1aa" }}>dhirajarya.in</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 20, color: "#c7c7d1", alignItems: "center" }}>
            <span style={{ color: "#34d399", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "#34d399" }} />
              No upload — private
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "#818cf8" }} />
              Free forever
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}