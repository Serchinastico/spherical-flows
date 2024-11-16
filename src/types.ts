import { Color } from "chroma-js";

export interface PolarCoordinates {
  theta: number;
  phi: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Particle {
  // Original position of the particle in polar coordinates
  startingPosition: Vector3D;
  // Position of the particle in polar coordinates
  position: Vector3D;
  // Velocity in local tangent plane (Cartesian coordinates)
  velocity: Vector3D;
  color: Color;
}
