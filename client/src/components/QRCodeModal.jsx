import { useRef, useCallback, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const PRESETS = [
  { name: "Classic", fg: "#000000", bg: "#ffffff" },
  { name: "Brand", fg: "#4f46e5", bg: "#ffffff" },
  { name: "Dark", fg: "#ffffff", bg: "#0f172a" },
  { name: "Mint", fg: "#065f46", bg: "#ecfdf5" },
];

function QRCodeModal({ shortCode, shortUrl, onClose }) {
  const canvasRef = useRef(null);
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState(180);
  const [logo, setLogo] = useState(null);

  const handleLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const renderToCanvas = useCallback(
    (scale = 4) =>
      new Promise((resolve) => {
        const svg = canvasRef.current?.querySelector("svg");
        if (!svg) return resolve(null);
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
          canvas.width = size * scale;
          canvas.height = size * scale;
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas);
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
      }),
    [bg, size]
  );

  const handleDownload = useCallback(async () => {
    const canvas = await renderToCanvas();
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${shortCode}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [renderToCanvas, shortCode]);

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
          <div className="rounded-lg border border-border p-3 sm:p-4" style={{ background: bg }}>
            <QRCodeSVG
              value={shortUrl}
              size={size}
              level="H"
              includeMargin
              fgColor={fg}
              bgColor={bg}
              imageSettings={logo ? { src: logo, width: size * 0.2, height: size * 0.2, excavate: true } : undefined}
            />
          </div>
        </div>

        <p className="mt-3 text-center font-mono text-xs text-muted-foreground break-all overflow-safe sm:text-sm">
          {shortUrl}
        </p>

        {/* Branding controls */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            FG
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-border" />
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            BG
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-border" />
          </label>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                setFg(p.fg);
                setBg(p.bg);
              }}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Size</label>
          <input
            type="range"
            min="120"
            max="320"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-10 text-right text-xs text-muted-foreground">{size}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <label className="inline-flex h-9 cursor-pointer items-center rounded-md border border-border px-3 text-xs font-medium hover:bg-accent">
            {logo ? "Change logo" : "Add logo"}
            <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          </label>
          {logo && (
            <button onClick={() => setLogo(null)} className="text-xs text-muted-foreground hover:text-foreground">
              Remove
            </button>
          )}
        </div>

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
