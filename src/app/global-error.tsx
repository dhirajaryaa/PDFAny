"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#09090b",
          color: "#f4f4f5",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#818cf8", margin: 0 }}>
            PDFAny
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "8px 0 4px" }}>
            Unexpected error
          </h1>
          <p style={{ color: "#a1a1aa", fontSize: 15, margin: "0 0 20px" }}>
            Your files never left your device.
          </p>
          {error.digest ? (
            <p style={{ color: "#636366", fontSize: 12, margin: "0 0 20px" }}>
              Error ID: {error.digest}
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              background: "#818cf8",
              border: 0,
              color: "#101014",
              fontWeight: 600,
              fontSize: 14,
              padding: "10px 20px",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}