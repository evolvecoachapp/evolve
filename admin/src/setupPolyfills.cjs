const { TextDecoder, TextEncoder } = require("util");

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

if (typeof globalThis.fetch !== "function") {
  globalThis.fetch = () => Promise.reject(new Error("fetch is not mocked"));
}
