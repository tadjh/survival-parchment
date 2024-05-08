import {
  CURRENT_RESOURCE_NAME,
  DEFAULT_TEXTURE_DICTIONARY,
  DEFAULT_TEXTURE_PREFIX,
  MAX_THROTTLE_TIMEOUT,
  parchmentEmotes,
} from "./config";
import { replaceTextureWithBase64 } from "./features/texture";
import { startAnim, stopAnim } from "./lib/immersive-animations";
import { AnimStates, NUICallback } from "./types";
import { SendReactMessage } from "./utils";
import { debugPrint } from "./utils/debug";
let isAnim = AnimStates.NONE;
let isThrottled = false;
let currQueueId = -1;

function showNUI() {
  if (!isThrottled) {
    if (!isAnim) {
      emitNet(`${CURRENT_RESOURCE_NAME}:requestQueuePosition`);
    } else {
      // TODO turn into notification instead of chat message
      return TriggerEvent("chat:addMessage", {
        args: [
          "You're already busy performing another action. You can't write on this piece of parchment while doing other things!",
        ],
      });
    }
  } else {
    // TODO turn into notification instead of chat message
    return TriggerEvent("chat:addMessage", {
      args: [
        "Please wait a minute until trying to write another on another piece of parchment.",
      ],
    });
  }
}

function hideNUI() {
  SetNuiFocus(false, false);
  SendReactMessage({ action: "setIsVisible", payload: false });
}

onNet(`${CURRENT_RESOURCE_NAME}:responseQueuePosition`, (queueId: number) => {
  SetNuiFocus(true, true);
  SendReactMessage({ action: "setIsVisible", payload: true });
  startAnim(parchmentEmotes(queueId).parchmentWrite);
  isAnim = AnimStates.WRITING_ON_PARCHMENT;
  isThrottled = true;
  currQueueId = queueId;
  const timeout = setTimeout(() => {
    isThrottled = false;
    clearTimeout(timeout);
  }, MAX_THROTTLE_TIMEOUT);
});

// TODO remove in production
RegisterCommand(`${CURRENT_RESOURCE_NAME}:show`, showNUI, false);

// TODO remove in production
setTick(() => {
  if (IsControlJustPressed(0, 58)) {
    showNUI();
  }
});

/**
 * Hook into animation library started event and set isAnim if it's currently 0.
 * This implies another resource triggered an animation so AnimStates.OTHER is set.
 */
on("immserive-animations:animStarted", () => {
  if (!isAnim) {
    isAnim = AnimStates.OTHER;
  }
});

/**
 * Hook into animation library CLIENT cancel event.
 * Clean up old texture if player was previously presenting parchment.
 * Else reset due to early dialog closing.
 */
on("immersive-animations:animStopped", () => {
  if (isAnim === AnimStates.PRESENTING_PARCHMENT) {
    emitNet(`${CURRENT_RESOURCE_NAME}:dispatchRemoveTexture`);
  } else if (isAnim === AnimStates.WRITING_ON_PARCHMENT) {
    // Player cancelled dialog and didn't finish writing their note, so remove throttle.
    isThrottled = false;
  }
  isAnim = AnimStates.NONE;
});

RegisterNuiCallbackType("hideFrame");
on("__cfx_nui:hideFrame", (data: unknown, cb: NUICallback) => {
  hideNUI();
  cb({});
  stopAnim();
  // If a player manually cancels the dialog, free up their queue position
  emitNet(`${CURRENT_RESOURCE_NAME}:requestAbandonQueue`);
  currQueueId = -1;
});

RegisterNuiCallbackType("returnTexture");
on("__cfx_nui:returnTexture", async (url: string, cb: NUICallback) => {
  hideNUI();
  cb({});

  isAnim = AnimStates.PRESENTING_PARCHMENT;
  // Model needs to be loaded before texutre swap in order to work.
  // Consider loading model before triggering animation if server latency causes flash of texture
  await startAnim(parchmentEmotes(currQueueId).parchmentHold);
  emitNet(`${CURRENT_RESOURCE_NAME}:dispatchAddTexture`, url);
});

onNet(
  `${CURRENT_RESOURCE_NAME}:broadcastAddTexture`,
  async (url: string, queueId: number) => {
    try {
      debugPrint(`Replacing texture dictionary from queue position ${queueId}`);
      await replaceTextureWithBase64(url, queueId);
    } catch (error) {
      throw new Error("Failed to replace texture");
    }
  }
);

onNet(
  `${CURRENT_RESOURCE_NAME}:responseRejection`,
  (type: "throttled" | "queue") => {
    // TODO Turn into notification popup instead of chat message
    // if (type === "throttled") {
    //   return TriggerEvent("chat:addMessage", {
    //     args: [
    //       "Please wait a minute until trying to write on another piece of parchment.",
    //     ],
    //   });
    // }
    // TODO Turn into notification popup instead of chat message
    if (type === "queue") {
      return TriggerEvent("chat:addMessage", {
        args: [
          "Too many pieces of parchment currently in use! Please wait until less people are holding up pieces of parchment.",
        ],
      });
    }
  }
);

onNet(`${CURRENT_RESOURCE_NAME}:broadcastRemoveTexture`, (queueId: number) => {
  debugPrint(
    `Restoring original texture dictionary from queue position ${queueId}`
  );
  RemoveReplaceTexture(
    DEFAULT_TEXTURE_DICTIONARY,
    `${DEFAULT_TEXTURE_PREFIX}${queueId}`
  );
});
