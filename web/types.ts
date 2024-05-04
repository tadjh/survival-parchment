export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type FontSlug =
  | "coveredByYourGrace"
  | "indieFlower"
  | "justMeAgainDownHere"
  | "permanentMarker"
  | "reenieBeanie"
  | "rockSalt"
  | "walterTurncoat";

export type FontName =
  | "Covered By Your Grace"
  | "Indie Flower"
  | "Just Me Again Down Here"
  | "Permanent Marker"
  | "Reenie Beanie"
  | "Rock Salt"
  | "Walter Turncoat";

export type Anchor =
  | "ma"
  | "mt"
  | "mm"
  | "ms"
  | "mb"
  | "md"
  | "ls"
  | "ms"
  | "rs";

export interface TextureOptions {
  font: string;
  text: string;
  fontColor: string;
  fontSize: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  anchor: Anchor;
  noBg?: boolean;
}
