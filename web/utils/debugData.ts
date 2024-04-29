import { NuiMessage } from "../hooks/useNUIEvent";
import { isEnvBrowser } from "./misc";

/**
 * Emulates dispatching an event using SendNuiMessage in the lua scripts.
 * This is used when developing in browser
 *
 * @param events - The event you want to cover
 * @param timer - How long until it should trigger (ms)
 */
export const mockNuiEvents = <T>(
  events: NuiMessage<T>[],
  timer = 1000
): void => {
  if (isEnvBrowser()) {
    for (const event of events) {
      setTimeout(() => {
        console.log(`Mocked Nui Event: ${event.action}`);

        window.dispatchEvent(
          new MessageEvent("message", {
            data: event,
          })
        );
      }, timer);
    }
  }
};
