import chroma from "chroma-js";

export type Gradient = ReturnType<typeof getGradient>;

const easeOutSine = (x: number) => {
  return Math.sin((x * Math.PI) / 2);
};

/**
 * Returns a chroma scale for the selected colors in CSV format.
 * I'm using this format because it's an easy way to load coolors
 * palettes.
 *
 * @param {string} colors
 * @see https://coolors.co/palettes/trending
 */
const getChromaScaleFromCSV = (colors: string) => {
  const colorsArray = colors.split(", ");

  const colorsDomain = [];
  for (let i = 0; i < colorsArray.length; i += 1) {
    colorsDomain.push(i / colorsArray.length);
  }

  return chroma
    .scale(colorsArray)
    .domain(colorsDomain.map((i) => easeOutSine(i)))
    .mode("lab");
};

export const getGradient = (colorPalette: string) => {
  switch (colorPalette) {
    case "black":
      return () => chroma("#000");
    case "magenta":
      return () => chroma("magenta");
    case "cyan":
      return () => chroma("cyan");
    case "yellow":
      return () => chroma("yellow");
    case "spectral":
      return chroma.scale("Spectral");
    case "forest":
      return getChromaScaleFromCSV("#386641, #6a994e, #a7c957, #f2e8cf, #bc4749");
    case "pastel":
      return getChromaScaleFromCSV("#264653, #2a9d8f, #e9c46a, #f4a261, #e76f51");
    case "fire":
      return getChromaScaleFromCSV(
        "#03071e, #370617, #6a040f, #9d0208, #d00000, #dc2f02, #e85d04, #f48c06, #faa307, #ffba08, #ffffff"
      );
    case "ice":
      return getChromaScaleFromCSV("#03045e, #023e8a, #0077b6, #0096c7, #00b4d8, #48cae4, #90e0ef, #ade8f4, #caf0f8");
    case "bicolor":
      return getChromaScaleFromCSV(
        "#ff6d00, #ff7900, #ff8500, #ff9100, #ff9e00, #240046, #3c096c, #5a189a, #7b2cbf, #9d4edd"
      );
  }
};
