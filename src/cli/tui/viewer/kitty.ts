const CHUNK_SIZE = 4096;

export interface TerminalCapability {
  kitty: boolean;
  detected: string;
}

export function detectKittySupport(env: NodeJS.ProcessEnv = process.env): TerminalCapability {
  const term = env["TERM"] ?? "";
  const termProgram = env["TERM_PROGRAM"] ?? "";
  const kittyId = env["KITTY_WINDOW_ID"];
  const ghostty = env["GHOSTTY_RESOURCES_DIR"];

  if (kittyId) return { kitty: true, detected: "kitty" };
  if (term === "xterm-kitty") return { kitty: true, detected: "kitty" };
  if (ghostty) return { kitty: true, detected: "ghostty" };
  if (termProgram === "WezTerm") return { kitty: true, detected: "WezTerm" };
  if (termProgram === "ghostty") return { kitty: true, detected: "ghostty" };

  return { kitty: false, detected: termProgram || term || "unknown" };
}

export interface KittyOpts {
  cols?: number;
  rows?: number;
  imageId?: number;
}

export function encodeKittyImage(png: Buffer, opts: KittyOpts = {}): string {
  const b64 = png.toString("base64");
  const total = b64.length;
  let out = "";
  let offset = 0;
  let first = true;

  while (offset < total) {
    const end = Math.min(offset + CHUNK_SIZE, total);
    const chunk = b64.slice(offset, end);
    const more = end < total ? 1 : 0;

    if (first) {
      const params: string[] = ["a=T", "f=100"];
      if (opts.imageId !== undefined) params.push(`i=${opts.imageId}`);
      if (opts.cols !== undefined) params.push(`c=${opts.cols}`);
      if (opts.rows !== undefined) params.push(`r=${opts.rows}`);
      params.push(`m=${more}`);
      out += `\x1b_G${params.join(",")};${chunk}\x1b\\`;
      first = false;
    } else {
      out += `\x1b_Gm=${more};${chunk}\x1b\\`;
    }
    offset = end;
  }
  return out;
}

export function clearKittyImages(): string {
  return "\x1b_Ga=d,d=A;\x1b\\";
}
