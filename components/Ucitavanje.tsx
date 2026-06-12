"use client";

import { useRef, useState } from "react";
import type { RawImage } from "@/types/image";
import { proveriFajl, jeMsi, DOZVOLJENE_EKSTENZIJE } from "@/lib/provera";
import { fajlUSliku } from "@/lib/slike";
import { uveziMsi } from "@/lib/server";
import { zabeleziOperaciju } from "@/lib/logovi";

type Props = {
  onLoaded: (image: RawImage, name: string) => void;
  busy: boolean;
  setBusy: (b: boolean) => void;
};

const ACCEPT = ".png,.jpg,.jpeg,.bmp,.gif,.msi";

export default function Ucitavanje({ onLoaded, busy, setBusy }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [greska, setGreska] = useState<string | null>(null);
  const [imeFajla, setImeFajla] = useState<string | null>(null);

  const obradiFajl = async (fajl: File) => {
    setGreska(null);
    const provera = proveriFajl(fajl);
    if (!provera.ok) {
      setGreska(provera.error);
      zabeleziOperaciju({
        action: "upload",
        status: "error",
        error: provera.error,
      });
      return;
    }

    setBusy(true);
    const pocetak = performance.now();
    try {
      let slika: RawImage;
      if (jeMsi(fajl)) {
        slika = await uveziMsi(fajl);
      } else {
        slika = await fajlUSliku(fajl);
        zabeleziOperaciju({
          action: "upload",
          status: "success",
          durationMs: performance.now() - pocetak,
          imageWidth: slika.width,
          imageHeight: slika.height,
        });
      }
      setImeFajla(fajl.name);
      onLoaded(slika, fajl.name);
    } catch (e) {
      const poruka =
        e instanceof Error ? e.message : "Neuspesno ucitavanje slike.";
      setGreska(poruka);
      if (!jeMsi(fajl)) {
        zabeleziOperaciju({ action: "upload", status: "error", error: poruka });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel">
      <h2>1. Ucitaj sliku</h2>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void obradiFajl(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="btn-primary w-full"
      >
        {busy ? "Ucitavanje…" : "Izaberi fajl…"}
      </button>
      <p className="hint">
        Dozvoljeno: {DOZVOLJENE_EKSTENZIJE.join(", ")}. Maksimum 20 MB. .msi
        dekodira server.
      </p>
      {imeFajla ? (
        <p className="mt-1 text-xs text-gray-600">Ucitano: {imeFajla}</p>
      ) : null}
      {greska ? (
        <p
          className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700"
          role="alert"
        >
          {greska}
        </p>
      ) : null}
    </section>
  );
}
