/**
 * T00lz Dev Tools — OpenClaw Plugin
 * https://t00lz.com
 *
 * Registers 8 developer utility tools directly into your OpenClaw agent.
 * All processing is local — no data is sent anywhere.
 */

import { marked } from "marked";

// ─── Plugin Registration ──────────────────────────────────────────────────────

export function register(api: any) {
  const cfg = api.config?.plugins?.entries?.["t00lz-dev-tools"]?.config ?? {};
  const defaultPasswordLength: number = cfg.passwordDefaultLength ?? 20;
  const defaultPasswordSymbols: boolean = cfg.passwordDefaultSymbols ?? true;

  // ── 1. JSON Formatter ───────────────────────────────────────────────────────
  api.registerTool({
    name: "json_format",
    description:
      "Beautify or minify a JSON string. Use action='beautify' (default) or action='minify'. " +
      "Returns formatted JSON or a clear error message with the problem line.",
    inputSchema: {
      type: "object",
      required: ["json"],
      properties: {
        json: { type: "string", description: "The raw JSON string to process" },
        action: {
          type: "string",
          enum: ["beautify", "minify"],
          default: "beautify",
          description: "Whether to beautify or minify",
        },
        indent: {
          type: "number",
          default: 2,
          description: "Indentation spaces (beautify only)",
        },
      },
    },
    async execute({ json, action = "beautify", indent = 2 }: any) {
      try {
        const parsed = JSON.parse(json);
        if (action === "minify") {
          return { result: JSON.stringify(parsed), action: "minified" };
        }
        return {
          result: JSON.stringify(parsed, null, indent),
          action: "beautified",
        };
      } catch (err: any) {
        return { error: `Invalid JSON: ${err.message}` };
      }
    },
  });

  // ── 2. JSON Validator ───────────────────────────────────────────────────────
  api.registerTool({
    name: "json_validate",
    description:
      "Validate a JSON string and report any syntax errors with the exact position.",
    inputSchema: {
      type: "object",
      required: ["json"],
      properties: {
        json: { type: "string", description: "The JSON string to validate" },
      },
    },
    async execute({ json }: any) {
      try {
        JSON.parse(json);
        return { valid: true, message: "✅ Valid JSON — no errors found." };
      } catch (err: any) {
        // Extract line/col from error message where available
        const match = err.message.match(/position (\d+)/i);
        let hint = "";
        if (match) {
          const pos = parseInt(match[1], 10);
          const before = json.slice(0, pos);
          const line = (before.match(/\n/g) ?? []).length + 1;
          const col = pos - before.lastIndexOf("\n");
          hint = ` (line ${line}, col ${col})`;
        }
        return {
          valid: false,
          error: `❌ Invalid JSON${hint}: ${err.message}`,
        };
      }
    },
  });

  // ── 3. Base64 Encoder / Decoder ─────────────────────────────────────────────
  api.registerTool({
    name: "base64",
    description:
      "Encode a plain string to Base64, or decode a Base64 string back to plain text.",
    inputSchema: {
      type: "object",
      required: ["text", "action"],
      properties: {
        text: { type: "string", description: "The string to process" },
        action: {
          type: "string",
          enum: ["encode", "decode"],
          description: "'encode' converts plain text → Base64; 'decode' reverses it",
        },
      },
    },
    async execute({ text, action }: any) {
      try {
        if (action === "encode") {
          const result = Buffer.from(text, "utf8").toString("base64");
          return { result, action: "encoded" };
        } else {
          const result = Buffer.from(text, "base64").toString("utf8");
          return { result, action: "decoded" };
        }
      } catch (err: any) {
        return { error: `Base64 ${action} failed: ${err.message}` };
      }
    },
  });

  // ── 4. Secure Password Generator ───────────────────────────────────────────
  api.registerTool({
    name: "generate_password",
    description:
      "Generate a cryptographically secure random password. Fully local — never transmitted anywhere.",
    inputSchema: {
      type: "object",
      properties: {
        length: {
          type: "number",
          default: defaultPasswordLength,
          description: "Password length (8–128)",
        },
        symbols: {
          type: "boolean",
          default: defaultPasswordSymbols,
          description: "Include symbols like !@#$%^&*()",
        },
        numbers: {
          type: "boolean",
          default: true,
          description: "Include digits 0–9",
        },
        uppercase: {
          type: "boolean",
          default: true,
          description: "Include uppercase letters A–Z",
        },
      },
    },
    async execute({
      length = defaultPasswordLength,
      symbols = defaultPasswordSymbols,
      numbers = true,
      uppercase = true,
    }: any) {
      const clampedLength = Math.min(128, Math.max(8, length));
      let chars = "abcdefghijklmnopqrstuvwxyz";
      if (uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (numbers) chars += "0123456789";
      if (symbols) chars += "!@#$%^&*()-_=+[]{}|;:,.<>?";

      const { randomBytes } = await import("crypto");
      let password = "";
      while (password.length < clampedLength) {
        const byte = randomBytes(1)[0];
        if (byte < 256 - (256 % chars.length)) {
          password += chars[byte % chars.length];
        }
      }
      return {
        password,
        length: clampedLength,
        strength:
          clampedLength >= 20 && symbols && numbers
            ? "💪 Strong"
            : clampedLength >= 12
            ? "✅ Good"
            : "⚠️ Weak — consider increasing length",
      };
    },
  });

  // ── 5. Markdown → HTML ──────────────────────────────────────────────────────
  api.registerTool({
    name: "markdown_to_html",
    description:
      "Convert a Markdown string to clean HTML. Returns the full HTML output.",
    inputSchema: {
      type: "object",
      required: ["markdown"],
      properties: {
        markdown: { type: "string", description: "The Markdown source text" },
        wrap: {
          type: "boolean",
          default: false,
          description: "Wrap output in a basic <!DOCTYPE html> page shell",
        },
      },
    },
    async execute({ markdown, wrap = false }: any) {
      const body = await marked.parse(markdown);
      if (!wrap) return { html: body };
      const full = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Document</title>
</head>
<body>
${body}
</body>
</html>`;
      return { html: full };
    },
  });

  // ── 6. Word & Character Counter ─────────────────────────────────────────────
  api.registerTool({
    name: "word_count",
    description:
      "Count words, characters, sentences, paragraphs, and estimated reading time for any text.",
    inputSchema: {
      type: "object",
      required: ["text"],
      properties: {
        text: { type: "string", description: "The text to analyse" },
        wpm: {
          type: "number",
          default: 200,
          description: "Reading speed in words per minute (default 200)",
        },
      },
    },
    async execute({ text, wpm = 200 }: any) {
      const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
      const chars = text.length;
      const charsNoSpaces = text.replace(/\s/g, "").length;
      const sentences = (text.match(/[.!?]+/g) ?? []).length;
      const paragraphs = text
        .split(/\n\s*\n/)
        .filter((p: string) => p.trim().length > 0).length;
      const readingTimeSec = Math.ceil((words / wpm) * 60);
      const minutes = Math.floor(readingTimeSec / 60);
      const seconds = readingTimeSec % 60;
      const readingTime =
        minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

      return {
        words,
        characters: chars,
        charactersNoSpaces: charsNoSpaces,
        sentences,
        paragraphs,
        readingTime,
      };
    },
  });

  // ── 7. Case Converter ───────────────────────────────────────────────────────
  api.registerTool({
    name: "case_convert",
    description:
      "Convert text between cases: uppercase, lowercase, title, sentence, camelCase, snake_case, kebab-case.",
    inputSchema: {
      type: "object",
      required: ["text", "case"],
      properties: {
        text: { type: "string", description: "The text to convert" },
        case: {
          type: "string",
          enum: [
            "uppercase",
            "lowercase",
            "title",
            "sentence",
            "camel",
            "snake",
            "kebab",
          ],
          description: "Target case format",
        },
      },
    },
    async execute({ text, case: targetCase }: any) {
      let result: string;
      switch (targetCase) {
        case "uppercase":
          result = text.toUpperCase();
          break;
        case "lowercase":
          result = text.toLowerCase();
          break;
        case "title":
          result = text
            .toLowerCase()
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
          break;
        case "sentence":
          result = text
            .toLowerCase()
            .replace(/(^\s*\w|[.!?]\s+\w)/g, (c: string) => c.toUpperCase());
          break;
        case "camel":
          result = text
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_: string, c: string) =>
              c.toUpperCase()
            );
          break;
        case "snake":
          result = text
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_]/g, "");
          break;
        case "kebab":
          result = text
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
          break;
        default:
          result = text;
      }
      return { result, case: targetCase };
    },
  });

  // ── 8. Text Diff ────────────────────────────────────────────────────────────
  api.registerTool({
    name: "text_diff",
    description:
      "Compare two texts line-by-line and return added, removed, and unchanged lines.",
    inputSchema: {
      type: "object",
      required: ["text_a", "text_b"],
      properties: {
        text_a: { type: "string", description: "Original text" },
        text_b: { type: "string", description: "New/modified text" },
        context: {
          type: "number",
          default: 3,
          description: "Lines of context around each change",
        },
      },
    },
    async execute({ text_a, text_b, context = 3 }: any) {
      const linesA = text_a.split("\n");
      const linesB = text_b.split("\n");

      // Simple LCS-based line diff
      const diff: Array<{ type: "add" | "remove" | "same"; line: string }> = [];
      let i = 0,
        j = 0;

      // Build LCS table
      const m = linesA.length,
        n = linesB.length;
      const dp: number[][] = Array.from({ length: m + 1 }, () =>
        new Array(n + 1).fill(0)
      );
      for (let r = 1; r <= m; r++) {
        for (let c = 1; c <= n; c++) {
          dp[r][c] =
            linesA[r - 1] === linesB[c - 1]
              ? dp[r - 1][c - 1] + 1
              : Math.max(dp[r - 1][c], dp[r][c - 1]);
        }
      }

      // Trace back
      const trace: Array<{ type: "add" | "remove" | "same"; line: string }> =
        [];
      let r = m,
        c = n;
      while (r > 0 || c > 0) {
        if (r > 0 && c > 0 && linesA[r - 1] === linesB[c - 1]) {
          trace.push({ type: "same", line: linesA[r - 1] });
          r--;
          c--;
        } else if (c > 0 && (r === 0 || dp[r][c - 1] >= dp[r - 1][c])) {
          trace.push({ type: "add", line: linesB[c - 1] });
          c--;
        } else {
          trace.push({ type: "remove", line: linesA[r - 1] });
          r--;
        }
      }
      trace.reverse();

      const added = trace.filter((d) => d.type === "add").length;
      const removed = trace.filter((d) => d.type === "remove").length;
      const unchanged = trace.filter((d) => d.type === "same").length;

      // Format as unified-diff-style string
      const formatted = trace
        .map((d) => {
          if (d.type === "add") return `+ ${d.line}`;
          if (d.type === "remove") return `- ${d.line}`;
          return `  ${d.line}`;
        })
        .join("\n");

      return {
        summary: `+${added} added, -${removed} removed, ${unchanged} unchanged`,
        diff: formatted,
        hasChanges: added > 0 || removed > 0,
      };
    },
  });

  api.log?.info(
    "[t00lz-dev-tools] 8 tools registered: json_format, json_validate, base64, generate_password, markdown_to_html, word_count, case_convert, text_diff"
  );
}
