"use client";

import { Toaster } from "react-hot-toast";

// Mounted once at the app root. Toasts appear centered at the top of the
// viewport and are styled to read on both the light and dark themes.
export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3200,
        style: {
          borderRadius: "10px",
          border: "1px solid rgba(0,0,0,0.12)",
          background: "#111111",
          color: "#ffffff",
          fontWeight: 600,
          fontSize: "14px",
          maxWidth: "90vw",
        },
        success: { iconTheme: { primary: "#22c55e", secondary: "#111111" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "#111111" } },
      }}
    />
  );
}
