export type Args = string[];

export type NUICallback = ({}: { [key: string]: string | number }) => void;

export type NUIMessage = {
  action: "setIsVisible";
  payload: boolean;
};

export enum AnimStates {
  NONE,
  WRITING_ON_PARCHMENT,
  PRESENTING_PARCHMENT,
  OTHER,
}
