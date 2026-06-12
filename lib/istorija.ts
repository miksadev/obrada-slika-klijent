export const MAX_ISTORIJA = 3;

export class IstorijaStek<T> {
  private nazadStek: T[] = [];
  private napredStek: T[] = [];
  private trenutno: T | null = null;

  constructor(private readonly granica: number = MAX_ISTORIJA) {}

  get current(): T | null {
    return this.trenutno;
  }

  get canUndo(): boolean {
    return this.nazadStek.length > 0;
  }

  get canRedo(): boolean {
    return this.napredStek.length > 0;
  }

  get size(): number {
    return this.nazadStek.length;
  }

  reset(state: T): void {
    this.trenutno = state;
    this.nazadStek = [];
    this.napredStek = [];
  }

  push(state: T): void {
    if (this.trenutno !== null) {
      this.nazadStek.push(this.trenutno);
      if (this.nazadStek.length > this.granica) {
        this.nazadStek.splice(0, this.nazadStek.length - this.granica);
      }
    }
    this.trenutno = state;
    this.napredStek = [];
  }

  undo(): T | null {
    if (this.nazadStek.length === 0 || this.trenutno === null) return this.trenutno;
    const prethodno = this.nazadStek.pop() as T;
    this.napredStek.push(this.trenutno);
    this.trenutno = prethodno;
    return this.trenutno;
  }

  redo(): T | null {
    if (this.napredStek.length === 0) return this.trenutno;
    const sledece = this.napredStek.pop() as T;
    if (this.trenutno !== null) {
      this.nazadStek.push(this.trenutno);
      if (this.nazadStek.length > this.granica) {
        this.nazadStek.splice(0, this.nazadStek.length - this.granica);
      }
    }
    this.trenutno = sledece;
    return this.trenutno;
  }
}
