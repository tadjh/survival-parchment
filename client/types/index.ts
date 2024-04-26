import { SURVIVAL_PARCHMENT_VISIBILITY } from "../config";

export type Args = string[];

export type NUICallback = ({}: { [key: string]: string | number }) => void;

export type NUIMessage = {
  action: typeof SURVIVAL_PARCHMENT_VISIBILITY;
  data: boolean;
};
