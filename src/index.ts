import { Simulation } from "./simulation";
import { Fade } from "./fade";
import { Renderer } from "./renderer";
import { getGradient } from "./color";

const main = () => {
  const renderer = new Renderer();
  const simulation = new Simulation({
    numberOfParticles: 100000,
    sphereRadius: 50,
    backgroundColor: 0x000,
    noiseResolution: 0.05,
    particleSize: 0.01,
    gradient: getGradient("fire"),
  });
  const fade = new Fade({ alpha: 0.05 });

  renderer.init();
  simulation.init();

  simulation.addToRenderer(renderer);
  fade.addToRenderer(renderer);

  let step = 0;
  function animate() {
    requestAnimationFrame(animate);

    simulation.update({ deltaTime: 0.5, step });
    renderer.render();

    step += 1;
  }
  requestAnimationFrame(animate);
};

document.addEventListener("DOMContentLoaded", main);
