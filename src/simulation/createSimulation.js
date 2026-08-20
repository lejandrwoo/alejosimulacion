import * as THREE from 'three';

export function createSimulation({ scene, params, count = 65000 }) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // Paleta de gradiente infrarrojo exacto a imágenes de referencia
  const thermalPalette = {
    core: new THREE.Color('#ffffff'),      // Incandescencia blanca
    yellow: new THREE.Color('#ffee00'),    // Amarillo térmico
    orange: new THREE.Color('#ff4400'),    // Naranja / Rojo fuego
    magenta: new THREE.Color('#d400aa'),   // Violeta neón / Magenta
    purple: new THREE.Color('#400080')     // Violeta oscuro exterior
  };

  const tempColor = new THREE.Color();

  function reset() {
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Dispersión volumétrica inicial
      const u = Math.random();
      const v = Math.random();
      const theta = u * Math.PI * 2.0;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 2.3;

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      velocities[i3] = (Math.random() - 0.5) * 0.08;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.08;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.08;
    }

    if (geometry.attributes.position) {
      geometry.attributes.position.needsUpdate = true;
    }
  }

  reset();

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Generación de textura de partícula suave (Glow Point)
  const canvas = document.createElement('canvas');
  canvas.width = 16; canvas.height = 16;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.5)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 16);
  const particleTexture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: params.particleSize.value,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  function stepSimulation() {
    material.size = params.particleSize.value;

    const dt = params.dt.value * params.timeScale.value;
    const pos = geometry.attributes.position.array;
    const col = geometry.attributes.color.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let px = pos[i3], py = pos[i3 + 1], pz = pos[i3 + 2];
      let vx = velocities[i3], vy = velocities[i3 + 1], vz = velocities[i3 + 2];

      let ax = 0, ay = 0, az = 0;

      // 1. Tecla W: Formación Espiral / Phyllotaxis (Girasol)
      if (params.keyW.value) {
        const phi = i * 137.5 * (Math.PI / 180);
        const rSun = 0.012 * Math.sqrt(i);
        ax += (Math.cos(phi) * rSun - px) * 5.0;
        ay += (Math.sin(phi) * rSun - py) * 5.0;
      }

      // 2. Tecla A: Repulsión Horizontal / Viento
      if (params.keyA.value) {
        ax -= 9.5;
        ay += Math.sin(px * 2.5) * 2.5;
      }

      // 3. Tecla S: Drip Style (Gravedad Fluida)
      if (params.keyS.value) {
        ay -= 10.5;
        ax += (Math.random() - 0.5) * 2.0;
      }

      // 4. Tecla D: Atracción Implosiva al Centro
      if (params.keyD.value) {
        const dist = Math.sqrt(px * px + py * py + pz * pz) + 0.1;
        ax -= (px / dist) * 15.0;
        ay -= (py / dist) * 15.0;
        az -= (pz / dist) * 15.0;
      }

      // 5. Tecla I: Dispersión 3D Explosiva
      if (params.keyI.value) {
        const dist = Math.sqrt(px * px + py * py + pz * pz) + 0.1;
        ax += (px / dist) * 16.0;
        ay += (py / dist) * 16.0;
        az += (pz / dist) * 16.0;
      }

      // 6. Tecla K: Compresión Radial sobre el Eje Central
      if (params.keyK.value) {
        ax -= px * 9.5;
        az -= pz * 9.5;
      }

      // 7. Tecla J: Vórtice Anti-Horario
      if (params.keyJ.value) {
        ax += -pz * 7.5;
        az += px * 7.5;
      }

      // 8. Tecla L: Vórtice Horario con Elevación Z
      if (params.keyL.value) {
        ax += pz * 7.5;
        az += -px * 7.5;
        ay += Math.cos(px * 2.0) * 4.0;
      }

      // Fricción / Amortiguamiento
      ax -= vx * 0.18;
      ay -= vy * 0.18;
      az -= vz * 0.18;

      vx += ax * dt; vy += ay * dt; vz += az * dt;
      px += vx * dt; py += vy * dt; pz += vz * dt;

      // Recirculación limpia en fronteras
      const limit = 8.5;
      if (Math.abs(px) > limit || Math.abs(py) > limit || Math.abs(pz) > limit) {
        px = (Math.random() - 0.5) * 1.5;
        py = (Math.random() - 0.5) * 1.5;
        pz = (Math.random() - 0.5) * 1.5;
        vx = 0; vy = 0; vz = 0;
      }

      pos[i3] = px; pos[i3 + 1] = py; pos[i3 + 2] = pz;
      velocities[i3] = vx; velocities[i3 + 1] = vy; velocities[i3 + 2] = vz;

      // Mapeo Térmico por distancia radial + velocidad
      const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
      const rDist = Math.min(Math.sqrt(px * px + py * py + pz * pz) / 2.8, 1.0);
      const factor = Math.min((rDist * 0.8 + speed * 0.08), 1.0);

      if (factor < 0.2) {
        tempColor.copy(thermalPalette.core).lerp(thermalPalette.yellow, factor * 5.0);
      } else if (factor < 0.45) {
        tempColor.copy(thermalPalette.yellow).lerp(thermalPalette.orange, (factor - 0.2) * 4.0);
      } else if (factor < 0.75) {
        tempColor.copy(thermalPalette.orange).lerp(thermalPalette.magenta, (factor - 0.45) * 3.33);
      } else {
        tempColor.copy(thermalPalette.magenta).lerp(thermalPalette.purple, (factor - 0.75) * 4.0);
      }

      col[i3] = tempColor.r;
      col[i3 + 1] = tempColor.g;
      col[i3 + 2] = tempColor.b;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  }

  return { reset, stepSimulation };
}