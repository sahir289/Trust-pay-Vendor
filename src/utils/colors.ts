/* eslint-disable no-undef */
import { toRGB } from "./helper";
import tailwindColors from "tailwindcss/colors";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "tailwind-config";
import { flatten } from "flat";
import { DotNestedKeys } from "@/types/utils";

const twConfig = resolveConfig(tailwindConfig);
const colors = twConfig.theme?.colors;

type DefaultColors = typeof tailwindColors;

/** Extended colors */
interface Colors extends DefaultColors {
  theme: {
    1: string;
    2: string;
  };
  primary: string;
  secondary: string;
  success: string;
  info: string;
  warning: string;
  pending: string;
  danger: string;
  light: string;
  dark: string;
  darkmode: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

/** Get a value from Tailwind colors by flatten index, if not available the value will be taken from the CSS variable with (--color-) prefix. */
const getColor = (colorKey: DotNestedKeys<Colors>, opacity: number = 1) => {
  const flattenColors = flatten<
    typeof colors,
    {
      [key: string]: string;
    }
  >(colors);

  const colorValue = flattenColors[colorKey];

  if (colorValue && colorValue.search("var") === -1) {
    // Ensure colorValue is a valid string before passing to toRGB
    return `rgb(${toRGB(colorValue)} / ${opacity})`;
  } else if (colorValue) {
    const cssVariableName = `--color-${colorValue.split("--color-")[1]?.split(")")[0]}`;
    return `rgb(${getComputedStyle(document.body).getPropertyValue(cssVariableName)} / ${opacity})`;
  }

  return 'defaultColor'; // Or any fallback value you prefer
};

export { getColor };
