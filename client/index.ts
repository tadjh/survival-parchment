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
let textureHandle = 0;
let duiObject = 0;
let duiHandle = "";
let isAnim = false;

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

on("__cfx_nui:sendTexture", async (url: string, cb: NUICallback) => {
  SetNuiFocus(false, false);
  SendReactMessage({ action: "setIsVisible", payload: false });

  cb({});

  if (url) {
    isAnim = startAnim(parchmentEmotes.parchment);

    console.log(url);

    try {
      const result = await replaceTextureWithBase64(url);
      console.log(result);
      // if (result) {
      //
      // }
    } catch (error) {
      throw new Error("Failed to replace texture");
    }
  }
  // TODO ? RemoveReplaceTexture()
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

function replaceTextureWithURL(data: string) {
  if (!dictHandle) {
    dictHandle = CreateRuntimeTxd(RUNTIME_TEXTURE_DICTIONARY);
  }

  if (!duiObject) {
    duiObject = CreateDui(
      data,
      RUNTIME_TEXTURE_DIMENSIONS,
      RUNTIME_TEXTURE_DIMENSIONS
    );
  } else {
    SetDuiUrl(duiObject, data);
  }

  if (!duiHandle) {
    duiHandle = GetDuiHandle(duiObject);
  }

  if (!textureHandle) {
    textureHandle = CreateRuntimeTextureFromDuiHandle(
      dictHandle,
      RUNTIME_TEXTURE_NAME,
      duiHandle
    );
  }

  console.log(
    "w",
    GetRuntimeTextureWidth(textureHandle),
    "h",
    GetRuntimeTextureHeight(textureHandle)
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

// TODO this one doesn't seem to work
function replaceTextureWithBase64(data: string) {
  // data =
  //   "data:image/png;base64,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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABK/X+HgVOqGQPZEgAAAABJRU5ErkJggg==";

  if (!dictHandle) {
    dictHandle = CreateRuntimeTxd(RUNTIME_TEXTURE_DICTIONARY);
  }

  // if (!textureHandle) {
  //   textureHandle = CreateRuntimeTexture(
  //     dictHandle,
  //     RUNTIME_TEXTURE_NAME,
  //     PARCHMENT_TEXTURE_DIMENSIONS,
  //     PARCHMENT_TEXTURE_DIMENSIONS
  //   );

  if (!textureHandle) {
    textureHandle = CreateRuntimeTextureFromImage(
      dictHandle,
      RUNTIME_TEXTURE_NAME,
      data
    );
  } else {
    const result = SetRuntimeTextureImage(textureHandle, data);
    console.log("loaded?", result);
  }

  console.log(
    "w",
    GetRuntimeTextureWidth(textureHandle),
    "h",
    GetRuntimeTextureHeight(textureHandle)
  );

  // CommitRuntimeTexture(textureHandle);

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
      if (elapsedTime > 20000) {
        reject("Runtime Texture Dictionary failed to load after 20 seconds.");
        return clearTick(tick);
      }
    });
  });
}
