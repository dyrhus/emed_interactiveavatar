const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (message: string, ...args: any[]) => {
    // eslint-disable-next-line no-console
    if (isDevelopment) console.log(message, ...args);
  }
};
