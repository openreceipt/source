export interface LoggerInterface {
  debug: Function;
  error: Function;
  info: Function;
  warn: Function;
}

export default class Logger implements LoggerInterface {
  debug = (...args: any[]) => {
    // tslint:disable-next-line:no-console
    console.debug(...args);
  };
  error = (...args: any[]) => {
    // tslint:disable-next-line:no-console
    console.error(...args);
  };
  info = (...args: any[]) => {
    // tslint:disable-next-line:no-console
    console.info(...args);
  };
  warn = (...args: any[]) => {
    // tslint:disable-next-line:no-console
    console.warn(...args);
  };
}
