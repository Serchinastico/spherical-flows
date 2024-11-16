import * as THREE from "three";
import { Simulation } from "./simulation";
import { Renderer } from "./renderer";

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
}

/**
 * The GlParticles class is responsible for representing and managing a
 * collection of particles in a 3D space, rendered using WebGL.
 */
export class GlParticles {
  private readonly sphereRadius: number;
  private readonly particleSize: number;
  private geometry = new THREE.BufferGeometry();
  private vertices: number[] = [];
  private colors: number[] = [];
  private material: THREE.PointsMaterial;
  private sprite = new THREE.TextureLoader().load("textures/sprites/disc.png");
  private points: THREE.Points;
  camera: THREE.Camera;
  scene: THREE.Scene;

  constructor({ backgroundColor, sphereRadius, particleSize }: GlParticlesConstructorProps) {
    this.camera = createCamera();
    this.scene = createScene({ backgroundColor });
    this.particleSize = particleSize;
    this.sphereRadius = sphereRadius;
  }

  init({ simulation }: { simulation: Simulation }) {
    simulation.particles.forEach((particle) => {
      this.vertices.push(particle.position.x, particle.position.y, particle.position.z);

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

  update(simulation: Simulation, _step: number) {
    const positions = this.points.geometry.attributes.position.array;
    const colors = this.points.geometry.attributes.color.array;

    simulation.particles.forEach((particle, index) => {
      positions[index * 3] = particle.position.x;
      positions[index * 3 + 1] = particle.position.y;
      positions[index * 3 + 2] = particle.position.z;

      const glColor = particle.color.gl();

      colors[index * 3] = glColor[0];
      colors[index * 3 + 1] = glColor[1];
      colors[index * 3 + 2] = glColor[2];
    });

    this.points.geometry.attributes.position.needsUpdate = true;
    this.points.geometry.attributes.color.needsUpdate = true;
  }
}
