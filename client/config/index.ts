import {
  AnimOptions,
  AnimFlags,
  PedBoneId,
} from "../lib/immersive-animations/types";

export const CURRENT_RESOURCE_NAME = GetCurrentResourceName();

export const DEFAULT_TEXTURE_DICTIONARY = "prop_survival_parchment";
export const DEFAULT_TEXTURE_PREFIX = "parchment_sign_";
export const RUNTIME_TEXTURE_DICTIONARY = "runtime_survival";
export const RUNTIME_TEXTURE_PREFIX = "parchment_sign_";
export const RUNTIME_TEXTURE_DIMENSIONS = 512;

export const MAX_EXECUTION_TIME = 20000;
export const MAX_THROTTLE_TIMEOUT = 60000;

export const parchmentEmotes = (
  queueId: number
): { [key: string]: AnimOptions } => {
  return {
    parchmentWrite: {
      dictionary: "missheistdockssetup1clipboard@base",
      name: "base",
      type: "single",
      flag:
        AnimFlags.AF_LOOPING + AnimFlags.AF_UPPERBODY + AnimFlags.AF_SECONDARY,
      prop: {
        model: `prop_survival_parchment${queueId === 0 ? "" : queueId + 1}`, // Models aren't 0 indexed >:-(
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
    parchmentHold: {
      dictionary: "amb@world_human_bum_freeway@male@base",
      name: "base",
      type: "single",
      flag:
        AnimFlags.AF_LOOPING + AnimFlags.AF_UPPERBODY + AnimFlags.AF_SECONDARY,
      prop: {
        model: `prop_survival_parchment${queueId === 0 ? "" : queueId + 1}`, // Models aren't 0 indexed >:-(
        bone: PedBoneId.SKEL_R_Finger20,
        pos: { x: 0.21, y: 0.16, z: 0.0 },
        rot: { x: 5.0, y: 5.0, z: 41.0 },
      },
      propTwo: {
        model: "prop_cs_marker_01",
        bone: PedBoneId.SKEL_R_Hand,
        pos: { x: 0.107, y: 0.044, z: -0.011 },
        rot: { x: -120.0, y: 0.0, z: 0.0 },
        debug: true,
      },
    },
  };
};

// export function registerEmotes() {
//   // Register parchment emotes with animation resource
//   for (const key in parchmentEmotes) {
//     if (Object.prototype.hasOwnProperty.call(parchmentEmotes, key)) {
//       addEmote(key, parchmentEmotes[key]);
//     }
//   }
// }
