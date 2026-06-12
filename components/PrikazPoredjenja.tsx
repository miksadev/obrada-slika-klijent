"use client";

import type { RawImage } from "@/types/image";
import Platno from "@/components/Platno";

type ViewMode = "original" | "processed" | "compare";

type Props = {
  original: RawImage | null;
  processed: RawImage | null;
  mode: ViewMode;
};

export default function PrikazPoredjenja({ original, processed, mode }: Props) {
  if (mode === "original") {
    return <Platno image={original} label="Original" />;
  }
  if (mode === "processed") {
    return <Platno image={processed ?? original} label="Obradjena" />;
  }
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Platno image={original} label="Original" />
      <Platno image={processed ?? original} label="Obradjena" />
    </div>
  );
}
