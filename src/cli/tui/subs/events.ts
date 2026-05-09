export type SubChannel = "project" | "models" | "versions" | "comments";

export interface DashboardEvent {
  ts: number;
  projectId: string;
  channel: SubChannel;
  type: string;
  summary: string;
  raw: unknown;
}

export const EVENT_BUFFER_CAP = 500;

export class EventLog {
  private buf: DashboardEvent[] = [];

  push(e: DashboardEvent): void {
    this.buf.push(e);
    if (this.buf.length > EVENT_BUFFER_CAP) {
      this.buf.splice(0, this.buf.length - EVENT_BUFFER_CAP);
    }
  }

  snapshot(): DashboardEvent[] {
    return this.buf.slice();
  }

  clear(): void {
    this.buf.length = 0;
  }
}

export function formatTs(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
