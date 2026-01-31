"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type HandwritingPadProps = {
  disabled?: boolean;
  height?: number;
  onSaveInk?: (blob: Blob) => Promise<void> | void;
  onOcr?: (blob: Blob) => Promise<void> | void;
};

type Point = { x: number; y: number };
type Stroke = { points: Point[]; width: number; color: string };

function getCanvasPoint(e: PointerEvent, canvas: HTMLCanvasElement): Point {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

export default function HandwritingPad({
  disabled,
  height = 360,
  onSaveInk,
  onOcr,
}: HandwritingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const strokesRef = useRef<Stroke[]>([]);
  const redoRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [penWidth, setPenWidth] = useState(3);
  const [penColor, setPenColor] = useState("#111827"); // gray-900

  const dpr = useMemo(
    () => (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1),
    [],
  );

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawStroke = (stroke: Stroke) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const pts = stroke.points;
    if (pts.length < 2) return;

    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width * dpr;

    ctx.moveTo(pts[0].x * dpr, pts[0].y * dpr);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x * dpr, pts[i].y * dpr);
    }
    ctx.stroke();
  };

  const redrawAll = () => {
    clearCanvas();
    for (const s of strokesRef.current) drawStroke(s);
  };

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctxRef.current = ctx;
    redrawAll();
  };

  const undo = () => {
    const last = strokesRef.current.pop();
    if (last) redoRef.current.push(last);
    redrawAll();
  };

  const redo = () => {
    const last = redoRef.current.pop();
    if (last) strokesRef.current.push(last);
    redrawAll();
  };

  const clearAll = () => {
    strokesRef.current = [];
    redoRef.current = [];
    currentStrokeRef.current = null;
    redrawAll();
  };

  const exportPngBlob = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Make background white for OCR/readability
    const off = document.createElement("canvas");
    off.width = canvas.width;
    off.height = canvas.height;

    const offCtx = off.getContext("2d");
    if (!offCtx) return null;

    offCtx.fillStyle = "#ffffff";
    offCtx.fillRect(0, 0, off.width, off.height);
    offCtx.drawImage(canvas, 0, 0);

    return await new Promise<Blob | null>((resolve) => {
      off.toBlob((b) => resolve(b), "image/png", 1.0);
    });
  };

  useEffect(() => {
    setupCanvas();
    const onResize = () => setupCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dpr]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerDown = (e: PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);

      const p = getCanvasPoint(e, canvas);
      setIsDrawing(true);

      redoRef.current = []; // invalidate redo stack
      const stroke: Stroke = { points: [p], width: penWidth, color: penColor };
      currentStrokeRef.current = stroke;
      strokesRef.current.push(stroke);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (disabled) return;
      if (!isDrawing) return;

      const stroke = currentStrokeRef.current;
      if (!stroke) return;

      const p = getCanvasPoint(e, canvas);
      stroke.points.push(p);

      drawStroke(stroke);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (disabled) return;
      if (!isDrawing) return;
      e.preventDefault();
      setIsDrawing(false);
      currentStrokeRef.current = null;
    };

    canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
    canvas.addEventListener("pointermove", onPointerMove, { passive: false });
    canvas.addEventListener("pointerup", onPointerUp, { passive: false });
    canvas.addEventListener("pointercancel", onPointerUp, { passive: false });

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, [disabled, isDrawing, penWidth, penColor]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-3 p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-semibold">Color</span>
          <input
            type="color"
            value={penColor}
            onChange={(e) => setPenColor(e.target.value)}
            disabled={disabled}
            className="h-8 w-10 rounded-md border border-gray-200 bg-white"
            title="Pen color"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 font-semibold">Width</span>
          <input
            type="range"
            min={1}
            max={12}
            value={penWidth}
            onChange={(e) => setPenWidth(Number(e.target.value))}
            disabled={disabled}
          />
          <span className="text-sm text-gray-600 w-10">{penWidth}px</span>
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={disabled}
            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold disabled:opacity-50"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={disabled}
            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold disabled:opacity-50"
          >
            Redo
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={disabled}
            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold disabled:opacity-50"
          >
            Clear
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={async () => {
              const blob = await exportPngBlob();
              if (blob && onSaveInk) await onSaveInk(blob);
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
          >
            Save Ink
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={async () => {
              const blob = await exportPngBlob();
              if (blob && onOcr) await onOcr(blob);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold disabled:opacity-50"
          >
            OCR → Text
          </button>
        </div>
      </div>

      <div className="p-3">
        <canvas
          ref={canvasRef}
          style={{ height, width: "100%" }}
          className="w-full rounded-xl border border-gray-200 bg-white touch-none"
        />
        <p className="mt-2 text-xs text-gray-500">
          Tip: Use stylus pressure? You can later extend this to use{" "}
          <code>e.pressure</code>.
        </p>
      </div>
    </div>
  );
}
