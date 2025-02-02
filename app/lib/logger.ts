const isDevelopment = process.env.NODE_ENV === 'development';

type LogArgs = string | number | boolean | null | undefined | object;

export const logger = {
  log: (message: string, ...args: LogArgs[]) => {
    // eslint-disable-next-line no-console
    if (isDevelopment) console.log(message, ...args);
  }
};
