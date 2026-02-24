/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare global {
  var __CORE_ENV__: {
    readonly apiUrl: string;
  };
}
