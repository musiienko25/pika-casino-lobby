/**
 * Centralized logging service
 * Provides structured logging with different levels
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private minLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.minLevel = 
      process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Set minimum log level
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Format log entry for console output
   */
  private formatLog(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const contextStr = entry.context 
      ? ` ${JSON.stringify(entry.context)}` 
      : '';
    const errorStr = entry.error 
      ? `\nError: ${entry.error.message}\nStack: ${entry.error.stack}` 
      : '';
    
    return `[${entry.timestamp}] [${levelName}] ${entry.message}${contextStr}${errorStr}`;
  }

  /**
   * Send log to external service (e.g., Sentry, LogRocket)
   * This is a placeholder for future integration
   */
  private sendToExternalService(entry: LogEntry): void {
    // In production, you might want to send errors to external services
    // Example: Sentry, LogRocket, DataDog, etc.
    if (entry.level >= LogLevel.ERROR && !this.isDevelopment) {
      // TODO: Integrate with error tracking service
      // Example: Sentry.captureException(entry.error, { extra: entry.context });
    }
  }

  /**
   * Internal log method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    if (level < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    // Format and output to console
    const formattedLog = this.formatLog(entry);
    
    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedLog);
        }
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
    }

    // Send to external service if needed
    this.sendToExternalService(entry);
  }

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log error message
   */
  error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    this.log(LogLevel.ERROR, message, context, error);
  }
}

// Export singleton instance
export const logger = new Logger();

