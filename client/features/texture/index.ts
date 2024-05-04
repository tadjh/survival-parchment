import {
  RUNTIME_TEXTURE_DICTIONARY,
  RUNTIME_TEXTURE_PREFIX,
  DEFAULT_TEXTURE_DICTIONARY,
  DEFAULT_TEXTURE_NAME,
  MAX_EXECUTION_TIME,
  RUNTIME_TEXTURE_DIMENSIONS,
} from "../../config";

let dictHandle = 0;
let duiObject = 0;
let duiHandle = "";
const textureHandles: number[] = [];

export function replaceTextureWithBase64(url: string) {
  if (!dictHandle) {
    dictHandle = CreateRuntimeTxd(RUNTIME_TEXTURE_DICTIONARY);
  }

  const nextTextureNumber = textureHandles.length + 1;

  const nextTexture = CreateRuntimeTextureFromImage(
    dictHandle,
    `${RUNTIME_TEXTURE_PREFIX}${nextTextureNumber}`,
    url
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
          `${RUNTIME_TEXTURE_PREFIX}${nextTextureNumber}`
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
    RUNTIME_TEXTURE_PREFIX,
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
          RUNTIME_TEXTURE_PREFIX
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
