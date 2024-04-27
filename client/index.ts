import { CURRENT_RESOURCE_NAME, SURVIVAL_PARCHMENT_VISIBILITY } from "./config";
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

