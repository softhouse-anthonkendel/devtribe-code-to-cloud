const now = () => new Date().toLocaleString("sv");

export const logger = {
  info: (...args) => console.info(`[${now()}]`, ...args),
};
