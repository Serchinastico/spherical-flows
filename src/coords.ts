import { PolarCoordinates, Vector3D } from "./types";

export const fromPolarToCartesian = (coords: PolarCoordinates, radius: number): Vector3D => {
  const x = radius * Math.sin(coords.phi) * Math.cos(coords.theta);
  const y = radius * Math.sin(coords.phi) * Math.sin(coords.theta);
  const z = radius * Math.cos(coords.phi);

  return { x, y, z };
};

export const fromCartesianToPolar = (cart: { x: number; y: number; z: number }): PolarCoordinates => {
  const radius = Math.sqrt(cart.x * cart.x + cart.y * cart.y + cart.z * cart.z);

  return { theta: Math.atan2(cart.y, cart.x), phi: Math.acos(cart.z / radius) };
};
