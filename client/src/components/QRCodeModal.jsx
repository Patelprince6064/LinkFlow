import { useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";

function QRCodeModal({ shortCode, shortUrl, onClose }) {
  const canvasRef = useRef(null);

  const handleDownload = useCallback(() => {
    const svg = canvasRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const link = document.createElement("a");
      link.download = `qr-${shortCode}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  }, [shortCode]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xs rounded-lg border border-border bg-card p-4 sm:max-w-sm sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">QR Code</h2>
          <button
            onClick={onClose}
            className="rounded p-2 text-muted-foreground hover:bg-accent hover:text-foreground touch-target"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div ref={canvasRef} className="mt-4 flex justify-center">
          <div className="rounded-lg border border-border bg-white p-3 sm:p-4">
            <QRCodeSVG value={shortUrl} size={180} level="H" includeMargin />
          </div>
        </div>

        <p className="mt-3 text-center font-mono text-xs text-muted-foreground break-all overflow-safe sm:text-sm">
          {shortUrl}
        </p>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-accent"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}

export default QRCodeModal;
