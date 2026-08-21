import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './styles.css';

import { createParameters } from './simulation/parameters.js';
import { createSimulation } from './simulation/createSimulation.js';
import { createLabPanel } from './ui/labPanel.js';

function main() {
  const mount = document.querySelector('#app');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#020104');

  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.05, 100);
  camera.position.set(0, 0, 7.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  mount.appendChild(renderer.domElement);

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableDamping = true;

  const params = createParameters();
  const simulation = createSimulation({ scene, params, count: 35000 });

  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();

  // El cursor actualiza únicamente la posición del objetivo en 3D
  addEventListener('pointermove', (event) => {
    pointerNdc.x = (event.clientX / innerWidth) * 2 - 1;
    pointerNdc.y = -(event.clientY / innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointerNdc, camera);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      params.attractor.value.copy(hit);
    }
  });

  // Estado de teclas presionadas para soporte de combinaciones fluidas
  const activeKeys = new Set();
  let paused = false;
  let isPresentationMode = false;

  // Variables para control de transiciones de cámara (Teclas 1, 2, 3)
  let cameraMode = 0; // 0: Normal / OrbitControls, 1: Órbita Cinemática, 2: Zoom Macro, 3: Vista Cenital
  const targetCamPos = new THREE.Vector3(0, 0, 7.5);

  // Activa/desactiva la interfaz, el cursor y la pantalla completa
  const togglePresentation = async () => {
    isPresentationMode = !isPresentationMode;
    panel.setVisible(!isPresentationMode);

    // Ocultar / Mostrar cursor en el lienzo 3D
    renderer.domElement.style.cursor = isPresentationMode ? 'none' : 'default';

    // Solicitud / Salida de Pantalla Completa
    try {
      if (isPresentationMode) {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Error al cambiar modo de pantalla completa:', err);
    }
  };

  // Sincroniza el estado cuando el usuario sale de pantalla completa presionando ESC
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && isPresentationMode) {
      isPresentationMode = false;
      panel.setVisible(true);
      renderer.domElement.style.cursor = 'default';
    }
  });

  const panel = createLabPanel({
    params,
    onReset: () => simulation.reset(),
    onModeChange: togglePresentation,
    onPauseChange: () => paused = !paused
  });

  addEventListener('keydown', (e) => {
    // Evita el comportamiento predeterminado del navegador al presionar Espacio
    if (e.code === 'Space') {
      e.preventDefault();
      activeKeys.add('space');
      return;
    }

    const k = e.key.toLowerCase();
    activeKeys.add(k);

    if (k === 'p') togglePresentation();
    if (k === 'r') simulation.reset();

    // Controles de Cámara (Teclas 1, 2, 3)
    if (k === '1') {
      cameraMode = (cameraMode === 1) ? 0 : 1; // Alterna Órbita Cinemática
    } else if (k === '2') {
      cameraMode = (cameraMode === 2) ? 0 : 2; // Alterna Zoom Macro
      if (cameraMode === 2) targetCamPos.set(0, 0, 2.2);
      else targetCamPos.set(0, 0, 7.5);
    } else if (k === '3') {
      cameraMode = (cameraMode === 3) ? 0 : 3; // Alterna Vista Cenital
      if (cameraMode === 3) targetCamPos.set(0, 8.0, 0.001);
      else targetCamPos.set(0, 0, 7.5);
    }
  });

  addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      activeKeys.delete('space');
      params.radialStrength.value = 0.0;
      return;
    }
    activeKeys.delete(e.key.toLowerCase());
  });

  function updateCameraMotion() {
    if (cameraMode === 1) {
      // 1: Órbita Cinemática Automática de 360°
      orbit.autoRotate = true;
      orbit.autoRotateSpeed = 3.5;
    } else {
      orbit.autoRotate = false;
      if (cameraMode === 2 || cameraMode === 3) {
        // Interpolación suave (lerp) para Zoom Macro o Vista Cenital
        camera.position.lerp(targetCamPos, 0.06);
      }
    }
  }

  function updateKeyboardCombinations() {
    // 1. Morfología Base (WASD)
    if (activeKeys.has('w')) { params.morphologyMode.value = 0; params.colorMode.value = 0; }
    if (activeKeys.has('a')) { params.morphologyMode.value = 1; params.colorMode.value = 1; }
    if (activeKeys.has('s')) { params.morphologyMode.value = 2; params.colorMode.value = 2; }
    if (activeKeys.has('d')) { params.morphologyMode.value = 3; params.colorMode.value = 3; }

    // 2. Modificadores Orgánicos Individuales y Combinados (Q y E)
    let targetSpike = 0.0;
    let targetPulse = 0.0;

    const hasQ = activeKeys.has('q');
    const hasE = activeKeys.has('e');

    // Dalia (W) + Q / E
    if (params.morphologyMode.value === 0) {
      if (hasQ) targetSpike = 1.3;
      if (hasE) targetPulse = 1.1;
    }
    // Crisálida (A) + Q / E
    else if (params.morphologyMode.value === 1) {
      if (hasQ) targetSpike = 1.6;
      if (hasE) targetPulse = 0.9;
    }
    // Panal (S) + Q / E
    else if (params.morphologyMode.value === 2) {
      if (hasQ) targetSpike = 0.8;
      if (hasE) targetPulse = 1.4;
    }
    // Prisma (D) + Q / E
    else if (params.morphologyMode.value === 3) {
      if (hasQ) targetSpike = 1.5;
      if (hasE) targetPulse = 1.0;
    }

    // Modificadores independientes sin morfología específica o combinados (Q + E)
    if (hasQ && targetSpike === 0.0) targetSpike = 1.0;
    if (hasE && targetPulse === 0.0) targetPulse = 1.0;

    if (hasQ && hasE) {
      targetSpike *= 1.25;
      targetPulse *= 1.25;
    }

    params.spikeAmount.value += (targetSpike - params.spikeAmount.value) * 0.1;
    params.pulseAmount.value += (targetPulse - params.pulseAmount.value) * 0.1;

    // 3. Repulsión / Fuerza impulsada únicamente por Barra Espaciadora
    if (activeKeys.has('space')) {
      params.radialStrength.value = -12.0;
    } else {
      params.radialStrength.value = 0.0;
    }

    // 4. Escultura e Inercia Manual (I, K, J, L)
    if (activeKeys.has('i')) params.squashY.value = Math.min(2.5, params.squashY.value + 0.03);
    if (activeKeys.has('k')) params.squashY.value = Math.max(0.2, params.squashY.value - 0.03);
    if (!activeKeys.has('i') && !activeKeys.has('k')) {
      params.squashY.value += (1.0 - params.squashY.value) * 0.05;
    }

    if (activeKeys.has('j')) params.twistAmount.value -= 0.05;
    if (activeKeys.has('l')) params.twistAmount.value += 0.05;
    if (!activeKeys.has('j') && !activeKeys.has('l')) {
      params.twistAmount.value *= 0.92;
    }
  }

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    updateKeyboardCombinations();
    updateCameraMotion();
    if (!paused) simulation.stepSimulation();
    orbit.update();
    renderer.render(scene, camera);
  }

  animate();
}

main();