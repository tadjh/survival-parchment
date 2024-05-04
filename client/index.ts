import {
  CURRENT_RESOURCE_NAME,
  DEFAULT_TEXTURE_DICTIONARY,
  DEFAULT_TEXTURE_NAME,
  RUNTIME_TEXTURE_DIMENSIONS,
  RUNTIME_TEXTURE_DICTIONARY,
  RUNTIME_TEXTURE_NAME,
} from "./config";
import { addEmote, startAnim } from "./lib/immersive-animations";
import {
  AnimFlags,
  AnimOptions,
  PedBoneId,
} from "./lib/immersive-animations/types";
import { NUICallback } from "./types";
import { SendReactMessage } from "./utils";

let dictHandle = 0;
let textureHandles: number[] = [];
let duiObject = 0;
let duiHandle = "";
let isAnim = false;

function show() {
  SetNuiFocus(true, true);
  SendReactMessage({ action: "setIsVisible", payload: true });
}

RegisterCommand(`${CURRENT_RESOURCE_NAME}:show`, show, false);

setTick(() => {
  if (IsControlJustPressed(0, 58)) {
    show();
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
});

RegisterNuiCallbackType("sendTexture");
on("__cfx_nui:sendTexture", async (url: string, cb: NUICallback) => {
  hideFrame();
  cb({});

  if (!isAnim) {
    isAnim = startAnim(parchmentEmotes.parchment);
  }

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
      pos: { x: 0.1, y: 0.02, z: 0.056 },
      rot: { x: 85.5, y: -2.5, z: 0.0 },
      debug: true,
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

/* Dui implementation */
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

  console.log(
    "w",
    GetRuntimeTextureWidth(textureHandles[textureHandles.length - 1]),
    "h",
    GetRuntimeTextureHeight(textureHandles[textureHandles.length - 1])
  );

  // RequestStreamedTextureDict(DEFAULT_TEXTURE_DICTIONARY, true);

  return new Promise<boolean>((resolve, reject) => {
    const startTime = Date.now();
    const tick = setTick(() => {
      const elapsedTime = Date.now() - startTime;
      if (
        // HasStreamedTextureDictLoaded(DEFAULT_TEXTURE_DICTIONARY) &&
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
      if (elapsedTime > 20000) {
        reject("Runtime Texture Dictionary failed to load after 20 seconds.");
        return clearTick(tick);
      }
    });
  });
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
      if (elapsedTime > 20000) {
        reject("Runtime Texture Dictionary failed to load after 20 seconds.");
        return clearTick(tick);
      }
    });
  });
}

on("immersive-animations:animCancelled", () => {
  if (isAnim) {
    RemoveReplaceTexture(DEFAULT_TEXTURE_DICTIONARY, DEFAULT_TEXTURE_NAME);
    isAnim = false;
  }
});
