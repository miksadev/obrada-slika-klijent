"use client";

import { useCallback, useRef, useState } from "react";
import type { FilterOperation, RawImage } from "@/types/image";
import { IstorijaStek } from "@/lib/istorija";
import { primeniFilter, primeniGrupu, proveriServer } from "@/lib/server";
import AlatnaTraka from "@/components/AlatnaTraka";
import Ucitavanje from "@/components/Ucitavanje";
import Filter from "@/components/Filter";
import Grupa from "@/components/Grupa";
import PrikazPoredjenja from "@/components/PrikazPoredjenja";
import Izvoz from "@/components/Izvoz";
import Logovi from "@/components/Logovi";

type ViewMode = "original" | "processed" | "compare";
type Health = "unknown" | "ok" | "down";

export default function RadniProstor() {
  const [originalna, setOriginalna] = useState<RawImage | null>(null);
  const [trenutna, setTrenutna] = useState<RawImage | null>(null);
  const [grupa, setGrupa] = useState<FilterOperation[]>([]);
  const [prikaz, setPrikaz] = useState<ViewMode>("compare");
  const [zauzeto, setZauzeto] = useState(false);
  const [stanje, setStanje] = useState<Health>("unknown");
  const [obavestenje, setObavestenje] = useState<string | null>(null);

  const istorijaRef = useRef(new IstorijaStek<RawImage>());
  const [, setTik] = useState(0);
  const osvezi = () => setTik((t) => t + 1);

  const ucitano = useCallback((slika: RawImage) => {
    setOriginalna(slika);
    setTrenutna(slika);
    istorijaRef.current.reset(slika);
    setObavestenje(null);
    osvezi();
  }, []);

  const dodajStanje = (slika: RawImage) => {
    istorijaRef.current.push(slika);
    setTrenutna(slika);
    osvezi();
  };

  const pokreniFilter = async (op: FilterOperation) => {
    if (!trenutna) return;
    setObavestenje(null);
    setZauzeto(true);
    try {
      const rezultat = await primeniFilter(trenutna, op);
      dodajStanje(rezultat.image);
      setPrikaz("compare");
    } catch (greska) {
      setObavestenje(
        greska instanceof Error
          ? greska.message
          : "Zahtev za filter nije uspeo.",
      );
    } finally {
      setZauzeto(false);
    }
  };

  const pokreniGrupu = async () => {
    if (!trenutna || grupa.length === 0) return;
    setObavestenje(null);
    setZauzeto(true);
    try {
      const rezultat = await primeniGrupu(trenutna, grupa);
      dodajStanje(rezultat.image);
      setPrikaz("compare");
    } catch (greska) {
      setObavestenje(
        greska instanceof Error ? greska.message : "Grupni zahtev nije uspeo.",
      );
    } finally {
      setZauzeto(false);
    }
  };

  const nazad = () => {
    const novo = istorijaRef.current.undo();
    if (novo) setTrenutna(novo);
    osvezi();
  };
  const napred = () => {
    const novo = istorijaRef.current.redo();
    if (novo) setTrenutna(novo);
    osvezi();
  };
  const vratiOriginal = () => {
    if (!originalna) return;
    istorijaRef.current.reset(originalna);
    setTrenutna(originalna);
    osvezi();
  };

  const proveriStanje = async () => {
    const rezultat = await proveriServer();
    setStanje(rezultat.ok ? "ok" : "down");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-gray-800 px-4 py-3 text-white">
        <h1 className="text-lg font-semibold">
          MMS2026 - Mihajlo Stankovic - Softver za obradu slika
        </h1>
      </header>

      <AlatnaTraka
        canUndo={istorijaRef.current.canUndo}
        canRedo={istorijaRef.current.canRedo}
        onUndo={nazad}
        onRedo={napred}
        onResetToOriginal={vratiOriginal}
        hasImage={!!originalna}
        viewMode={prikaz}
        onViewModeChange={setPrikaz}
        health={stanje}
        onCheckHealth={proveriStanje}
        busy={zauzeto}
      />

      {obavestenje ? (
        <div className="bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">
          {obavestenje}
        </div>
      ) : null}

      <main className="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Ucitavanje onLoaded={ucitano} busy={zauzeto} setBusy={setZauzeto} />
          <Filter
            onApply={pokreniFilter}
            onAddToBatch={(op) => setGrupa((g) => [...g, op])}
            disabled={zauzeto || !trenutna}
          />
          <Grupa
            operations={grupa}
            setOperations={setGrupa}
            onRun={pokreniGrupu}
            disabled={zauzeto || !trenutna}
          />
          <Izvoz image={trenutna} />
        </div>

        <div className="space-y-4">
          <PrikazPoredjenja
            original={originalna}
            processed={trenutna}
            mode={prikaz}
          />
          <Logovi />
        </div>
      </main>

      <footer className="border-t border-gray-300 bg-white px-4 py-2 text-center text-xs text-gray-400">
        MMS2026 Multimedijalni sistemi · Obrada slika
      </footer>
    </div>
  );
}
