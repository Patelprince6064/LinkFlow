import { QRCodeSVG } from "qrcode.react";
import { createRoot } from "react-dom/client";
import React from "react";

/** Render QR SVGs off-screen and trigger PNG downloads one by one. */
export async function exportQRCodesBulk(links, opts = {}) {
  const { fg = "#000000", bg = "#ffffff", size = 512 } = opts;
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-9999px;top:0;";
  document.body.appendChild(holder);

  try {
    for (const link of links) {
      const mount = document.createElement("div");
      holder.appendChild(mount);
      const root = createRoot(mount);
      root.render(
        React.createElement(QRCodeSVG, {
          value: link.shortUrl,
          size,
          level: "H",
          includeMargin: true,
          fgColor: fg,
          bgColor: bg,
        })
      );
      // wait a tick for render
      await new Promise((r) => setTimeout(r, 60));
      const svg = mount.querySelector("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);
        await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
        });
        const a = document.createElement("a");
        a.download = `qr-${link.shortCode}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
        await new Promise((r) => setTimeout(r, 250));
      }
      root.unmount();
      mount.remove();
    }
  } finally {
    holder.remove();
  }
}
