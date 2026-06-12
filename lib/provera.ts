export const DOZVOLJENE_EKSTENZIJE = ["png", "jpeg", "jpg", "bmp", "gif", "msi"] as const;

export const MAX_BAJTOVA = 20 * 1024 * 1024;

type RezultatProvere = { ok: true } | { ok: false; error: string };

export function uzmiEkstenziju(filename: string): string {
  const tacka = filename.lastIndexOf(".");
  if (tacka === -1 || tacka === filename.length - 1) return "";
  return filename.slice(tacka + 1).toLowerCase();
}

export function jeMsi(file: { name: string }): boolean {
  return uzmiEkstenziju(file.name) === "msi";
}

export function proveriFajl(file: { name: string; size: number }): RezultatProvere {
  const ekstenzija = uzmiEkstenziju(file.name);
  if (!ekstenzija) {
    return { ok: false, error: "Fajl nema ekstenziju." };
  }
  if (!(DOZVOLJENE_EKSTENZIJE as readonly string[]).includes(ekstenzija)) {
    return {
      ok: false,
      error: `Nepodrzan tip fajla ".${ekstenzija}". Dozvoljeno: ${DOZVOLJENE_EKSTENZIJE.join(", ")}.`,
    };
  }
  if (file.size > MAX_BAJTOVA) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return { ok: false, error: `Fajl je prevelik (${mb} MB). Maksimum je 20 MB.` };
  }
  return { ok: true };
}
