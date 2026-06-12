import type { FilterName, FilterOperation, FilterParams } from "@/types/image";

export type OpisParametra =
  | {
      key: string;
      label: string;
      type: "number";
      default: number;
      min: number;
      max: number;
      step: number;
    }
  | {
      key: string;
      label: string;
      type: "select";
      default: string;
      options: { value: string; label: string }[];
    }
  | {
      key: string;
      label: string;
      type: "color";
      default: string;
    };

type DefinicijaFiltera = {
  name: FilterName;
  label: string;
  description: string;
  params: OpisParametra[];
  conditionalParams?: {
    when: { key: string; equals: string };
    params: OpisParametra[];
  };
};

export const DEFINICIJE_FILTERA: DefinicijaFiltera[] = [
  {
    name: "grayscale",
    label: "Grayscale",
    description: "Pretvara sliku u nijanse sive.",
    params: [],
  },
  {
    name: "contrast",
    label: "Contrast",
    description: "Podesava kontrast mnoziteljem.",
    params: [
      {
        key: "factor",
        label: "Faktor",
        type: "number",
        default: 1.2,
        min: 0.1,
        max: 3.0,
        step: 0.1,
      },
    ],
  },
  {
    name: "emboss-laplacian",
    label: "Emboss (Laplacian)",
    description: "Reljef / izostravanje (Laplasov operator).",
    params: [
      {
        key: "strength",
        label: "Jacina",
        type: "number",
        default: 1,
        min: 0.1,
        max: 5,
        step: 0.1,
      },
    ],
  },
  {
    name: "edge-detect-horizontal",
    label: "Edge Detect — Horizontal",
    description: "Detekcija horizontalnih ivica (Sobel jezgro).",
    params: [],
  },
  {
    name: "edge-detect-vertical",
    label: "Edge Detect — Vertical",
    description: "Detekcija vertikalnih ivica (Sobel jezgro).",
    params: [],
  },
  {
    name: "flip-horizontal",
    label: "Flip Horizontal",
    description: "Ogledalo levo-desno.",
    params: [],
  },
  {
    name: "flip-vertical",
    label: "Flip Vertical",
    description: "Ogledalo gore-dole.",
    params: [],
  },
  {
    name: "swirl",
    label: "Swirl",
    description: "Uvija piksele oko centra slike.",
    params: [
      {
        key: "radius",
        label: "Poluprecnik",
        type: "number",
        default: 250,
        min: 10,
        max: 1000,
        step: 10,
      },
      {
        key: "strength",
        label: "Jacina / Ugao",
        type: "number",
        default: 3.0,
        min: 0.1,
        max: 10,
        step: 0.1,
      },
    ],
  },
  {
    name: "jarvis-judice-ninke",
    label: "Jarvis-Judice-Ninke Dithering",
    description: "Difuzija greske (JJN jezgro).",
    params: [
      {
        key: "threshold",
        label: "Prag",
        type: "number",
        default: 128,
        min: 0,
        max: 255,
        step: 1,
      },
    ],
  },
  {
    name: "colorize-grayscale",
    label: "Colorize Grayscale",
    description: "Mapira nivoe sive u gradijent boja.",
    params: [
      {
        key: "mode",
        label: "Rezim boja",
        type: "select",
        default: "heatmap",
        options: [
          { value: "heatmap", label: "Toplotna mapa" },
          { value: "blue-orange", label: "Plava - Narandzasta" },
          { value: "custom", label: "Prilagodjeno (niska/srednja/visoka)" },
        ],
      },
    ],
    conditionalParams: {
      when: { key: "mode", equals: "custom" },
      params: [
        { key: "low", label: "Niska boja", type: "color", default: "#000080" },
        {
          key: "mid",
          label: "Srednja boja",
          type: "color",
          default: "#808080",
        },
        {
          key: "high",
          label: "Visoka boja",
          type: "color",
          default: "#ffd000",
        },
      ],
    },
  },
];

export function podrazumevaniParametri(def: DefinicijaFiltera): FilterParams {
  const params: FilterParams = {};
  for (const p of def.params) params[p.key] = p.default;
  if (
    def.conditionalParams &&
    params[def.conditionalParams.when.key] === def.conditionalParams.when.equals
  ) {
    for (const p of def.conditionalParams.params) params[p.key] = p.default;
  }
  return params;
}

export function nadjiDefiniciju(
  name: FilterName,
): DefinicijaFiltera | undefined {
  return DEFINICIJE_FILTERA.find((f) => f.name === name);
}

export function napraviOperaciju(
  name: FilterName,
  params?: FilterParams,
): FilterOperation {
  if (params && Object.keys(params).length > 0) return { name, params };
  return { name };
}
