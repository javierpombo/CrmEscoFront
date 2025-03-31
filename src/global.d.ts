export {};

declare global {
  interface Window {
    _env_?: {
      API_BASE_URL?: string;
      DATASCOPE_URL?: string;
    };
  }
}
