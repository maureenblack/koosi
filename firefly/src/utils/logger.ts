export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  info(message: string): void {
    console.log(`[${this.getTimestamp()}] [${this.context}] [INFO] ${message}`);
  }

  error(message: string): void {
    console.error(`[${this.getTimestamp()}] [${this.context}] [ERROR] ${message}`);
  }

  warn(message: string): void {
    console.warn(`[${this.getTimestamp()}] [${this.context}] [WARN] ${message}`);
  }

  debug(message: string): void {
    if (process.env.DEBUG === 'true') {
      console.debug(`[${this.getTimestamp()}] [${this.context}] [DEBUG] ${message}`);
    }
  }
}
