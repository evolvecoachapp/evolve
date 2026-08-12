/// <reference types="vite/client" />

declare const __API_BASE_URL__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
