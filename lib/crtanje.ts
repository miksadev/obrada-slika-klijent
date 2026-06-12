import type { RawImage } from "@/types/image";
import { uImageData } from "@/lib/slike";

const MIN_ZUM = 0.1;
const MAX_ZUM = 8;
const KORAK_ZUMA = 1.2;

export type Transformacija = {
  zoom: number;
  panX: number;
  panY: number;
};

export const POCETNA_TRANSFORMACIJA: Transformacija = { zoom: 1, panX: 0, panY: 0 };

function ograniciZum(zoom: number): number {
  return Math.min(MAX_ZUM, Math.max(MIN_ZUM, zoom));
}

export function nacrtajSliku(
  canvas: HTMLCanvasElement,
  raw: RawImage | null,
  transformacija: Transformacija,
): void {
  const kontekst = canvas.getContext("2d");
  if (!kontekst) return;

  kontekst.setTransform(1, 0, 0, 1, 0, 0);
  kontekst.clearRect(0, 0, canvas.width, canvas.height);

  if (!raw || raw.width === 0 || raw.height === 0) return;

  const pomocno = document.createElement("canvas");
  pomocno.width = raw.width;
  pomocno.height = raw.height;
  const pomocniKontekst = pomocno.getContext("2d");
  if (!pomocniKontekst) return;
  pomocniKontekst.putImageData(uImageData(raw), 0, 0);

  const zum = ograniciZum(transformacija.zoom);
  const sirina = raw.width * zum;
  const visina = raw.height * zum;
  const x = (canvas.width - sirina) / 2 + transformacija.panX;
  const y = (canvas.height - visina) / 2 + transformacija.panY;

  kontekst.imageSmoothingEnabled = zum < 1;
  kontekst.drawImage(pomocno, x, y, sirina, visina);
}

export function uvecaj(t: Transformacija): Transformacija {
  return { ...t, zoom: ograniciZum(t.zoom * KORAK_ZUMA) };
}

export function umanji(t: Transformacija): Transformacija {
  return { ...t, zoom: ograniciZum(t.zoom / KORAK_ZUMA) };
}

export function resetujPrikaz(): Transformacija {
  return { ...POCETNA_TRANSFORMACIJA };
}
