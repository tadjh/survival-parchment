import * as Select from "@radix-ui/react-select";
import * as Label from "@radix-ui/react-label";
import React, { FormEvent, useState } from "react";
import WebFont from "webfontloader";
import { FaPencil, FaChevronDown, FaChevronUp, FaCheck } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { FontSlug, TextureOptions } from "../types";
import { MAX_STRING_LENGTH, fontConfig, imageConfig } from "../config";
import { fetchNui } from "../utils/fetchNui";
import { SelectItemProps } from "@radix-ui/react-select";

type ErrorType =
  | "ERROR_NO_TEXT_ENTERED"
  | "ERROR_NO_FONT_SELECTED"
  | "WARNING_TEXT_MAX_LEGNTH";

interface FormDataProps {
  text: string;
  font: FontSlug | "";
  remainder: number;
  errors: { [key in ErrorType]: boolean };
}

export default function Form() {
  const [formData, setFormData] = useState<FormDataProps>({
    text: "",
    font: "",
    remainder: MAX_STRING_LENGTH,
    errors: {
      ERROR_NO_TEXT_ENTERED: false,
      WARNING_TEXT_MAX_LEGNTH: false,
      ERROR_NO_FONT_SELECTED: false,
    },
  });

  function handleName(event: React.ChangeEvent<HTMLInputElement>) {
    let nextText = event.target.value;
    let nextErrors = { ...formData.errors, WARNING_TEXT_MAX_LEGNTH: false };

    if (formData.errors.ERROR_NO_TEXT_ENTERED && nextText.length > 0) {
      nextErrors.ERROR_NO_TEXT_ENTERED = false;
    }

    if (nextText.length >= MAX_STRING_LENGTH) {
      nextText = event.target.value.substring(0, MAX_STRING_LENGTH);
      nextErrors.WARNING_TEXT_MAX_LEGNTH = true;
    }

    return setFormData((prevState) => {
      return {
        ...prevState,
        text: nextText,
        remainder: MAX_STRING_LENGTH - nextText.length,
        errors: { ...nextErrors },
      };
    });
  }

  function handleSelect(value: FontSlug | "") {
    let nextErrors = { ...formData.errors, ERROR_NO_FONT_SELECTED: false };

    return setFormData((prevState) => {
      return { ...prevState, font: value, errors: { ...nextErrors } };
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let preventSubmit = false;
    let nextErrors = { ...formData.errors };

    if (formData.text === "") {
      nextErrors.ERROR_NO_TEXT_ENTERED = true;
      preventSubmit = true;
    }

    if (formData.font === "") {
      nextErrors.ERROR_NO_FONT_SELECTED = true;
      preventSubmit = true;
    }

    if (preventSubmit) {
      return setFormData((prevState) => {
        return {
          ...prevState,
          errors: { ...nextErrors },
        };
      });
    }

    if (formData.font === "") return;

    const textureConfig = {
      font: encodeURIComponent(fontConfig[formData.font].name),
      text: encodeURIComponent(formData.text),
      fontColor: imageConfig.fontColor,
      fontSize: fontConfig[formData.font].size,
      width: imageConfig.width,
      height: imageConfig.height,
      offsetX: imageConfig.offsetX + fontConfig[formData.font].offsetX,
      offsetY: imageConfig.offsetY + fontConfig[formData.font].offsetY,
      anchor: imageConfig.anchor,
    };

    try {
      const data = await createTexture(textureConfig);
      return fetchNui("returnTexture", data);
    } catch (error) {
      console.error(error);
      throw new Error("Fetch request failed...");
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <fieldset className="flex flex-row gap-3">
        <div className="flex aspect-square items-center justify-center bg-gradient-to-b from-slate-500/25 via-slate-500/75 to-slate-500/25 p-6 shadow">
          <FaPencil className="h-7 w-7 text-teal-300 drop-shadow-[0_3px_3px_rgba(110,231,183,0.5)]" />
        </div>
        <div
          className={twMerge(
            "flex w-full flex-col bg-gradient-to-b from-slate-500/25 via-slate-500/75 to-slate-500/25 p-3 shadow",
            formData.errors.ERROR_NO_TEXT_ENTERED &&
              "outline outline-2 outline-offset-2 outline-red-300"
          )}
        >
          <Label.Root className="relative font-semibold" htmlFor="playerName">
            Name:
            {formData.errors.ERROR_NO_TEXT_ENTERED ? (
              <span className="absolute right-0 text-rose-300">
                Please enter a name!
              </span>
            ) : (
              <span
                className={twMerge(
                  "absolute right-0",
                  formData.errors.WARNING_TEXT_MAX_LEGNTH && "text-rose-300"
                )}
              >
                {formData.errors.WARNING_TEXT_MAX_LEGNTH
                  ? "Out of characters"
                  : `(${formData.remainder} remaining)`}
              </span>
            )}
          </Label.Root>
          <input
            type="text"
            name="playerName"
            placeholder="J. Doe"
            className="bg-transparent py-0.5 outline-none transition-colors hover:bg-slate-500/25 focus:shadow-[0_0_0_2px] focus:shadow-teal-300"
            onChange={handleName}
            value={formData.text}
            maxLength={MAX_STRING_LENGTH}
          />
        </div>
      </fieldset>
      <fieldset
        className={twMerge(
          "flex w-full flex-col gap-3 bg-gradient-to-b from-slate-500/25 via-slate-500/75 to-slate-500/25 p-3 shadow",
          formData.errors.ERROR_NO_FONT_SELECTED &&
            "outline outline-2 outline-offset-2 outline-red-300"
        )}
      >
        <Label.Root className="relative font-semibold" htmlFor="font">
          Font
          {formData.errors.ERROR_NO_FONT_SELECTED && (
            <span className="absolute right-0 text-rose-300">
              Please select a font!
            </span>
          )}
        </Label.Root>
        <Select.Root
          name="font"
          value={formData.font}
          onValueChange={handleSelect}
          required
        >
          <Select.Trigger
            className={twMerge(
              "relative inline-flex h-9 cursor-pointer items-center justify-between gap-1 bg-transparent bg-gradient-to-r from-teal-600/25 via-teal-600/50 to-teal-600/25 px-3 leading-none shadow outline-none transition-colors hover:from-teal-600/50 hover:via-teal-600/75 hover:to-teal-600/50 focus:shadow-[0_0_0_2px] focus:shadow-teal-300",
              formData.font !== "" && "[&>span]:indent-[-9999px]"
            )}
            aria-label="Font"
          >
            <Select.Value placeholder="Select a font…" />
            <Select.Icon className="text-white">
              <FaChevronDown />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="-translate-y-1 translate-x-2 overflow-hidden rounded-lg bg-gradient-to-b from-cyan-800 to-cyan-900 py-3 shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
              <Select.ScrollUpButton className="flex h-7 cursor-default items-center justify-center bg-teal-700/75 text-teal-300 transition-colors hover:bg-teal-700 hover:text-white">
                <FaChevronUp />
              </Select.ScrollUpButton>
              <Select.Viewport className="p-1">
                <Select.Group>
                  <Select.Label className="px-6 font-semibold leading-6 text-white/50">
                    Fonts
                  </Select.Label>
                  <Select.Separator className="m-1 h-[1px] bg-teal-500/50" />
                  <SelectItem
                    value="coveredByYourGrace"
                    className="indent-[-9999px]"
                  >
                    <div
                      style={{
                        backgroundImage:
                          "url(./public/img/parchment_fonts_512x512.png)",
                      }}
                      className="absolute left-6 top-0 my-1 h-7 w-11/12 overflow-hidden bg-[length:44%] bg-[0%_0%] bg-no-repeat"
                    />
                    Covered By Your Grace
                  </SelectItem>
                  <SelectItem value="indieFlower" className="indent-[-9999px]">
                    <div
                      style={{
                        backgroundImage:
                          "url(./public/img/parchment_fonts_512x512.png)",
                      }}
                      className="absolute left-6 top-0 my-1 h-7 w-11/12 overflow-hidden bg-[length:44%] bg-[0%_15%] bg-no-repeat"
                    />
                    Indie Flower
                  </SelectItem>
                  <SelectItem
                    value="justMeAgainDownHere"
                    className="indent-[-9999px]"
                  >
                    <div
                      style={{
                        backgroundImage:
                          "url(./public/img/parchment_fonts_512x512.png)",
                      }}
                      className="absolute left-6 top-0 my-1 h-7 w-11/12 overflow-hidden bg-[length:44%] bg-[0%_33%] bg-no-repeat"
                    />
                    Just Me Again Down Here
                  </SelectItem>
                  <SelectItem
                    value="permanentMarker"
                    className="indent-[-9999px]"
                  >
                    <div
                      style={{
                        backgroundImage:
                          "url(./public/img/parchment_fonts_512x512.png)",
                      }}
                      className="absolute left-6 top-0 my-1 h-7 w-11/12 overflow-hidden bg-[length:44%] bg-[0%_50%] bg-no-repeat"
                    />
                    Permanent Marker
                  </SelectItem>
                  <SelectItem value="reenieBeanie" className="indent-[-9999px]">
                    <div
                      style={{
                        backgroundImage:
                          "url(./public/img/parchment_fonts_512x512.png)",
                      }}
                      className="absolute left-6 top-0 my-1 h-7 w-11/12 overflow-hidden bg-[length:44%] bg-[0%_66.5%] bg-no-repeat"
                    />
                    Reenie Beanie
                  </SelectItem>
                  <SelectItem value="rockSalt" className="indent-[-9999px]">
                    <div
                      style={{
                        backgroundImage:
                          "url(./public/img/parchment_fonts_512x512.png)",
                      }}
                      className="absolute left-6 top-0 my-1 h-7 w-11/12 overflow-hidden bg-[length:44%] bg-[0%_83%] bg-no-repeat"
                    />
                    Rock Salt
                  </SelectItem>
                  <SelectItem
                    value="walterTurncoat"
                    className="indent-[-9999px]"
                  >
                    <div
                      style={{
                        backgroundImage:
                          "url(./public/img/parchment_fonts_512x512.png)",
                      }}
                      className="absolute left-6 top-0 my-1 h-7 w-11/12 overflow-hidden bg-[length:44%] bg-[0%_100%] bg-no-repeat"
                    />
                    Watler Turncoat
                  </SelectItem>
                </Select.Group>
              </Select.Viewport>
              <Select.ScrollDownButton className="flex h-7 cursor-default items-center justify-center bg-teal-700/75 text-teal-300 transition-colors hover:bg-teal-700 hover:text-white">
                <FaChevronDown />
              </Select.ScrollDownButton>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </fieldset>
      <input
        type="submit"
        className="w-full cursor-pointer rounded-sm bg-teal-700/75 p-3 text-center text-sm font-semibold text-teal-300 transition-colors hover:bg-teal-700 hover:text-white"
        value="Submit"
      />
    </form>
  );
}

const SelectItem = React.forwardRef<
  HTMLDivElement,
  SelectItemProps & React.RefAttributes<HTMLDivElement>
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <Select.Item
      className={twMerge(
        "relative flex h-7 cursor-pointer select-none items-center rounded pl-6 pr-9 leading-none text-white data-[disabled]:pointer-events-none data-[highlighted]:bg-emerald-500/50 data-[disabled]:text-white/50 data-[highlighted]:text-white data-[highlighted]:outline-none",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute left-0 inline-flex w-6 items-center justify-center">
        <FaCheck />
      </Select.ItemIndicator>
    </Select.Item>
  );
});

async function createTexture({
  font,
  text,
  fontColor,
  fontSize,
  width,
  height,
  offsetX,
  offsetY,
  anchor,
}: TextureOptions) {
  return new Promise<string>((resolve, reject) => {
    const canvas = document.createElement("canvas");
    // canvas.style.width = width + "px";
    // canvas.style.height = height + "px";

    // TODO Could this scalar just be a generic variable
    // or is setting this defined global meaningful to the
    // canvas rendering output in some way? Doubtful tbh.
    window.devicePixelRatio = 0.5;

    const scaledWidth = width * window.devicePixelRatio;
    const scaledHeight = height * window.devicePixelRatio;
    const scaledFontSize = fontSize * window.devicePixelRatio;

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    const ctx = canvas.getContext("2d");

    const textDisplay = decodeURIComponent(text);
    const fontDisplayName = decodeURIComponent(font);

    if (!ctx) return;

    WebFont.load({
      google: {
        families: [fontDisplayName],
      },
      active: () => drawText(scaledFontSize),
    });

    function drawText(retinaFontSize: number, recursions = 0) {
      if (!ctx) return;

      if (recursions > 3) ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.font = retinaFontSize + "px " + fontDisplayName;
      ctx.fillStyle = "#" + fontColor;

      let textAlign: CanvasTextAlign = "start";
      let textBaseline: CanvasTextBaseline = "middle";

      switch (anchor[0]) {
        case "r":
          textAlign = "end";
          break;
        case "l":
          textAlign = "start";
          break;
        case "m":
        default:
          textAlign = "center";
          break;
      }

      switch (anchor[1]) {
        case "a":
          textBaseline = "top";
          break;
        case "t":
          textBaseline = "hanging";
          break;
        case "b":
          textBaseline = "ideographic";
          break;
        case "d":
          textBaseline = "bottom";
          break;
        case "s":
          textBaseline = "alphabetic";
          break;
        case "m":
        default:
          textBaseline = "middle";
          break;
      }

      ctx.textAlign = textAlign;
      ctx.textBaseline = textBaseline;

      const { width: textWidth } = ctx.measureText(textDisplay);

      const ratio = (scaledWidth * 0.78) / textWidth;

      if (ratio < 1) {
        return drawText(retinaFontSize * ratio, recursions + 1);
      }

      ctx.fillText(
        textDisplay,
        offsetX * window.devicePixelRatio,
        offsetY * window.devicePixelRatio
      );

      return resolve(canvas.toDataURL());
    }

    const timeout = setTimeout(() => {
      reject("Max execution time reached in createTexture");
      clearTimeout(timeout);
    }, 10000);
  });
}
