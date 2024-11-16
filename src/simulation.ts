import { GlParticles, GlParticlesConstructorProps } from "./glParticles";
import { Renderer } from "./renderer";
import { getNoiseFn, NoiseFn } from "./noise";
import { Gradient } from "./color";
import chroma from "chroma-js";
import { Particle, Vector3D } from "./types";
import { fromPolarToCartesian } from "./coords";

const FRICTION = 0.02;
const SPRING_STRENGTH = 0.0001;
const NOISE_STRENGTH = 0.01;
const STARTING_VELOCITY_STRENGTH = 0.0;
const GRADIENT_COLOR_MULTIPLIER = 2.5;

const createParticle = (radius: number): Particle => {
  // Generate random position on sphere using uniform sampling
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);

  const position = fromPolarToCartesian({ theta, phi }, radius);

  // Generate random velocity in tangent plane
  const velocityX = STARTING_VELOCITY_STRENGTH * (Math.random() * 0.001 - 0.0005);
  const velocityY = STARTING_VELOCITY_STRENGTH * (Math.random() * 0.001 - 0.0005);
  const velocityZ = STARTING_VELOCITY_STRENGTH * (Math.random() * 0.001 - 0.0005);

  return {
    startingPosition: position,
    position: position,
    velocity: { x: velocityX, y: velocityY, z: velocityZ },
    color: chroma("#000"),
  };
};

interface SimulationConstructorProps extends GlParticlesConstructorProps {
  noiseSpatialResolution: number;
  noiseTemporalResolution: number;
  numberOfParticles: number;
  gradient: Gradient;
}

/**
 * Class representing a simulation of particles on the surface of a sphere.
 * They move according to their own velocity, a vector field generated with perlin noise and a pull
 * for their original positions following spring physics.
 */
export class Simulation {
  private readonly glParticles: GlParticles;
  private readonly sphereRadius: number;
  private readonly vectorField: NoiseFn;
  private readonly gradient: Gradient;
  particles: Particle[] = [];

  constructor(props: SimulationConstructorProps) {
    this.vectorField = getNoiseFn({
      spatialResolution: props.noiseSpatialResolution,
      temporalResolution: props.noiseTemporalResolution,
    });
    this.sphereRadius = props.sphereRadius;
    this.gradient = props.gradient;
    this.particles = new Array(props.numberOfParticles).fill(0).map(() => createParticle(props.sphereRadius));
    this.glParticles = new GlParticles(props);
  }

  init() {
    this.glParticles.init({ simulation: this });
  }

  addToRenderer(renderer: Renderer) {
    this.glParticles.addToRenderer(renderer);
  }

  getNoise({ position, step }: { position: Vector3D; step: number }) {
    return this.vectorField(position.x, position.y, position.z, step);
  }

  update({ deltaTime, step }: { deltaTime: number; step: number }) {
    this.particles.forEach((particle) => {
      const cartesianPosition = particle.position;

      const noise = this.getNoise({ position: particle.position, step });

      const springVelocity: Vector3D = {
        x: particle.startingPosition.x - particle.position.x,
        y: particle.startingPosition.y - particle.position.y,
        z: particle.startingPosition.z - particle.position.z,
      };

      particle.velocity.x += SPRING_STRENGTH * springVelocity.x;
      particle.velocity.y += SPRING_STRENGTH * springVelocity.y;
      particle.velocity.z += SPRING_STRENGTH * springVelocity.z;
      // particle.velocity.x += SPRING_STRENGTH * springVelocity.x /* * NOISE_STRENGTH * noise.x */ * deltaTime;
      // particle.velocity.y += SPRING_STRENGTH * springVelocity.y /* * NOISE_STRENGTH * noise.y */ * deltaTime;
      // particle.velocity.z += SPRING_STRENGTH * springVelocity.z * deltaTime;

      particle.position.x += particle.velocity.x * deltaTime;
      particle.position.y += particle.velocity.y * deltaTime;
      particle.position.z += particle.velocity.z * deltaTime;

      const newRadialDistance = Math.sqrt(
        particle.position.x ** 2 + particle.position.y ** 2 + particle.position.z ** 2
      );

      // Normalize to move it back to the Earth's surface
      // particle.position.x *= this.sphereRadius / newRadialDistance;
      // particle.position.y *= this.sphereRadius / newRadialDistance;
      // particle.position.z *= this.sphereRadius / newRadialDistance;

      // Now also update the velocity vector to reflect it being on the sphere
      const surfaceNormal = {
        x: particle.position.x / this.sphereRadius,
        y: particle.position.y / this.sphereRadius,
        z: particle.position.z / this.sphereRadius,
      };
      const dotProduct =
        particle.velocity.x * surfaceNormal.x +
        particle.velocity.y * surfaceNormal.y +
        particle.velocity.z * surfaceNormal.z;

      // Subtract the normal component from the current velocity to keep it tangent to the sphere
      // particle.velocity = {
      //   x: particle.velocity.x - dotProduct * surfaceNormal.x,
      //   y: particle.velocity.y - dotProduct * surfaceNormal.y,
      //   z: particle.velocity.z - dotProduct * surfaceNormal.z,
      // };

      particle.velocity.x *= 1 - FRICTION;
      particle.velocity.y *= 1 - FRICTION;
      particle.velocity.z *= 1 - FRICTION;

      const velocityMagnitude = Math.sqrt(
        particle.velocity.x * particle.velocity.x +
          particle.velocity.y * particle.velocity.y +
          particle.velocity.z * particle.velocity.z
      );

      particle.color = this.gradient(velocityMagnitude * GRADIENT_COLOR_MULTIPLIER);

      if (velocityMagnitude < 0.001) {
        const newParticle = createParticle(this.sphereRadius);
        particle.position = newParticle.position;
        particle.velocity = newParticle.velocity;
      }
    });

    this.glParticles.update(this, step);
  }
}
