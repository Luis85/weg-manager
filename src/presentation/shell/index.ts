// The entry of the shell's presentation for feature components (ADR 0006). It loads Vue, so code
// that runs at plugin load imports `host.ts` instead.
export { default as ErrorNotice } from "./components/ErrorNotice.vue";
export { mountSurface } from "./mount";
export { useCommand, useQuery, useSettings } from "./runtime/use-runtime";
