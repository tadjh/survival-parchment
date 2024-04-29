import { Args, NUIMessage } from "../types";

export function isEmpty<T extends unknown>(arr: T[] | []): arr is [] {
  return Array.isArray(arr) && !arr.length;
}

export function getArg(args: Args) {
  const [arg1] = args;
  return arg1;
}

export function SendReactMessage(nuiMessage: NUIMessage) {
  return SendNUIMessage(nuiMessage);
}
