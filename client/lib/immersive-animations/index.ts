import { AnimOptions } from "./types";

export function addEmote(key: string, value: AnimOptions): boolean {
  return globalThis.exports["immersive-animations"].addEmote(key, value);
}

export function startAnim(options: AnimOptions) {
  return globalThis.exports["immersive-animations"].startAnim(options);
}
