"use client";

import { useState, useSyncExternalStore } from "react";
import type { ProcessingLog } from "@/types/image";
import { pretplati, uzmiLogove, obrisiLogove } from "@/lib/logovi";
import { uzmiServerskeLogove } from "@/lib/server";

function formatVreme(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString();
  } catch {
    return iso;
  }
}

function formatTrajanje(ms?: number): string {
  if (ms === undefined) return "—";
  return `${Math.round(ms)} ms`;
}

export default function Logovi() {
  const logovi = useSyncExternalStore(pretplati, uzmiLogove, uzmiLogove);
  const [serverskiLogovi, setServerskiLogovi] = useState<
    ProcessingLog[] | null
  >(null);
  const [serverskaGreska, setServerskaGreska] = useState<string | null>(null);
  const [ucitavanjeServera, setUcitavanjeServera] = useState(false);

  const ucitajServerske = async () => {
    setServerskaGreska(null);
    setUcitavanjeServera(true);
    try {
      setServerskiLogovi(await uzmiServerskeLogove());
    } catch (greska) {
      setServerskaGreska(
        greska instanceof Error
          ? greska.message
          : "Neuspesno ucitavanje serverskih logova.",
      );
    } finally {
      setUcitavanjeServera(false);
    }
  };

  return (
    <section className="panel">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Logovi</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={ucitajServerske}
            disabled={ucitavanjeServera}
            className="btn"
          >
            {ucitavanjeServera ? "Ucitavanje…" : "Ucitaj serverske logove"}
          </button>
          <button type="button" onClick={() => obrisiLogove()} className="btn">
            Obrisi
          </button>
        </div>
      </div>

      <div className="max-h-56 overflow-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-gray-100 text-gray-600">
            <tr>
              <th className="px-2 py-1">Vreme</th>
              <th className="px-2 py-1">Akcija / Filter</th>
              <th className="px-2 py-1">Trajanje</th>
              <th className="px-2 py-1">Status</th>
              <th className="px-2 py-1">Detalji</th>
            </tr>
          </thead>
          <tbody>
            {logovi.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2 py-3 text-center text-gray-400">
                  Jos nema operacija.
                </td>
              </tr>
            ) : (
              logovi.map((l) => (
                <tr key={l.id} className="border-t border-gray-100">
                  <td className="px-2 py-1 whitespace-nowrap text-gray-500">
                    {formatVreme(l.timestamp)}
                  </td>
                  <td className="px-2 py-1">
                    {l.action}
                    {l.filter ? (
                      <span className="text-gray-400"> · {l.filter}</span>
                    ) : null}
                  </td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    {formatTrajanje(l.durationMs)}
                  </td>
                  <td className="px-2 py-1">
                    <span
                      className={
                        l.status === "error" ? "text-red-600" : "text-green-700"
                      }
                    >
                      {l.status === "error" ? "greska" : "uspeh"}
                    </span>
                  </td>
                  <td className="px-2 py-1 text-gray-500">
                    {l.error ??
                      (l.imageWidth ? `${l.imageWidth}×${l.imageHeight}` : "") +
                        (l.params ? ` ${JSON.stringify(l.params)}` : "")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {serverskaGreska ? (
        <p className="mt-2 rounded bg-red-50 px-2 py-1 text-xs text-red-700">
          {serverskaGreska}
        </p>
      ) : null}

      {serverskiLogovi ? (
        <div className="mt-3">
          <h3 className="mb-1 text-xs font-semibold text-gray-600">
            Serverski logovi ({serverskiLogovi.length})
          </h3>
          <div className="max-h-40 overflow-auto rounded bg-gray-50 p-2 font-mono text-[11px]">
            {serverskiLogovi.length === 0 ? (
              <p className="text-gray-400">Nema serverskih logova.</p>
            ) : (
              serverskiLogovi.map((l, i) => (
                <div
                  key={i}
                  className={
                    l.level === "ERROR" ? "text-red-600" : "text-gray-700"
                  }
                >
                  [{formatVreme(l.timestamp)}] {l.level}{" "}
                  {l.filter ? `${l.filter} ` : ""}
                  {l.message}
                  {l.durationMs !== undefined
                    ? ` (${Math.round(l.durationMs)}ms)`
                    : ""}
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
