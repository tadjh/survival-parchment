import {
  CURRENT_RESOURCE_NAME,
  DEFAULT_TEXTURE_DICTIONARY,
  DEFAULT_TEXTURE_NAME,
  MAX_THROTTLE_TIMEOUT,
  parchmentEmotes,
  registerEmotes,
} from "./config";
import { replaceTextureWithBase64 } from "./features/texture";
import { startAnim, stopAnim } from "./lib/immersive-animations";
import { AnimStates, NUICallback } from "./types";
import { SendReactMessage } from "./utils";
import { debugPrint } from "./utils/debug";
let isAnim = AnimStates.NONE;
let isThrottled = false;
registerEmotes();

function showNUI() {
  if (!isThrottled) {
    if (!isAnim) {
      SetNuiFocus(true, true);
      SendReactMessage({ action: "setIsVisible", payload: true });
      startAnim(parchmentEmotes.parchment);
      isAnim = AnimStates.WRITING_ON_PARCHMENT;
      const timeout = setTimeout(() => {
        isThrottled = false;
        clearTimeout(timeout);
      }, MAX_THROTTLE_TIMEOUT);
    } else {
      return TriggerEvent("chat:addMessage", {
        args: [
          "You're already busy performing another action. You can't write on this piece of parchment while doing other things!",
        ],
      });
    }
  } else {
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

RegisterCommand(`${CURRENT_RESOURCE_NAME}:show`, showNUI, false);

setTick(() => {
  if (IsControlJustPressed(0, 58)) {
    showNUI();
  }
});

on("immserive-animations:animStarted", () => {
  if (!isAnim) {
    isAnim = AnimStates.OTHER;
  }
});

// Hook into animation library cancel event and remove texture if currently presenting parchment.
on("immersive-animations:animStopped", () => {
  if (isAnim === AnimStates.PRESENTING_PARCHMENT) {
    emitNet(`${CURRENT_RESOURCE_NAME}:dispatchRemoveTexture`);
  } else if (isAnim === AnimStates.WRITING_ON_PARCHMENT) {
    isThrottled = false;
  }
  isAnim = AnimStates.NONE;
});

RegisterNuiCallbackType("hideFrame");
on("__cfx_nui:hideFrame", (data: unknown, cb: NUICallback) => {
  hideNUI();
  cb({});
  stopAnim();
});

RegisterNuiCallbackType("returnTexture");
on("__cfx_nui:returnTexture", async (url: string, cb: NUICallback) => {
  hideNUI();
  cb({});

  isAnim = AnimStates.PRESENTING_PARCHMENT;
  await startAnim(parchmentEmotes.parchment2);

  console.log(url);

  emitNet(`${CURRENT_RESOURCE_NAME}:dispatchAddTexture`, url);
});

onNet(`${CURRENT_RESOURCE_NAME}:broadcastAddTexture`, async (url: string) => {
  try {
    await replaceTextureWithBase64(url);
  } catch (error) {
    throw new Error("Failed to replace texture");
  }
});

onNet(`${CURRENT_RESOURCE_NAME}:broadcastRejection`, () => {
  // TODO Turn into notification popup instead of chat message
  return TriggerEvent("chat:addMessage", {
    args: [
      "Please wait a minute until trying to write another on another piece of parchment.",
    ],
  });
});

onNet(`${CURRENT_RESOURCE_NAME}:broadcastRemoveTexture`, () => {
  debugPrint("Restoring original texture dictionary");
  RemoveReplaceTexture(DEFAULT_TEXTURE_DICTIONARY, DEFAULT_TEXTURE_NAME);
});
