// ---------------------------------------------------------------------------
// Minimal structured logger — no external deps
// ---------------------------------------------------------------------------

type LogLevel = "info" | "warn" | "error";

function log(level: LogLevel, context: string, message: string, data?: object): void {
  const entry = {
    time: new Date().toISOString(),
    level,
    context,
    message,
    ...(data ?? {}),
  };
  const output = JSON.stringify(entry);
  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  info: (context: string, message: string, data?: object) => log("info", context, message, data),
  warn: (context: string, message: string, data?: object) => log("warn", context, message, data),
  error: (context: string, message: string, data?: object) => log("error", context, message, data),
};
