import axios from "axios";
import type {
  ApplyFilterResponse,
  ExportMsiOptions,
  FilterOperation,
  ProcessingLog,
  RawImage,
} from "@/types/image";
import { zabeleziOperaciju } from "@/lib/logovi";

const API_ADRESA =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const klijent = axios.create({ baseURL: API_ADRESA });

export class ApiGreska extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiGreska";
    this.status = status;
  }
}

function uGresku(greska: unknown): ApiGreska {
  if (axios.isAxiosError(greska)) {
    const podaci = greska.response?.data as
      | { error?: string; message?: string }
      | undefined;
    return new ApiGreska(
      podaci?.error ?? podaci?.message ?? greska.message,
      greska.response?.status,
    );
  }
  return new ApiGreska(
    greska instanceof Error ? greska.message : String(greska),
  );
}

export async function proveriServer(): Promise<{
  ok: boolean;
  status?: string;
}> {
  try {
    const odgovor = await klijent.get("/api/health");
    return { ok: true, status: odgovor.data?.status };
  } catch {
    return { ok: false };
  }
}

export async function primeniFilter(
  slika: RawImage,
  operacija: FilterOperation,
): Promise<ApplyFilterResponse> {
  const pocetak = performance.now();
  try {
    const odgovor = await klijent.post("/api/images/apply-filter", {
      image: slika,
      operation: operacija,
    });
    zabeleziOperaciju({
      action: "apply-filter",
      status: "success",
      filter: operacija.name,
      params: operacija.params,
      durationMs: performance.now() - pocetak,
      imageWidth: slika.width,
      imageHeight: slika.height,
    });
    return odgovor.data;
  } catch (greska) {
    const g = uGresku(greska);
    zabeleziOperaciju({
      action: "apply-filter",
      status: "error",
      filter: operacija.name,
      error: g.message,
    });
    throw g;
  }
}

export async function primeniGrupu(
  slika: RawImage,
  operacije: FilterOperation[],
): Promise<ApplyFilterResponse> {
  const pocetak = performance.now();
  const oznaka = operacije.map((o) => o.name).join(", ");
  try {
    const odgovor = await klijent.post("/api/images/apply-batch", {
      image: slika,
      operations: operacije,
    });
    zabeleziOperaciju({
      action: "apply-batch",
      status: "success",
      filter: oznaka,
      durationMs: performance.now() - pocetak,
      imageWidth: slika.width,
      imageHeight: slika.height,
    });
    return odgovor.data;
  } catch (greska) {
    const g = uGresku(greska);
    zabeleziOperaciju({
      action: "apply-batch",
      status: "error",
      filter: oznaka,
      error: g.message,
    });
    throw g;
  }
}

export async function izveziMsi(
  slika: RawImage,
  options: ExportMsiOptions = {},
): Promise<Blob> {
  const odgovor = await klijent.post(
    "/api/images/export-msi",
    { image: slika, options },
    { responseType: "blob" },
  );
  zabeleziOperaciju({
    action: "export-msi",
    status: "success",
    imageWidth: slika.width,
    imageHeight: slika.height,
  });
  return odgovor.data;
}

export async function uveziMsi(file: File): Promise<RawImage> {
  const forma = new FormData();
  forma.append("file", file);
  try {
    const odgovor = await klijent.post("/api/images/import-msi", forma);
    const slika = odgovor.data.image as RawImage;
    zabeleziOperaciju({
      action: "import-msi",
      status: "success",
      imageWidth: slika?.width,
      imageHeight: slika?.height,
    });
    return slika;
  } catch (greska) {
    const g = uGresku(greska);
    zabeleziOperaciju({
      action: "import-msi",
      status: "error",
      error: g.message,
    });
    throw g;
  }
}

export async function uzmiServerskeLogove(): Promise<ProcessingLog[]> {
  const odgovor = await klijent.get("/api/logs");
  return Array.isArray(odgovor.data) ? odgovor.data : (odgovor.data.logs ?? []);
}
