import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './styles.css';

import { createParameters } from './simulation/parameters.js';
import { createSimulation } from './simulation/createSimulation.js';
import { createLabPanel } from './ui/labPanel.js';

const PARTICLE_COUNT = 65000;

function main() {
  const mount = document.querySelector('#app');
  if (!mount) return;

  const scene = new THREE.Scene();
  // Fondo Azul Marino Ultramar de la referencia visual
  scene.background = new THREE.Color('#010214');

  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.05, 100);
  camera.position.set(0, 0, 7.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  mount.appendChild(renderer.domElement);

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;

  const params = createParameters();
  const simulation = createSimulation({ scene, params, count: PARTICLE_COUNT });

  let mode = 'LAB';

  const toggleMode = () => {
    mode = mode === 'LAB' ? 'PERFORMANCE' : 'LAB';
    panel.setVisible(mode === 'LAB');
  };

  const panel = createLabPanel({
    params,
    onReset: () => simulation.reset(),
    onModeChange: toggleMode
  });

  const updateKey = (code, isDown) => {
    if (code === 'KeyW') params.keyW.value = isDown;
    if (code === 'KeyA') params.keyA.value = isDown;
    if (code === 'KeyS') params.keyS.value = isDown;
    if (code === 'KeyD') params.keyD.value = isDown;

    if (code === 'KeyI') params.keyI.value = isDown;
    if (code === 'KeyJ') params.keyJ.value = isDown;
    if (code === 'KeyK') params.keyK.value = isDown;
    if (code === 'KeyL') params.keyL.value = isDown;
  };

  addEventListener('keydown', (event) => {
    // Tecla P: Alternar modo PERFORMANCE / LAB
    if (event.code === 'KeyP' && !event.repeat) {
      toggleMode();
    }
    // Tecla R: Reiniciar
    if (event.code === 'KeyR' && !event.repeat) {
      simulation.reset();
    }
    updateKey(event.code, true);
    panel.refresh();
  });

  addEventListener('keyup', (event) => {
    updateKey(event.code, false);
    panel.refresh();
  });

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    simulation.stepSimulation();
    orbit.update();
    renderer.render(scene, camera);
  }

  animate();
}

main();