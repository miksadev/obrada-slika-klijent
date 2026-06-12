"use client";

import type { FilterOperation } from "@/types/image";
import { nadjiDefiniciju } from "@/lib/filteri";

type Props = {
  operations: FilterOperation[];
  setOperations: (ops: FilterOperation[]) => void;
  onRun: () => void;
  disabled: boolean;
};

function opisi(op: FilterOperation): string {
  const oznaka = nadjiDefiniciju(op.name)?.label ?? op.name;
  if (!op.params || Object.keys(op.params).length === 0) return oznaka;
  const p = Object.entries(op.params)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  return `${oznaka} (${p})`;
}

export default function Grupa({
  operations,
  setOperations,
  onRun,
  disabled,
}: Props) {
  const ukloni = (indeks: number) =>
    setOperations(operations.filter((_, i) => i !== indeks));

  return (
    <section className="panel">
      <h2>3. Grupna obrada (po redu)</h2>
      {operations.length === 0 ? (
        <p className="text-xs text-gray-400">
          Nema operacija. Koristi „+ U grupu“ u panelu filtera da dodas korake.
        </p>
      ) : (
        <ol className="space-y-1">
          {operations.map((op, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded border border-gray-200 px-2 py-1 text-xs"
            >
              <span className="text-gray-400">{i + 1}.</span>
              <span className="flex-1 truncate" title={opisi(op)}>
                {opisi(op)}
              </span>
              <button
                type="button"
                onClick={() => ukloni(i)}
                className="px-1 text-red-600"
                aria-label="Ukloni"
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={disabled || operations.length === 0}
          onClick={onRun}
          className="btn-primary flex-1"
        >
          Pokreni grupu ({operations.length})
        </button>
        <button
          type="button"
          disabled={operations.length === 0}
          onClick={() => setOperations([])}
          className="btn"
        >
          Obrisi
        </button>
      </div>
    </section>
  );
}
