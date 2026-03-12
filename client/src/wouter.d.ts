export {};

declare global {
  interface Window {
    __WOUTER_ROUTES__: string[] | undefined;
  }
}
