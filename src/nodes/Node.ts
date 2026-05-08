import type { Speckle } from "../client.js";

export abstract class Node<TData> {
  protected readonly speckle: Speckle;
  protected readonly parent: Node<unknown> | null;
  private cached: Promise<TData> | null = null;

  constructor(speckle: Speckle, parent: Node<unknown> | null = null) {
    this.speckle = speckle;
    this.parent = parent;
  }

  get get(): Promise<TData> {
    if (!this.cached) this.cached = this.fetch();
    return this.cached;
  }

  refresh(): Promise<TData> {
    this.cached = this.fetch();
    return this.cached;
  }

  protected abstract fetch(): Promise<TData>;
}
