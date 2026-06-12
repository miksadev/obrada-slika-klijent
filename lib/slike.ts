import type { RawImage } from "@/types/image";

export function napraviSliku(
  width: number,
  height: number,
  data: number[] | Uint8ClampedArray,
): RawImage {
  return { width, height, channels: 4, data: Array.from(data) };
}

export function uImageData(raw: RawImage): ImageData {
  const pikseli = new Uint8ClampedArray(raw.data);
  return new ImageData(pikseli, raw.width, raw.height);
}

function izImageData(data: ImageData): RawImage {
  return napraviSliku(data.width, data.height, data.data);
}

function naPlatno(raw: RawImage): HTMLCanvasElement {
  const platno = document.createElement("canvas");
  platno.width = raw.width;
  platno.height = raw.height;
  const kontekst = platno.getContext("2d");
  if (!kontekst) throw new Error("Ne mogu da dobijem 2D kontekst platna.");
  kontekst.putImageData(uImageData(raw), 0, 0);
  return platno;
}

export function fajlUSliku(file: File): Promise<RawImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const slika = new Image();
    slika.onload = () => {
      try {
        const platno = document.createElement("canvas");
        platno.width = slika.naturalWidth;
        platno.height = slika.naturalHeight;
        const kontekst = platno.getContext("2d");
        if (!kontekst)
          throw new Error("Ne mogu da dobijem 2D kontekst platna.");
        kontekst.drawImage(slika, 0, 0);
        const podaci = kontekst.getImageData(0, 0, platno.width, platno.height);
        resolve(izImageData(podaci));
      } catch (greska) {
        reject(greska);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    slika.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Ne mogu da procitam fajl slike."));
    };
    slika.src = url;
  });
}

export function uBlob(
  raw: RawImage,
  mime: "image/png" | "image/jpeg",
  quality = 0.92,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const platno = naPlatno(raw);
    platno.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error(`Neuspesno enkodiranje ${mime}.`));
      },
      mime,
      quality,
    );
  });
}

export function uBmpBajtove(raw: RawImage): Uint8Array {
  const { width, height, data } = raw;
  const velicinaReda = (width * 3 + 3) & ~3;
  const velicinaPiksela = velicinaReda * height;
  const velicinaZaglavljaFajla = 14;
  const velicinaInfoZaglavlja = 40;
  const pomak = velicinaZaglavljaFajla + velicinaInfoZaglavlja;
  const velicinaFajla = pomak + velicinaPiksela;

  const bafer = new ArrayBuffer(velicinaFajla);
  const view = new DataView(bafer);
  const bajtovi = new Uint8Array(bafer);

  view.setUint8(0, 0x42);
  view.setUint8(1, 0x4d);
  view.setUint32(2, velicinaFajla, true);
  view.setUint32(6, 0, true);
  view.setUint32(10, pomak, true);

  view.setUint32(14, velicinaInfoZaglavlja, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true);
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true);
  view.setUint32(34, velicinaPiksela, true);
  view.setInt32(38, 2835, true);
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  for (let y = 0; y < height; y++) {
    const izvorniRed = (height - 1 - y) * width * 4;
    let odrediste = pomak + y * velicinaReda;
    for (let x = 0; x < width; x++) {
      const s = izvorniRed + x * 4;
      bajtovi[odrediste++] = data[s + 2];
      bajtovi[odrediste++] = data[s + 1];
      bajtovi[odrediste++] = data[s];
    }
  }

  return bajtovi;
}

export function uBmpBlob(raw: RawImage): Blob {
  const bajtovi = uBmpBajtove(raw);
  return new Blob([bajtovi.slice().buffer], { type: "image/bmp" });
}
