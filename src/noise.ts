import { createNoise4D } from "simplex-noise";
import rnd from "./random";

export type NoiseFn = ReturnType<typeof getNoiseFn>;

interface Props {
  spatialResolution: number;
  temporalResolution: number;
}

export const getNoiseFn = ({ spatialResolution, temporalResolution }: Props) => {
  const randomFn = createNoise4D(rnd.random);

  return (x: number, y: number, z: number, t: number) => {
    /**
     * We interpret the noise value as an angle for the velocity vector. The noise generation function
     * returns a numeric value in the range [-1, 1] and we need to transform that into [-PI, PI] to offer
     * a full range of angles (in radians).
     *
     * Finally, the X component is the cosine of the angle and the Y component is its sine
     */
    const angle =
      randomFn(x * spatialResolution, y * spatialResolution, z * spatialResolution, t * temporalResolution) * Math.PI;

    return {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
  };
};
