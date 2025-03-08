export {};

declare global {
  interface Window {
    _env_?: {
      API_BASE_URL?: string;
    //   OTHER_ENV?: string;
      // Agrega aquí todas las variables que necesites
    };
  }
}
