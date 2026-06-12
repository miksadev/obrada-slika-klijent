export type RawImage = {
  width: number;
  height: number;
  channels: 4;
  data: number[];
};

export type FilterName =
  | "grayscale"
  | "contrast"
  | "emboss-laplacian"
  | "edge-detect-horizontal"
  | "edge-detect-vertical"
  | "flip-horizontal"
  | "flip-vertical"
  | "swirl"
  | "jarvis-judice-ninke"
  | "colorize-grayscale";

export type FilterParams = Record<string, number | string | boolean>;

export type FilterOperation = {
  name: FilterName;
  params?: FilterParams;
};

export type ApplyFilterResponse = {
  image: RawImage;
  logs?: ProcessingLog[];
  durationMs: number;
};

export type ProcessingLog = {
  timestamp: string;
  source: "client" | "server";
  level: "INFO" | "ERROR";
  message: string;
  filter?: string;
  durationMs?: number;
  inputBytes?: number;
  outputBytes?: number;
};

export type ClientLogEntry = ProcessingLog & {
  id: string;
  source: "client";
  session: string;
  action: string;
  status: "success" | "error";
  params?: FilterParams;
  imageWidth?: number;
  imageHeight?: number;
  error?: string;
};

export type ExportMsiOptions = {
  filename?: string;
};
