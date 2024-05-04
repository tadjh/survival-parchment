import {
  CURRENT_RESOURCE_NAME,
  DEFAULT_TEXTURE_DICTIONARY,
  DEFAULT_TEXTURE_NAME,
  RUNTIME_TEXTURE_DIMENSIONS,
  RUNTIME_TEXTURE_DICTIONARY,
  RUNTIME_TEXTURE_NAME,
  MAX_EXECUTION_TIME,
} from "./config";
import { addEmote, startAnim, stopAnim } from "./lib/immersive-animations";
import {
  AnimFlags,
  AnimOptions,
  PedBoneId,
} from "./lib/immersive-animations/types";
import { AnimStates, NUICallback } from "./types";
import { SendReactMessage } from "./utils";
import { debugPrint } from "./utils/debug";

let dictHandle = 0;
let textureHandles: number[] = [];
let duiObject = 0;
let duiHandle = "";
let isAnim = AnimStates.NONE;

function show() {
  SetNuiFocus(true, true);
  SendReactMessage({ action: "setIsVisible", payload: true });
  startAnim(parchmentEmotes.parchment);
  isAnim = AnimStates.WRITING_ON_PARCHMENT;
}

RegisterCommand(`${CURRENT_RESOURCE_NAME}:show`, show, false);

setTick(() => {
  if (IsControlJustPressed(0, 58)) {
    show();
  }
});

on("immersive-animations:animCancelled", () => {
  if (isAnim) {
    debugPrint("Restoring original texture dictionary");
    RemoveReplaceTexture(DEFAULT_TEXTURE_DICTIONARY, DEFAULT_TEXTURE_NAME);
    isAnim = AnimStates.NONE;
  }
});

function hideFrame() {
  SetNuiFocus(false, false);
  SendReactMessage({ action: "setIsVisible", payload: false });
}

RegisterNuiCallbackType("hideFrame");
on("__cfx_nui:hideFrame", (data: unknown, cb: NUICallback) => {
  hideFrame();
  cb({});

  stopAnim();
  isAnim = AnimStates.NONE;
});

RegisterNuiCallbackType("sendTexture");
on("__cfx_nui:sendTexture", async (url: string, cb: NUICallback) => {
  hideFrame();
  cb({});

  startAnim(parchmentEmotes.parchment2);
  isAnim = AnimStates.PRESENTING_PARCHMENT;

  try {
    await replaceTextureWithBase64(url);
  } catch (error) {
    throw new Error("Failed to replace texture");
  }

  // TODO ? RemoveReplaceTexture()
});

const parchmentEmotes: { [key: string]: AnimOptions } = {
  parchment: {
    dictionary: "missheistdockssetup1clipboard@base",
    name: "base",
    type: "single",
    flag:
      AnimFlags.AF_LOOPING + AnimFlags.AF_UPPERBODY + AnimFlags.AF_SECONDARY,
    prop: {
      model: "prop_survival_parchment",
      bone: PedBoneId.SKEL_L_Hand,
      pos: { x: 0.1, y: 0.02, z: 0.061 },
      rot: { x: 265.199, y: 71.4, z: 68.1 },
    },
    propTwo: {
      model: "prop_cs_marker_01",
      bone: PedBoneId.SKEL_R_Hand,
      pos: { x: 0.129, y: 0.048, z: -0.011 },
      rot: { x: -120.0, y: 0.0, z: 0.0 },
    },
  },
  parchment2: {
    dictionary: "amb@world_human_bum_freeway@male@base",
    name: "base",
    type: "single",
    flag:
      AnimFlags.AF_LOOPING + AnimFlags.AF_UPPERBODY + AnimFlags.AF_SECONDARY,
    prop: {
      model: "prop_survival_parchment",
      bone: PedBoneId.SKEL_R_Finger20,
      pos: { x: 0.21, y: 0.16, z: 0.0 },
      rot: { x: 5.0, y: 5.0, z: 41.0 },
    },
    propTwo: {
      model: "prop_cs_marker_01",
      bone: PedBoneId.SKEL_R_Hand,
      pos: { x: 0.129, y: 0.048, z: -0.011 },
      rot: { x: -120.0, y: 0.0, z: 0.0 },
    },
  },
};

// Register parchment emotes with animation resource

for (const key in parchmentEmotes) {
  if (Object.prototype.hasOwnProperty.call(parchmentEmotes, key)) {
    addEmote(key, parchmentEmotes[key]);
  }
}

function replaceTextureWithBase64(url: string) {
  if (!dictHandle) {
    dictHandle = CreateRuntimeTxd(RUNTIME_TEXTURE_DICTIONARY);
  }

  const nextTextureNumber = textureHandles.length + 1;

  const nextTexture = CreateRuntimeTextureFromImage(
    dictHandle,
    RUNTIME_TEXTURE_NAME + nextTextureNumber,
    url
  );

  textureHandles.push(nextTexture);

  return new Promise<boolean>((resolve, reject) => {
    const startTime = Date.now();
    const tick = setTick(() => {
      const elapsedTime = Date.now() - startTime;
      if (
        HasStreamedTextureDictLoaded(DEFAULT_TEXTURE_DICTIONARY) &&
        HasStreamedTextureDictLoaded(RUNTIME_TEXTURE_DICTIONARY)
      ) {
        // TODO increment the swaps?
        AddReplaceTexture(
          DEFAULT_TEXTURE_DICTIONARY,
          DEFAULT_TEXTURE_NAME,
          RUNTIME_TEXTURE_DICTIONARY,
          RUNTIME_TEXTURE_NAME + nextTextureNumber
        );

        resolve(true);
        return clearTick(tick);
      }
      if (elapsedTime > MAX_EXECUTION_TIME) {
        reject("Runtime Texture Dictionary failed to load after 20 seconds.");
        return clearTick(tick);
      }
    });
  });
}

/* Unused Dui implementation */
function replaceTextureWithURL(url: string) {
  if (!dictHandle) {
    dictHandle = CreateRuntimeTxd(RUNTIME_TEXTURE_DICTIONARY);
  }

  if (!duiObject) {
    duiObject = CreateDui(
      url,
      RUNTIME_TEXTURE_DIMENSIONS,
      RUNTIME_TEXTURE_DIMENSIONS
    );
  } else {
    SetDuiUrl(duiObject, url);
  }

  if (!duiHandle) {
    duiHandle = GetDuiHandle(duiObject);
  }

  const nextTexture = CreateRuntimeTextureFromDuiHandle(
    dictHandle,
    RUNTIME_TEXTURE_NAME,
    duiHandle
  );

  textureHandles.push(nextTexture);

  // RequestStreamedTextureDict(DEFAULT_TEXTURE_DICTIONARY, true);

  return new Promise<boolean>((resolve, reject) => {
    const startTime = Date.now();
    const tick = setTick(() => {
      const elapsedTime = Date.now() - startTime;
      if (
        HasStreamedTextureDictLoaded(DEFAULT_TEXTURE_DICTIONARY) &&
        HasStreamedTextureDictLoaded(RUNTIME_TEXTURE_DICTIONARY)
      ) {
        AddReplaceTexture(
          DEFAULT_TEXTURE_DICTIONARY,
          DEFAULT_TEXTURE_NAME,
          RUNTIME_TEXTURE_DICTIONARY,
          RUNTIME_TEXTURE_NAME
        );

        resolve(true);

        return clearTick(tick);
      }
      if (elapsedTime > MAX_EXECUTION_TIME) {
        reject("Runtime Texture Dictionary failed to load after 20 seconds.");
        return clearTick(tick);
      }
    });
  });
}
