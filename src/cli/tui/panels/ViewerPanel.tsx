import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { fetchVersionPreview, type PreviewTarget } from "../viewer/preview.js";
import {
  clearKittyImages,
  detectKittySupport,
  encodeKittyImage,
} from "../viewer/kitty.js";
import { useSpinner } from "../hooks/useSpinner.js";

interface ViewerPanelProps {
  target: PreviewTarget | null;
  server: string;
  token: string | undefined;
  focused: boolean;
}

const PREVIEW_COLS = 40;
const PREVIEW_ROWS = 12;

const cap = detectKittySupport();

export function ViewerPanel({
  target,
  server,
  token,
  focused,
}: ViewerPanelProps): React.ReactNode {
  const [png, setPng] = useState<Buffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const lastTargetRef = useRef<string | null>(null);
  const spinnerFrame = useSpinner(loading);

  useEffect(() => {
    if (!target) {
      setPng(null);
      setError(null);
      lastTargetRef.current = null;
      if (cap.kitty) process.stdout.write(clearKittyImages());
      return;
    }
    const key = `${target.streamId}:${target.versionId}`;
    if (lastTargetRef.current === key) return;
    lastTargetRef.current = key;

    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetchVersionPreview(server, token, target, ctrl.signal)
      .then((buf) => {
        setPng(buf);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
    return () => ctrl.abort();
  }, [target, server, token]);

  useEffect(() => {
    if (!cap.kitty || !png) return;
    process.stdout.write(
      encodeKittyImage(png, { cols: PREVIEW_COLS, rows: PREVIEW_ROWS, imageId: 1 }),
    );
  }, [png]);

  useEffect(() => {
    return () => {
      if (cap.kitty) process.stdout.write(clearKittyImages());
    };
  }, []);

  return (
    <box
      flexGrow={2}
      border
      borderColor={focused ? "cyan" : "gray"}
      padding={1}
      flexDirection="column"
    >
      <text>Viewer ({cap.detected})</text>
      {!target ? <text>(no version selected — cursor onto a version row)</text> : null}
      {target && loading ? (
        <text>
          {"⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"[spinnerFrame % 10]} fetching preview…
        </text>
      ) : null}
      {target && error ? <text>error: {error}</text> : null}
      {target && png && !cap.kitty ? (
        <text>preview ready ({png.length} bytes) — terminal does not support Kitty graphics</text>
      ) : null}
      {target && png && cap.kitty
        ? Array.from({ length: PREVIEW_ROWS }).map((_, i) => (
            <text key={`spacer-${i}`}> </text>
          ))
        : null}
    </box>
  );
}
