import * as THREE from "three";
import { Simulation } from "./simulation";
import { getGradient, Gradient } from "./color";
import { Renderer } from "./renderer";
import chroma from "chroma-js";

const createCamera = () => {
  const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
  camera.up = new THREE.Vector3(0, 0, 1);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.translateX(50);
  camera.translateY(50);
  camera.translateZ(50);

  return camera;
};

const createScene = ({ backgroundColor }: { backgroundColor: THREE.ColorRepresentation }) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(backgroundColor);
  return scene;
};

export interface GlParticlesConstructorProps {
  sphereRadius: number;
  particleSize: number;
  backgroundColor: THREE.ColorRepresentation;
  gradient: Gradient;
}

const bGradient = getGradient("ice");

/**
 * The GlParticles class is responsible for representing and managing a
 * collection of particles in a 3D space, rendered using WebGL.
 */
export class GlParticles {
  private readonly sphereRadius: number;
  private readonly particleSize: number;
  private gradient: Gradient;
  private geometry = new THREE.BufferGeometry();
  private vertices: number[] = [];
  private colors: number[] = [];
  private material: THREE.PointsMaterial;
  private sprite = new THREE.TextureLoader().load("textures/sprites/disc.png");
  private points: THREE.Points;
  camera: THREE.Camera;
  scene: THREE.Scene;

  constructor({ backgroundColor, gradient, sphereRadius, particleSize }: GlParticlesConstructorProps) {
    this.camera = createCamera();
    this.scene = createScene({ backgroundColor });
    this.gradient = gradient;
    this.particleSize = particleSize;
    this.sphereRadius = sphereRadius;
  }

  init({ simulation }: { simulation: Simulation }) {
    simulation.particles.forEach((particle) => {
      const x = this.sphereRadius * Math.sin(particle.position.phi) * Math.cos(particle.position.theta);
      const y = this.sphereRadius * Math.sin(particle.position.phi) * Math.sin(particle.position.theta);
      const z = this.sphereRadius * Math.cos(particle.position.phi);

      this.vertices.push(x, y, z);

      const color = new THREE.Color();
      color.setHSL(0, 0, 0);

      this.colors.push(color.r, color.g, color.b);
    });

    this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.vertices, 3));
    this.geometry.setAttribute("color", new THREE.Float32BufferAttribute(this.colors, 3));

    this.material = new THREE.PointsMaterial({
      size: this.particleSize,
      vertexColors: true, // Enable vertex colors
      map: this.sprite,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  addToRenderer(renderer: Renderer) {
    renderer.add({ scene: this.scene, camera: this.camera }, { addControls: true });
  }

  update(simulation: Simulation, step: number) {
    const positions = this.points.geometry.attributes.position.array;
    const colors = this.points.geometry.attributes.color.array;

    simulation.particles.forEach((particle, index) => {
      positions[index * 3] = this.sphereRadius * Math.sin(particle.position.phi) * Math.cos(particle.position.theta);
      positions[index * 3 + 1] =
        this.sphereRadius * Math.sin(particle.position.phi) * Math.sin(particle.position.theta);
      positions[index * 3 + 2] = this.sphereRadius * Math.cos(particle.position.phi);

      // Map the speed to a color (red-ish for higher speeds)
      const velocityMagnitude = Math.sqrt(
        particle.velocity.x * particle.velocity.x +
          particle.velocity.y * particle.velocity.y +
          particle.velocity.z * particle.velocity.z
      );
      const color = this.gradient(velocityMagnitude / 0.4).gl();
      const bColor = bGradient(velocityMagnitude / 0.4).gl();

      const x = positions[index * 3];
      const y = positions[index * 3 + 1];
      const z = positions[index * 3 + 2];

      const threshold = x + 3 * Math.cos(y / 2);
      if (threshold < -10) {
        colors[index * 3] = color[0];
        colors[index * 3 + 1] = color[1];
        colors[index * 3 + 2] = color[2];
      } else if (threshold < 0) {
        const mixColor = chroma
          .mix(this.gradient(velocityMagnitude / 0.4), bGradient(velocityMagnitude / 0.4), (threshold + 10) / 10)
          .gl();
        colors[index * 3] = mixColor[0];
        colors[index * 3 + 1] = mixColor[1];
        colors[index * 3 + 2] = mixColor[2];
      } else {
        colors[index * 3] = bColor[0];
        colors[index * 3 + 1] = bColor[1];
        colors[index * 3 + 2] = bColor[2];
      }
    });

    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
  }
}
