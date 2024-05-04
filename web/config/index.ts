import { Anchor, FontName, FontSlug } from "../types";

export const MAX_STRING_LENGTH = 70;

export const imageConfig: {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  fontColor: string;
  anchor: Anchor;
} = {
  height: 512,
  width: 512,
  offsetX: 256,
  offsetY: 256,
  fontColor: "252937",
  anchor: "mm",
};

export const fontConfig: {
  [key in FontSlug]: {
    name: FontName;
    size: number;
    offsetX: number;
    offsetY: number;
  };
} = {
  coveredByYourGrace: {
    name: "Covered By Your Grace",
    size: 82,
    offsetX: 0,
    offsetY: 4,
  },
  indieFlower: {
    name: "Indie Flower",
    size: 68,
    offsetX: 0,
    offsetY: 8,
  },
  justMeAgainDownHere: {
    name: "Just Me Again Down Here",
    size: 82,
    offsetX: 0,
    offsetY: 4,
  },
  permanentMarker: {
    name: "Permanent Marker",
    size: 68,
    offsetX: 0,
    offsetY: 0,
  },
  reenieBeanie: {
    name: "Reenie Beanie",
    size: 84,
    offsetX: 0,
    offsetY: 4,
  },
  rockSalt: { name: "Rock Salt", size: 54, offsetX: 0, offsetY: 8 },
  walterTurncoat: {
    name: "Walter Turncoat",
    size: 74,
    offsetX: 0,
    offsetY: 0,
  },
};
