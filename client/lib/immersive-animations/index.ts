import { AnimHandles, AnimOptions } from "./types";

export function addEmote(key: string, value: AnimOptions): boolean {
  return globalThis.exports["immersive-animations"].addEmote(key, value);
}

export function startAnim(options: AnimOptions): Promise<AnimHandles> {
  return globalThis.exports["immersive-animations"].startAnim(options);
}

export function stopAnim() {
  return globalThis.exports["immersive-animations"].stopAnim();
}
