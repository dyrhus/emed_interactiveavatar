type LogArgs = string | number | boolean | null | undefined | object;

export const logger = {
  log: (message: string, ...args: LogArgs[]) => {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
  }
};
