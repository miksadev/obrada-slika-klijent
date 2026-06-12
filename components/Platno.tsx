"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { RawImage } from "@/types/image";
import {
  nacrtajSliku,
  resetujPrikaz,
  uvecaj,
  umanji,
  type Transformacija,
  POCETNA_TRANSFORMACIJA,
} from "@/lib/crtanje";

type Props = {
  image: RawImage | null;
  label?: string;
  className?: string;
};

export default function Platno({ image, label, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [transformacija, setTransformacija] = useState<Transformacija>({ ...POCETNA_TRANSFORMACIJA });
  const pomeranjeRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  useEffect(() => {
    setTransformacija({ ...POCETNA_TRANSFORMACIJA });
  }, [image]);

  const nacrtaj = useCallback(() => {
    const canvas = canvasRef.current;
    const kontejner = containerRef.current;
    if (!canvas || !kontejner) return;
    const { clientWidth, clientHeight } = kontejner;
    if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
      canvas.width = clientWidth;
      canvas.height = clientHeight;
    }
    nacrtajSliku(canvas, image, transformacija);
  }, [image, transformacija]);

  useEffect(() => {
    nacrtaj();
  }, [nacrtaj]);

  useEffect(() => {
    const priPromeniVelicine = () => nacrtaj();
    window.addEventListener("resize", priPromeniVelicine);
    return () => window.removeEventListener("resize", priPromeniVelicine);
  }, [nacrtaj]);

  const priPritisku = (e: React.MouseEvent) => {
    if (!image) return;
    pomeranjeRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: transformacija.panX,
      panY: transformacija.panY,
    };
  };
  const priPomeranju = (e: React.MouseEvent) => {
    const p = pomeranjeRef.current;
    if (!p) return;
    setTransformacija((t) => ({
      ...t,
      panX: p.panX + (e.clientX - p.x),
      panY: p.panY + (e.clientY - p.y),
    }));
  };
  const krajPomeranja = () => {
    pomeranjeRef.current = null;
  };

  return (
    <div className={`flex flex-col rounded border border-gray-300 bg-white ${className ?? ""}`}>
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 text-sm">
        <span className="font-medium">
          {label ?? "Pregled"}
          {image ? (
            <span className="ml-2 text-gray-500">
              {image.width} × {image.height}px
            </span>
          ) : null}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTransformacija((t) => umanji(t))}
            disabled={!image}
            className="rounded border border-gray-300 px-2 py-0.5 text-xs disabled:opacity-40 hover:bg-gray-50"
            aria-label="Umanji"
          >
            −
          </button>
          <span className="w-12 text-center text-xs text-gray-500">
            {Math.round(transformacija.zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setTransformacija((t) => uvecaj(t))}
            disabled={!image}
            className="rounded border border-gray-300 px-2 py-0.5 text-xs disabled:opacity-40 hover:bg-gray-50"
            aria-label="Uvecaj"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setTransformacija(resetujPrikaz())}
            disabled={!image}
            className="rounded border border-gray-300 px-2 py-0.5 text-xs disabled:opacity-40 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="checkerboard relative h-72 w-full overflow-hidden"
        onMouseDown={priPritisku}
        onMouseMove={priPomeranju}
        onMouseUp={krajPomeranja}
        onMouseLeave={krajPomeranja}
        style={{ cursor: image ? (pomeranjeRef.current ? "grabbing" : "grab") : "default" }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {!image ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            Nema slike
          </div>
        ) : null}
      </div>
    </div>
  );
}
