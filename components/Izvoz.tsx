"use client";

import { useState } from "react";
import type { RawImage } from "@/types/image";
import { uBlob, uBmpBlob } from "@/lib/slike";
import { izveziMsi } from "@/lib/server";
import { zabeleziOperaciju } from "@/lib/logovi";

type Props = {
  image: RawImage | null;
};

function preuzmiBlob(blob: Blob, imeFajla: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = imeFajla;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Izvoz({ image }: Props) {
  const [greska, setGreska] = useState<string | null>(null);
  const [zauzeto, setZauzeto] = useState(false);
  const onemoguceno = !image || zauzeto;

  const izvrsi = async (action: string, fn: () => Promise<void> | void) => {
    if (!image) return;
    setGreska(null);
    setZauzeto(true);
    try {
      await fn();
      zabeleziOperaciju({
        action,
        status: "success",
        imageWidth: image.width,
        imageHeight: image.height,
      });
    } catch (e) {
      const poruka = e instanceof Error ? e.message : "Izvoz nije uspeo.";
      setGreska(poruka);
      zabeleziOperaciju({ action, status: "error", error: poruka });
    } finally {
      setZauzeto(false);
    }
  };

  return (
    <section className="panel">
      <h2>4. Izvoz</h2>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          disabled={onemoguceno}
          onClick={() =>
            izvrsi("export-png", async () =>
              preuzmiBlob(await uBlob(image!, "image/png"), "slika.png"),
            )
          }
          className="btn"
        >
          PNG
        </button>
        <button
          type="button"
          disabled={onemoguceno}
          onClick={() =>
            izvrsi("export-jpeg", async () =>
              preuzmiBlob(await uBlob(image!, "image/jpeg"), "slika.jpg"),
            )
          }
          className="btn"
        >
          JPEG
        </button>
        <button
          type="button"
          disabled={onemoguceno}
          onClick={() =>
            izvrsi("export-bmp", () =>
              preuzmiBlob(uBmpBlob(image!), "slika.bmp"),
            )
          }
          className="btn"
        >
          BMP
        </button>
      </div>
      <button
        type="button"
        disabled={onemoguceno}
        onClick={() =>
          izvrsi("export-msi", async () =>
            preuzmiBlob(
              await izveziMsi(image!, { filename: "slika.msi" }),
              "slika.msi",
            ),
          )
        }
        className="btn-primary mt-2 w-full"
      >
        Izvoz .msi (server)
      </button>
      <p className="hint">
        PNG/JPEG/BMP se cuvaju u browseru. .msi pravi server.
      </p>
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
