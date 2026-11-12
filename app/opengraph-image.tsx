import { ImageResponse } from "next/og";
export const alt = "JanaSetu AI — Your bridge to public benefits";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg,#fff7ed,#f3e5d2)", padding: 72, color: "#3f3025", fontFamily: "Arial", position: "relative" }}>
      <div style={{ position: "absolute", right: 60, top: 40, width: 470, height: 470, borderRadius: 40, background: "#edcfb1", opacity: 0.6, display: "flex" }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 700 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 52, fontWeight: 800 }}>
          <div style={{ width: 76, height: 76, borderRadius: 20, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, color: "#b25916" }}>ज</div>
          <div style={{ display: "flex" }}>JanaSetu AI</div>
        </div>
        <div style={{ display: "flex", fontSize: 58, fontWeight: 800, lineHeight: 1.12, marginTop: 56 }}>Your bridge to public benefits.</div>
        <div style={{ display: "flex", fontSize: 26, color: "#796454", marginTop: 28 }}>Discover · Understand · Prepare</div>
      </div>
      <div style={{ position: "absolute", right: 160, bottom: 70, width: 210, height: 340, borderRadius: 30, background: "#3f3025", padding: 16, display: "flex" }}>
        <div style={{ background: "#fffaf4", borderRadius: 18, width: "100%", padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ height: 42, borderRadius: 9, background: "#f7e8d7", display: "flex" }} />
          <div style={{ height: 85, borderRadius: 10, background: "#fff", border: "2px solid #e7d3bd", display: "flex" }} />
          <div style={{ height: 85, borderRadius: 10, background: "#fff", border: "2px solid #e7d3bd", display: "flex" }} />
        </div>
      </div>
    </div>, size
  );
}
