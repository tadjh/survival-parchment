export const MAX_STRING_LENGTH = 70;

export const IMAGE_API_URL = process.env.SP_IMAGE_API_URL || "";

export const imageConfig: {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  fontColor: string;
  anchor: "ma" | "mt" | "mm" | "ms" | "mb" | "md" | "ls" | "ms" | "rs";
} = {
  height: 512,
  width: 512,
  offsetX: 256,
  offsetY: 256,
  fontColor: "252937",
  anchor: "mm",
};

export const fontConfig: {
  [key in FontType]: {
    name: string;
    size: number;
    offsetX: number;
    offsetY: number;
  };
} = {
  coveredByYourGrace: {
    name: "Covered By Your Grace",
    size: 100,
    offsetX: 0,
    offsetY: 4,
  },
  indieFlower: {
    name: "Indie Flower",
    size: 86,
    offsetX: 0,
    offsetY: 8,
  },
  justMeAgainDownHere: {
    name: "Just Me Again Down Here",
    size: 116,
    offsetX: 0,
    offsetY: 12,
  },
  permanentMarker: {
    name: "Permanent Marker",
    size: 82,
    offsetX: 0,
    offsetY: 0,
  },
  reenieBeanie: {
    name: "Reenie Beanie",
    size: 100,
    offsetX: 0,
    offsetY: 5,
  },
  rockSalt: { name: "Rock Salt", size: 60, offsetX: 0, offsetY: 0 },
  walterTurncoat: {
    name: "Walter Turncoat",
    size: 72,
    offsetX: 0,
    offsetY: 0,
  },
};
