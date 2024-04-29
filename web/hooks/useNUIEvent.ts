import { MutableRefObject, useEffect, useRef } from "react";
import { noop } from "../utils/misc";

export interface NuiMessage<T = unknown> {
  action: string;
  payload: T;
}

type NuiHandlerSignature<T> = (data: T) => void;

/**
 * A hook that manage events listeners for receiving data from the client scripts
 * @param action The specific `action` that should be listened for.
 * @param handler The callback function that will handle data relayed by this hook
 *
 * @example
 * useNuiEvent<{visibility: true, wasVisible: 'something'}>('setVisible', (data) => {
 *   // whatever logic you want
 * })
 *
 **/

export function useNuiEvent<T = unknown>(
  action: string,
  handler: NuiHandlerSignature<T>
) {
  const savedHandler: MutableRefObject<NuiHandlerSignature<T>> = useRef(noop);

  // Make sure we handle for a reactive handler
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    function handleMessage(event: MessageEvent<NuiMessage<T>>) {
      // TODO Doesn't savedHandler.current always exists since line 27 initializes with a function?
      if (!savedHandler.current) return;

      if (event.data.action === action) {
        savedHandler.current(event.data.payload);
      }
    }

    window.addEventListener("message", handleMessage);
    // Remove Event Listener on component cleanup
    return () => window.removeEventListener("message", handleMessage);
  }, [action]);
}
