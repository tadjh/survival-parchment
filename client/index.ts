import {
  CURRENT_RESOURCE_NAME,
  DEFAULT_TEXTURE_DICTIONARY,
  DEFAULT_TEXTURE_NAME,
  PARCHMENT_TEXTURE_DIMENSIONS,
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
let textureHandle = 0;
let duiObject = 0;
let duiHandle = "";

function show() {
  SetNuiFocus(true, true);
  SendReactMessage({ action: "setIsVisible", payload: true });
}

RegisterCommand(`${CURRENT_RESOURCE_NAME}:show`, show, false);

RegisterNuiCallbackType("hideFrame");

on("__cfx_nui:hideFrame", (data: unknown, cb: NUICallback) => {
  SetNuiFocus(false, false);
  SendReactMessage({ action: "setIsVisible", payload: false });
  cb({});
});

RegisterNuiCallbackType("sendTexture");

on("__cfx_nui:sendTexture", (data: string, cb: NUICallback) => {
  SetNuiFocus(false, false);
  SendReactMessage({ action: "setIsVisible", payload: false });

  if (!dictHandle) {
    dictHandle = CreateRuntimeTxd(RUNTIME_TEXTURE_DICTIONARY);
  }

  data = "https://placehold.co/512x512.png";

  // if (!textureHandle) {
  //   textureHandle = CreateRuntimeTexture(
  //     dictHandle,
  //     RUNTIME_TEXTURE_NAME,
  //     PARCHMENT_TEXTURE_DIMENSIONS,
  //     PARCHMENT_TEXTURE_DIMENSIONS
  //   );

  if (!duiHandle) {
    duiObject = CreateDui(
      data,
      PARCHMENT_TEXTURE_DIMENSIONS,
      PARCHMENT_TEXTURE_DIMENSIONS
    );
    duiHandle = GetDuiHandle(duiObject);
  } else {
    SetDuiUrl(duiObject, data);
  }

  if (!textureHandle) {
    textureHandle = CreateRuntimeTextureFromDuiHandle(
      dictHandle,
      DEFAULT_TEXTURE_NAME,
      duiHandle
    );
  }

  // if (!textureHandle) {
  //   textureHandle = CreateRuntimeTextureFromImage(
  //     dictHandle,
  //     RUNTIME_TEXTURE_NAME,
  //     data
  //   );

  //   console.log("texture", textureHandle);
  // } else {
  //   const result = SetRuntimeTextureImage(textureHandle, data);
  // }

  console.log(
    "w",
    GetRuntimeTextureWidth(textureHandle),
    "h",
    GetRuntimeTextureHeight(textureHandle)
  );

  // CommitRuntimeTexture(textureHandle);

  const startTime = Date.now();
  const tick = setTick(() => {
    const elapsedTime = Date.now() - startTime;
    if (HasStreamedTextureDictLoaded(RUNTIME_TEXTURE_DICTIONARY)) {
      console.log("Runtime dict loaded!");

      AddReplaceTexture(
        DEFAULT_TEXTURE_DICTIONARY,
        DEFAULT_TEXTURE_NAME,
        RUNTIME_TEXTURE_DICTIONARY,
        DEFAULT_TEXTURE_NAME
      );

      clearTick(tick);
    }
    if (elapsedTime > 20000) {
      console.log("Gave up after 20 seconds!");

      return clearTick(tick);
    }
  });

  // startAnim(parchmentEmotes.parchment);

  // TODO RemoveReplaceTexture

  cb({});
});

const parchmentEmotes: { [key: string]: AnimOptions } = {
  parchment: {
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
  },
};

// Register parchment emotes with animation resource

for (const key in parchmentEmotes) {
  if (Object.prototype.hasOwnProperty.call(parchmentEmotes, key)) {
    addEmote(key, parchmentEmotes[key]);
  }
}

setTick(() => {
  if (IsControlJustPressed(0, 172)) {
    show();
  }
});
