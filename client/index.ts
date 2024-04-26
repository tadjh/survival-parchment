import { myRandomData } from "./MyOther.client";
import { CURRENT_RESOURCE_NAME, SURVIVAL_PARCHMENT_VISIBILITY } from "./config";
import { NUICallback } from "./types";
import { SendReactMessage } from "./utils";
import { debugPrint } from "./utils/debug";

on("onResourceStart", (resName: string) => {
  if (resName === CURRENT_RESOURCE_NAME) {
    console.log(myRandomData);
    console.log("TypeScript boilerplate started!");
  }
});

RegisterCommand(
  `${CURRENT_RESOURCE_NAME}:show`,
  function () {
    SetNuiFocus(true, true);
    SendReactMessage({ action: SURVIVAL_PARCHMENT_VISIBILITY, data: true });
  },
  false
);

RegisterCommand(
  `${CURRENT_RESOURCE_NAME}:hide`,
  function (_source: number, cb: NUICallback) {
    SetNuiFocus(false, false);
    cb({});
  },
  false
);

RegisterNuiCallbackType(`${CURRENT_RESOURCE_NAME}:getClientData`);

on(
  `__cfx_nui:${CURRENT_RESOURCE_NAME}:getClientData`,
  (data: unknown, cb: NUICallback) => {
    debugPrint("Data sent by React", JSON.stringify(data));

    const curCoords = GetEntityCoords(PlayerPedId(), true);

    cb({ x: curCoords[0], y: curCoords[1], z: curCoords[2] });
  }
);

