import type { ClientLogEntry, FilterParams } from "@/types/image";

let logovi: ClientLogEntry[] = [];
const pretplatnici = new Set<() => void>();

const sesija = "sess-" + Math.random().toString(36).slice(2, 8);
let brojac = 0;

function obavesti() {
  pretplatnici.forEach((p) => p());
}

export function pretplati(listener: () => void) {
  pretplatnici.add(listener);
  return () => {
    pretplatnici.delete(listener);
  };
}

export function uzmiLogove() {
  return logovi;
}

export function obrisiLogove() {
  logovi = [];
  obavesti();
}

type UnosLoga = {
  action: string;
  status: "success" | "error";
  filter?: string;
  params?: FilterParams;
  durationMs?: number;
  imageWidth?: number;
  imageHeight?: number;
  error?: string;
};

export function zabeleziOperaciju(ulaz: UnosLoga): ClientLogEntry {
  const unos: ClientLogEntry = {
    id: String(++brojac),
    timestamp: new Date().toISOString(),
    source: "client",
    session: sesija,
    level: ulaz.status === "error" ? "ERROR" : "INFO",
    message: `${ulaz.action}${ulaz.filter ? " " + ulaz.filter : ""} - ${ulaz.status}`,
    action: ulaz.action,
    status: ulaz.status,
    filter: ulaz.filter,
    params: ulaz.params,
    durationMs: ulaz.durationMs,
    imageWidth: ulaz.imageWidth,
    imageHeight: ulaz.imageHeight,
    error: ulaz.error,
  };
  logovi = [unos, ...logovi];
  obavesti();
  return unos;
}
