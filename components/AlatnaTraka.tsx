"use client";

type ViewMode = "original" | "processed" | "compare";
type Health = "unknown" | "ok" | "down";

type Props = {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onResetToOriginal: () => void;
  hasImage: boolean;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  health: Health;
  onCheckHealth: () => void;
  busy: boolean;
};

const MODES: { value: ViewMode; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "processed", label: "Obradjena" },
  { value: "compare", label: "Uporedi" },
];

export default function AlatnaTraka({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onResetToOriginal,
  hasImage,
  viewMode,
  onViewModeChange,
  health,
  onCheckHealth,
  busy,
}: Props) {
  const bojaStanja =
    health === "ok" ? "bg-green-500" : health === "down" ? "bg-red-500" : "bg-gray-300";

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-gray-300 bg-white px-4 py-2">
      <div className="flex items-center gap-1">
        <button type="button" onClick={onUndo} disabled={!canUndo} className="btn">
          ↶ Nazad
        </button>
        <button type="button" onClick={onRedo} disabled={!canRedo} className="btn">
          Napred ↷
        </button>
        <button type="button" onClick={onResetToOriginal} disabled={!hasImage} className="btn">
          Vrati original
        </button>
      </div>

      <div className="flex overflow-hidden rounded border border-gray-300">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => onViewModeChange(m.value)}
            className={`px-3 py-1 text-sm ${
              viewMode === m.value ? "bg-blue-600 text-white" : "bg-white hover:bg-gray-50"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {busy ? <span className="text-xs text-gray-500">Obrada…</span> : null}
        <button
          type="button"
          onClick={onCheckHealth}
          className="flex items-center gap-2 rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
          title="Proveri server"
        >
          <span className={`h-2.5 w-2.5 rounded-full ${bojaStanja}`} />
          Server
        </button>
      </div>
    </div>
  );
}
