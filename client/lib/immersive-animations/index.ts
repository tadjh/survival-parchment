import { AnimOptions } from "./types";

export function addEmote(key: string, value: AnimOptions): boolean {
  return globalThis.exports["immersive-animations"].addEmote(key, value);
}
