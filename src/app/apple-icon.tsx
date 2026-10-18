import { ImageResponse } from "next/og";

// Home-screen icon for iPhones/iPads: the SUSU BOX money box on brand green.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b3326" }}>
        <svg width="132" height="132" viewBox="0 0 48 48">
          <rect x="4" y="14" width="40" height="30" rx="9" fill="#175a43" />
          <path d="M4 30h40" stroke="#d99a2b" strokeWidth="2.5" />
          <path d="M4 35h40" stroke="#c4553a" strokeWidth="1.5" opacity=".8" />
          <rect x="17" y="19" width="14" height="3" rx="1.5" fill="#fbf7ef" />
          <circle cx="24" cy="10" r="7" fill="#d99a2b" />
          <path d="M24 6.5v7M21.5 8.5h3.75a1.75 1.75 0 0 1 0 3.5H22" stroke="#0b3326" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size,
  );
}
