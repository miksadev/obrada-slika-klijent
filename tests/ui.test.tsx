import React, { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import AlatnaTraka from "@/components/AlatnaTraka";
import Filter from "@/components/Filter";
import Grupa from "@/components/Grupa";
import Ucitavanje from "@/components/Ucitavanje";
import type { FilterOperation } from "@/types/image";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;

function render(ui: React.ReactNode) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return container;
}

function textContent(element: Element): string {
  return element.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function elementSaTekstom(text: string | RegExp): HTMLElement {
  const element = Array.from(container.querySelectorAll<HTMLElement>("*")).find(
    (candidate) => {
      const content = textContent(candidate);
      return typeof text === "string" ? content === text : text.test(content);
    },
  );
  if (!element) throw new Error(`Element nije pronadjen: ${String(text)}`);
  return element;
}

function dugme(name: string | RegExp): HTMLButtonElement {
  const button = Array.from(
    container.querySelectorAll<HTMLButtonElement>("button"),
  ).find((candidate) => {
    const label =
      candidate.getAttribute("aria-label") ??
      candidate.getAttribute("title") ??
      textContent(candidate);
    return typeof name === "string" ? label === name : name.test(label);
  });
  if (!button) throw new Error(`Dugme nije pronadjeno: ${String(name)}`);
  return button;
}

function promeni(element: HTMLInputElement | HTMLSelectElement, value: string) {
  act(() => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(element),
      "value",
    )?.set;
    valueSetter?.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function klikni(button: HTMLButtonElement) {
  act(() => {
    button.click();
  });
}

describe("UI komponente", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("AlatnaTraka prikazuje stanje akcija i salje izbor prikaza", () => {
    const onViewModeChange = vi.fn();
    const onCheckHealth = vi.fn();

    render(
      <AlatnaTraka
        canUndo={false}
        canRedo={true}
        onUndo={vi.fn()}
        onRedo={vi.fn()}
        onResetToOriginal={vi.fn()}
        hasImage={false}
        viewMode="compare"
        onViewModeChange={onViewModeChange}
        health="ok"
        onCheckHealth={onCheckHealth}
        busy={true}
      />,
    );

    expect(dugme("↶ Nazad").disabled).toBe(true);
    expect(dugme("Napred ↷").disabled).toBe(false);
    expect(dugme("Vrati original").disabled).toBe(true);
    expect(elementSaTekstom("Obrada…")).toBeTruthy();

    klikni(dugme("Original"));
    klikni(dugme(/server/i));

    expect(onViewModeChange).toHaveBeenCalledWith("original");
    expect(onCheckHealth).toHaveBeenCalledTimes(1);
  });

  it("Filter menja parametre i prosledjuje operaciju za primenu", () => {
    const onApply = vi.fn();

    render(
      <Filter onApply={onApply} onAddToBatch={vi.fn()} disabled={false} />,
    );

    expect(elementSaTekstom("Nema parametara.")).toBeTruthy();

    const select = container.querySelector("select") as HTMLSelectElement;
    promeni(select, "contrast");
    expect(elementSaTekstom("Faktor")).toBeTruthy();

    const factor = container.querySelector(
      'input[type="range"]',
    ) as HTMLInputElement;
    promeni(factor, "1.5");
    klikni(dugme("Primeni"));

    expect(onApply).toHaveBeenCalledWith({
      name: "contrast",
      params: { factor: 1.5 },
    });
  });

  it("Filter prikazuje uslovne boje samo za prilagodjeni rezim", () => {
    const onAddToBatch = vi.fn();

    render(
      <Filter onApply={vi.fn()} onAddToBatch={onAddToBatch} disabled={false} />,
    );

    const filterSelect = container.querySelector("select") as HTMLSelectElement;
    promeni(filterSelect, "colorize-grayscale");
    expect(container.textContent).not.toContain("Niska boja");

    const modeSelect = Array.from(
      container.querySelectorAll<HTMLSelectElement>("select"),
    )[1];
    promeni(modeSelect, "custom");

    expect(elementSaTekstom("Niska boja")).toBeTruthy();
    expect(elementSaTekstom("Srednja boja")).toBeTruthy();
    expect(elementSaTekstom("Visoka boja")).toBeTruthy();

    klikni(dugme("+ U grupu"));
    expect(onAddToBatch).toHaveBeenCalledWith({
      name: "colorize-grayscale",
      params: {
        mode: "custom",
        low: "#000080",
        mid: "#808080",
        high: "#ffd000",
      },
    });
  });

  it("Grupa prikazuje redosled, pokretanje i uklanjanje operacija", () => {
    const setOperations = vi.fn();
    const onRun = vi.fn();
    const operations: FilterOperation[] = [
      { name: "grayscale" },
      { name: "contrast", params: { factor: 1.2 } },
    ];

    render(
      <Grupa
        operations={operations}
        setOperations={setOperations}
        onRun={onRun}
        disabled={false}
      />,
    );

    expect(elementSaTekstom("Grayscale")).toBeTruthy();
    expect(elementSaTekstom("Contrast (factor=1.2)")).toBeTruthy();
    expect(dugme("Pokreni grupu (2)").disabled).toBe(false);

    klikni(dugme("Pokreni grupu (2)"));
    klikni(dugme("Ukloni"));
    klikni(dugme("Obrisi"));

    expect(onRun).toHaveBeenCalledTimes(1);
    expect(setOperations).toHaveBeenNthCalledWith(1, [operations[1]]);
    expect(setOperations).toHaveBeenNthCalledWith(2, []);
  });

  it("Ucitavanje odbija fajl nepodrzane ekstenzije bez pokretanja obrade", async () => {
    const onLoaded = vi.fn();
    const setBusy = vi.fn();

    render(<Ucitavanje onLoaded={onLoaded} busy={false} setBusy={setBusy} />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["tekst"], "beleske.txt", { type: "text/plain" });

    await act(async () => {
      Object.defineProperty(input, "files", {
        configurable: true,
        value: [file],
      });
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(container.querySelector('[role="alert"]')?.textContent).toMatch(
      /nepodrzan/i,
    );
    expect(onLoaded).not.toHaveBeenCalled();
    expect(setBusy).not.toHaveBeenCalled();
  });
});
