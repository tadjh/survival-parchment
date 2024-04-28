import { CURRENT_RESOURCE_NAME, SURVIVAL_PARCHMENT_VISIBILITY } from "./config";
import { addEmote } from "./lib/immersive-animations";
import {
  AnimFlags,
  AnimOptions,
  PedBoneId,
} from "./lib/immersive-animations/types";
import { NUICallback } from "./types";
import { SendReactMessage } from "./utils";

RegisterCommand(
  `${CURRENT_RESOURCE_NAME}:show`,
  function () {
    SetNuiFocus(true, true);
    SendReactMessage({ action: "setVisible", data: true });
  },
  false
);

RegisterNuiCallbackType("hideFrame");

on("__cfx_nui:hideFrame", (data: unknown, cb: NUICallback) => {
  SetNuiFocus(false, false);
  SendReactMessage({ action: "setVisible", data: false });
  cb({});
});

RegisterNuiCallbackType("getClientData");

on("__cfx_nui:getClientData", (data: unknown, cb: NUICallback) => {
  console.log("Data sent by React", JSON.stringify(data));

  const curCoords = GetEntityCoords(PlayerPedId(), true);

  cb({ x: curCoords[0], y: curCoords[1], z: curCoords[2] });
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

// Register torch emotes with animation resource

for (const key in parchmentEmotes) {
  if (Object.prototype.hasOwnProperty.call(parchmentEmotes, key)) {
    addEmote(key, parchmentEmotes[key]);
  }
}

