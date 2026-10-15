import { useEffect, useRef } from "react";

/**
 * Lightweight canvas globe — Vite-compatible replacement for the
 * Aceternity `../ui/globe` Three.js `World` component.
 *
 * Same public API: <World data={arcs} globeConfig={config} />
 * No extra dependencies (no three.js / react-three-fiber needed).
 * Renders a rotating sphere with graticule, animated arcs, points + rings.
 */

const TAU = Math.PI * 2;

function toRad(d) {
  return (d * Math.PI) / 180;
}

function latLngToVec(lat, lng) {
  const la = toRad(lat);
  const lo = toRad(lng);
  return {
    x: Math.cos(la) * Math.cos(lo),
    y: Math.sin(la),
    z: Math.cos(la) * Math.sin(lo),
  };
}

function rotateY(v, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
}

function rotateX(v, a) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
}

function slerp(a, b, t) {
  const dot = Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z));
  const theta = Math.acos(dot);
  if (theta < 1e-5) return a;
  const s = Math.sin(theta);
  const w1 = Math.sin((1 - t) * theta) / s;
  const w2 = Math.sin(t * theta) / s;
  return { x: a.x * w1 + b.x * w2, y: a.y * w1 + b.y * w2, z: a.z * w1 + b.z * w2 };
}

export function World({ data = [], globeConfig = {} }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const dragRef = useRef({ dragging: false, x: 0, y: 0, rotX: 0, velY: 0 });

  const cfg = {
    globeColor: "#062056",
    atmosphereColor: "#FFFFFF",
    atmosphereAltitude: 0.12,
    polygonColor: "rgba(255,255,255,0.35)",
    arcTime: 1000,
    autoRotate: true,
    autoRotateSpeed: 0.5,
    initialPosition: { lat: 22.3193, lng: 114.1694 },
    ...globeConfig,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let w = 0;
    let h = 0;
    let rot = toRad(cfg.initialPosition?.lng ?? 0);
    const tilt = toRad(-(cfg.initialPosition?.lat ?? 20) * 0.35);

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(280, rect.width);
      h = Math.max(280, rect.height);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Precompute texture dots (fibonacci sphere)
    const dots = [];
    const N = 420;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      dots.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r });
    }

    const arcs = (Array.isArray(data) ? data : []).slice(0, 40).map((d) => ({
      a: latLngToVec(d.startLat, d.startLng),
      b: latLngToVec(d.endLat, d.endLng),
      alt: 0.15 + (d.arcAlt ?? 0.3) * 0.6,
      color: d.color || "#38bdf8",
      order: d.order ?? 1,
    }));

    const start = performance.now();

    const onDown = (e) => {
      dragRef.current.dragging = true;
      dragRef.current.x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      dragRef.current.velY = 0;
    };
    const onMove = (e) => {
      if (!dragRef.current.dragging) return;
      const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const dx = x - dragRef.current.x;
      dragRef.current.x = x;
      rot += dx * 0.005;
      dragRef.current.velY = dx * 0.005;
    };
    const onUp = () => {
      dragRef.current.dragging = false;
    };
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    const frame = (now) => {
      const t = (now - start) / 1000;
      if (!dragRef.current.dragging) {
        rot += (cfg.autoRotate ? cfg.autoRotateSpeed * 0.25 : 0.05) * 0.016;
        rot += dragRef.current.velY;
        dragRef.current.velY *= 0.95;
      }
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.36;

      ctx.clearRect(0, 0, w, h);

      const project = (v) => {
        let p = rotateY(v, rot);
        p = rotateX(p, tilt + dragRef.current.rotX);
        return { x: cx + p.x * R, y: cy - p.y * R, z: p.z, v: p };
      };

      // Atmosphere glow
      const atmoR = R * (1 + cfg.atmosphereAltitude * 2.2);
      const glow = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, atmoR);
      glow.addColorStop(0, "rgba(56,189,248,0.20)");
      glow.addColorStop(0.75, "rgba(56,189,248,0.07)");
      glow.addColorStop(1, "rgba(56,189,248,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, atmoR, 0, TAU);
      ctx.fill();

      // Sphere base
      const base = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      base.addColorStop(0, "#0e3a7a");
      base.addColorStop(0.55, cfg.globeColor || "#062056");
      base.addColorStop(1, "#020c26");
      ctx.fillStyle = base;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.fill();

      // Rim light
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, TAU);
      ctx.stroke();

      // Graticule
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        const lr = Math.cos(toRad(lat)) * R;
        const ly = cy - Math.sin(toRad(lat)) * R * Math.cos(tilt);
        ctx.beginPath();
        ctx.ellipse(cx, ly, lr, lr * 0.22, 0, 0, TAU);
        ctx.stroke();
      }
      for (let k = 0; k < 6; k++) {
        const a = rot + (k * Math.PI) / 3;
        const rx = Math.abs(Math.cos(a)) * R;
        if (rx < 2) continue;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, R, 0, 0, TAU);
        ctx.stroke();
      }

      // Dot texture
      for (const d of dots) {
        const p = project(d);
        if (p.z < -0.05) continue;
        const alpha = 0.12 + 0.5 * Math.max(0, p.z);
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        const s = p.z > 0.6 ? 1.5 : 1;
        ctx.fillRect(p.x, p.y, s, s);
      }

      // Arcs
      const speed = 1000 / Math.max(200, cfg.arcTime);
      for (let i = 0; i < arcs.length; i++) {
        const arc = arcs[i];
        const SEG = 42;
        ctx.lineWidth = 1.6;
        // animated dash: head travels along arc
        const head = ((t * speed + arc.order * 0.12) % 1.4) / 1.4;
        for (let s = 0; s < SEG - 1; s++) {
          const t0 = s / (SEG - 1);
          const t1 = (s + 1) / (SEG - 1);
          // brightness window around moving head
          const d0 = Math.abs(t0 - head * 0.9);
          const alpha = Math.max(0, 1 - d0 * 3.2);
          if (alpha < 0.04) continue;
          let p0 = slerp(arc.a, arc.b, t0);
          let p1 = slerp(arc.a, arc.b, t1);
          const lift0 = 1 + Math.sin(t0 * Math.PI) * arc.alt;
          const lift1 = 1 + Math.sin(t1 * Math.PI) * arc.alt;
          p0 = { x: p0.x * lift0, y: p0.y * lift0, z: p0.z * lift0 };
          p1 = { x: p1.x * lift1, y: p1.y * lift1, z: p1.z * lift1 };
          const q0 = project({ x: p0.x / lift0, y: p0.y / lift0, z: p0.z / lift0 });
          // project lifted radius manually
          const pr0 = rotateX(rotateY({ x: p0.x, y: p0.y, z: p0.z }, rot), tilt);
          const pr1 = rotateX(rotateY({ x: p1.x, y: p1.y, z: p1.z }, rot), tilt);
          const sx0 = cx + (pr0.x / lift0) * R + (pr0.x - pr0.x / lift0) * R;
          const sy0 = cy - (pr0.y / lift0) * R - (pr0.y - pr0.y / lift0) * R;
          const sx1 = cx + (pr1.x / lift1) * R + (pr1.x - pr1.x / lift1) * R;
          const sy1 = cy - (pr1.y / lift1) * R - (pr1.y - pr1.y / lift1) * R;
          void q0;
          const behind = pr0.z < -0.25 && pr1.z < -0.25;
          ctx.strokeStyle = arc.color;
          ctx.globalAlpha = (behind ? 0.08 : 0.9) * alpha;
          ctx.beginPath();
          ctx.moveTo(sx0, sy0);
          ctx.lineTo(sx1, sy1);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // Endpoints + pulsing rings
      for (let i = 0; i < arcs.length; i++) {
        for (const key of ["a", "b"]) {
          const p = project(arcs[i][key]);
          if (p.z < 0) continue;
          ctx.globalAlpha = 0.95;
          ctx.fillStyle = arcs[i].color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.4, 0, TAU);
          ctx.fill();
          ctx.globalAlpha = 0.35;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4.5 + ((t * 8 + i * 3) % 8), 0, TAU);
          ctx.strokeStyle = arcs[i].color;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // Bottom fade handled by overlay div in GlobeDemo
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(data)]);

  return (
    <div ref={wrapRef} className="h-full w-full cursor-grab active:cursor-grabbing">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

export default World;
