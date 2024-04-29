export type Args = string[];

export type NUICallback = ({}: { [key: string]: string | number }) => void;

export type NUIMessage = {
  action: "setIsVisible";
  payload: boolean;
};
