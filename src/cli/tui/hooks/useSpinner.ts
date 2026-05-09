import { useEffect, useState } from "react";
import { SPINNER_FRAMES, SPINNER_INTERVAL_MS } from "../tree/icons.js";

export function useSpinner(active: boolean): number {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setFrame((f) => (f + 1) % SPINNER_FRAMES.length);
    }, SPINNER_INTERVAL_MS);
    return () => clearInterval(id);
  }, [active]);

  return frame;
}
