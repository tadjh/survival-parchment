import * as Select from "@radix-ui/react-select";
import * as Label from "@radix-ui/react-label";
import { SelectItemProps } from "@radix-ui/react-select";
import React, { FormEvent, useState } from "react";
import { FaPencil, FaChevronDown, FaChevronUp, FaCheck } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import {
  IMAGE_API_URL,
  MAX_STRING_LENGTH,
  fontConfig,
  imageConfig,
} from "../config";

type ErrorType =
  | "ERROR_NO_TEXT_ENTERED"
  | "ERROR_NO_FONT_SELECTED"
  | "WARNING_TEXT_MAX_LEGNTH";

interface FormDataProps {
  text: string;
  font: FontType | "";
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

  function handleSelect(value: FontType | "") {
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

    try {
      const font = fontConfig[formData.font];
      const response = await fetch(IMAGE_API_URL, {
        method: "POST",
        body: JSON.stringify({
          font: font.name,
          text: formData.text,
          font_colour: imageConfig.fontColor,
          font_size: font.size,
          offset_x: imageConfig.offsetX + font.offsetX,
          offset_y: imageConfig.offsetY + font.offsetY,
          width: imageConfig.width,
          height: imageConfig.height,
        }),
      });
      const data = await response.json();
      console.log(data);
    } catch {
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
              <Select.ScrollUpButton className="flex h-6 cursor-default items-center justify-center bg-teal-700/75 text-teal-300 transition-colors hover:bg-teal-700 hover:text-white">
                <FaChevronUp />
              </Select.ScrollUpButton>
              <Select.Viewport className="p-1">
                <Select.Group>
                  <Select.Label className="px-6 font-semibold leading-6 text-white/50">
                    Fonts
                  </Select.Label>
                  <Select.Separator className="m-1 h-[1px] bg-teal-500/50" />
                  <SelectItem
                    value="coverdByYourGrace"
                    className="indent-[-9999px]"
                  >
                    <div
                      style={{
                        background:
                          "url(./public/img/parchment_fonts_512x512.png) 0% 0% / 44% no-repeat",
                      }}
                      className="absolute left-6 top-0 my-1 h-7 w-11/12 overflow-hidden"
                    />
                    Covered By Your Grace
                  </SelectItem>
                  <SelectItem value="indieFlower" className="indent-[-9999px]">
                    <div
                      style={{
                        background:
                          "url(./public/img/parchment_fonts_512x512.png) 0% 15% / 44% no-repeat",
                      }}
                      className="absolute left-6 top-0 my-1 h-7 w-11/12 overflow-hidden"
                    />
                    Indie Flower
                  </SelectItem>
                  <SelectItem
                    value="justMeAgainDownHere"
                    className="indent-[-9999px]"
                  >
                    <div
                      style={{
                        background:
                          "url(./public/img/parchment_fonts_512x512.png) 0% 33% / 44% no-repeat",
                      }}
                      className="absolute left-6 top-0 my-1 h-7 w-11/12 overflow-hidden"
                    />
                    Just Me Again Down Here
                  </SelectItem>
                  <SelectItem
                    value="permanentMarker"
                    className="indent-[-9999px]"
                  >
                    <div
                      style={{
                        background:
                          "url(./public/img/parchment_fonts_512x512.png) 0% 50% / 44% no-repeat",
                      }}
                      className="absolute left-6 top-0 my-1 h-7 w-11/12 overflow-hidden"
                    />
                    Permanent Marker
                  </SelectItem>
                  <SelectItem value="reenieBeanie" className="indent-[-9999px]">
                    <div
                      style={{
                        background:
                          "url(./public/img/parchment_fonts_512x512.png) 0% 66.5% / 44% no-repeat",
                      }}
                      className="absolute left-6 top-0 my-1 h-7 w-11/12 overflow-hidden"
                    />
                    Reenie Beanie
                  </SelectItem>
                  <SelectItem value="rockSalt" className="indent-[-9999px]">
                    <div
                      style={{
                        background:
                          "url(./public/img/parchment_fonts_512x512.png) 0% 83% / 44% no-repeat",
                      }}
                      className="absolute left-6 top-0 my-1 h-7 w-11/12 overflow-hidden"
                    />
                    Rock Salt
                  </SelectItem>
                  <SelectItem
                    value="walterTurncoat"
                    className="indent-[-9999px]"
                  >
                    <div
                      style={{
                        background:
                          "url(./public/img/parchment_fonts_512x512.png) 0% 100% / 44% no-repeat",
                      }}
                      className="absolute left-6 top-0 my-1 h-7 w-11/12 overflow-hidden"
                    />
                    Watler Turncoat
                  </SelectItem>
                </Select.Group>
              </Select.Viewport>
              <Select.ScrollDownButton className="flex h-6 cursor-default items-center justify-center bg-teal-700/75 text-teal-300 transition-colors hover:bg-teal-700 hover:text-white">
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
