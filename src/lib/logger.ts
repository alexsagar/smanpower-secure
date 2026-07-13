const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

type LogLevel = keyof typeof LOG_LEVELS;

function getLogLevel(): number {
  const envLevel = (process.env.LOG_LEVEL || (process.env.NODE_ENV === "development" ? "info" : "warn")).toLowerCase() as LogLevel;
  return LOG_LEVELS[envLevel] ?? LOG_LEVELS.warn;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= getLogLevel();
}

/**
 * A safe, structured logger that respects the LOG_LEVEL environment variable.
 * Default in production: warn.
 * Default in development: info.
 */
export const logger = {
  debug: (...args: any[]) => {
    if (shouldLog("debug")) {
      console.debug(...args);
    }
  },
  info: (...args: any[]) => {
    if (shouldLog("info")) {
      console.info(...args);
    }
  },
  warn: (...args: any[]) => {
    if (shouldLog("warn")) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (shouldLog("error")) {
      console.error(...args);
    }
  },
};
