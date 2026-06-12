"use client";

import { useMemo, useState } from "react";
import type { FilterName, FilterOperation, FilterParams } from "@/types/image";
import {
  DEFINICIJE_FILTERA,
  napraviOperaciju,
  podrazumevaniParametri,
  nadjiDefiniciju,
  type OpisParametra,
} from "@/lib/filteri";

type Props = {
  onApply: (op: FilterOperation) => void;
  onAddToBatch: (op: FilterOperation) => void;
  disabled: boolean;
};

export default function Filter({ onApply, onAddToBatch, disabled }: Props) {
  const [izabrani, setIzabrani] = useState<FilterName>(
    DEFINICIJE_FILTERA[0].name,
  );
  const definicija = nadjiDefiniciju(izabrani)!;
  const [parametri, setParametri] = useState<FilterParams>(() =>
    podrazumevaniParametri(definicija),
  );

  const priIzboru = (name: FilterName) => {
    setIzabrani(name);
    const d = nadjiDefiniciju(name)!;
    setParametri(podrazumevaniParametri(d));
  };

  const aktivniUslovni = useMemo(() => {
    if (!definicija.conditionalParams) return [];
    return parametri[definicija.conditionalParams.when.key] ===
      definicija.conditionalParams.when.equals
      ? definicija.conditionalParams.params
      : [];
  }, [definicija, parametri]);

  const saUslovnimParametrima = (parametri: FilterParams): FilterParams => {
    if (!definicija.conditionalParams) return parametri;

    const sledeci = { ...parametri };
    const { when, params } = definicija.conditionalParams;
    const uslovAktivan = sledeci[when.key] === when.equals;

    for (const param of params) {
      if (uslovAktivan) {
        sledeci[param.key] ??= param.default;
      } else {
        delete sledeci[param.key];
      }
    }

    return sledeci;
  };

  const postaviParam = (key: string, value: number | string | boolean) =>
    setParametri((p) => saUslovnimParametrima({ ...p, [key]: value }));

  const trenutnaOperacija = (): FilterOperation =>
    napraviOperaciju(izabrani, parametri);

  const nacrtajKontrolu = (spec: OpisParametra) => {
    if (spec.type === "number") {
      const vrednost = Number(parametri[spec.key] ?? spec.default);
      return (
        <label key={spec.key} className="block text-xs">
          <span className="flex justify-between text-gray-600">
            <span>{spec.label}</span>
            <span className="font-mono">{vrednost}</span>
          </span>
          <input
            type="range"
            min={spec.min}
            max={spec.max}
            step={spec.step}
            value={vrednost}
            onChange={(e) => postaviParam(spec.key, Number(e.target.value))}
            className="w-full"
          />
        </label>
      );
    }
    if (spec.type === "select") {
      return (
        <label key={spec.key} className="block text-xs">
          <span className="text-gray-600">{spec.label}</span>
          <select
            value={String(parametri[spec.key] ?? spec.default)}
            onChange={(e) => postaviParam(spec.key, e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
          >
            {spec.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      );
    }
    return (
      <label
        key={spec.key}
        className="flex items-center justify-between text-xs"
      >
        <span className="text-gray-600">{spec.label}</span>
        <input
          type="color"
          value={String(parametri[spec.key] ?? spec.default)}
          onChange={(e) => postaviParam(spec.key, e.target.value)}
          className="h-7 w-12 rounded border border-gray-300"
        />
      </label>
    );
  };

  return (
    <section className="panel">
      <h2>2. Filter</h2>
      <label className="block text-xs text-gray-600">Izaberi filter</label>
      <select
        value={izabrani}
        onChange={(e) => priIzboru(e.target.value as FilterName)}
        className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm"
      >
        {DEFINICIJE_FILTERA.map((f) => (
          <option key={f.name} value={f.name}>
            {f.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-gray-500">{definicija.description}</p>

      <div className="mt-3 space-y-3">
        {definicija.params.map(nacrtajKontrolu)}
        {aktivniUslovni.map(nacrtajKontrolu)}
        {definicija.params.length === 0 && aktivniUslovni.length === 0 ? (
          <p className="text-xs text-gray-400">Nema parametara.</p>
        ) : null}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onApply(trenutnaOperacija())}
          className="btn-primary flex-1"
        >
          Primeni
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onAddToBatch(trenutnaOperacija())}
          className="btn"
        >
          + U grupu
        </button>
      </div>
    </section>
  );
}
