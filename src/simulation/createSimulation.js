import * as THREE from 'three';

export function createSimulation({ scene, params, count = 35000 }) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const targetPositions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    seeds[i * 3]     = Math.random();
    seeds[i * 3 + 1] = Math.random();
    seeds[i * 3 + 2] = Math.random();
  }

  // Genera la forma objetivo (Target) para mantener la escultura reconocible
  function calculateTargetShape() {
    const rBase = params.sphereRadius.value;
    const mode = params.morphologyMode.value;
    const spikes = params.spikeAmount.value;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const u = seeds[i3];
      const v = seeds[i3 + 1];
      const w = seeds[i3 + 2];

      let x = 0, y = 0, z = 0;

      if (mode === 0) { // Dalia Organoide
        const theta = u * Math.PI * 2;
        const phi = Math.acos(2 * v - 1);
        const petal = Math.sin(theta * 8) * Math.cos(phi * 8) * 0.35;
        const r = rBase * (0.8 + petal);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
      } 
      else if (mode === 1) { // Crisálida / Rosa Helicoidal
        const theta = u * Math.PI * 8;
        const h = (v - 0.5) * 2 * rBase;
        const r = Math.sqrt(Math.max(0, rBase * rBase - h * h)) * (0.6 + 0.4 * Math.sin(theta));
        x = r * Math.cos(theta);
        y = h;
        z = r * Math.sin(theta);
      } 
      else if (mode === 2) { // Panal / Enjambre Contenido
        const theta = u * Math.PI * 2;
        const phi = Math.acos(2 * v - 1);
        const grid = (Math.floor(u * 20) / 20) * Math.PI * 2;
        const r = rBase * (0.9 + 0.1 * Math.sin(w * 50));
        x = r * Math.sin(phi) * Math.cos(grid);
        y = r * Math.sin(phi) * Math.sin(grid);
        z = r * Math.cos(phi);
      } 
      else if (mode === 3) { // Prisma / Flora Cristalina
        const theta = u * Math.PI * 2;
        const phi = Math.acos(2 * v - 1);
        const mod = Math.pow(Math.abs(Math.sin(theta * 3) * Math.sin(phi * 3)), 0.5);
        const r = rBase * (0.5 + mod * 0.8);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
      }

      // Deformación Q (Espinas / Spikes)
      if (spikes > 0.01) {
        const noise = Math.sin(u * 40) * Math.cos(v * 40);
        const spikeFactor = 1.0 + noise * spikes * 1.5;
        x *= spikeFactor;
        y *= spikeFactor;
        z *= spikeFactor;
      }

      // Deformación I/K (Squash / Stretch Y)
      y *= params.squashY.value;

      targetPositions[i3]     = x;
      targetPositions[i3 + 1] = y;
      targetPositions[i3 + 2] = z;
    }
  }

  // Inicializar posiciones
  calculateTargetShape();
  for (let i = 0; i < count * 3; i++) positions[i] = targetPositions[i];

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
  grad.addColorStop(0.7, 'rgba(255,255,255,0.2)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
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

  const palettes = [
    { slow: new THREE.Color('#3a0007'), mid: new THREE.Color('#ff2200'), fast: new THREE.Color('#ffaa00'), core: new THREE.Color('#ffffff') }, // Dalia
    { slow: new THREE.Color('#050026'), mid: new THREE.Color('#1f00ff'), fast: new THREE.Color('#ff0066'), core: new THREE.Color('#80efff') }, // Rosa UV
    { slow: new THREE.Color('#1c0d00'), mid: new THREE.Color('#ff4800'), fast: new THREE.Color('#ffd700'), core: new THREE.Color('#ffffff') }, // Enjambre
    { slow: new THREE.Color('#001829'), mid: new THREE.Color('#00d0ff'), fast: new THREE.Color('#ff3399'), core: new THREE.Color('#ffffff') }  // Prisma
  ];

  let time = 0;

  function reset() {
    calculateTargetShape();
    for (let i = 0; i < count * 3; i++) {
      positions[i] = targetPositions[i];
      velocities[i] = 0;
    }
    geometry.attributes.position.needsUpdate = true;
  }

  function stepSimulation() {
    const dt = params.dt.value * params.timeScale.value;
    time += dt;

    calculateTargetShape();

    const pos = geometry.attributes.position.array;
    const col = geometry.attributes.color.array;
    const pal = palettes[params.colorMode.value] || palettes[0];
    const tempCol = new THREE.Color();

    const kReturn = params.shapeMemory.value;
    const pulseFactor = 1.0 + Math.sin(time * 6.0) * params.pulseAmount.value * 0.35;
    const twist = params.twistAmount.value;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      let tx = targetPositions[i3] * pulseFactor;
      let ty = targetPositions[i3 + 1] * pulseFactor;
      let tz = targetPositions[i3 + 2] * pulseFactor;

      // Deformación J/L (Twist Axial)
      if (Math.abs(twist) > 0.01) {
        const cosT = Math.cos(ty * twist);
        const sinT = Math.sin(ty * twist);
        const rx = tx * cosT - tz * sinT;
        const rz = tx * sinT + tz * cosT;
        tx = rx; tz = rz;
      }

      let px = pos[i3], py = pos[i3 + 1], pz = pos[i3 + 2];
      let vx = velocities[i3], vy = velocities[i3 + 1], vz = velocities[i3 + 2];

      // 1. Fuerza de Retorno a la Forma (Morfogénesis)
      let ax = (tx - px) * kReturn;
      let ay = (ty - py) * kReturn;
      let az = (tz - pz) * kReturn;

      // 2. Interacción con Mouse (Si se aplica fuerza radial)
      if (params.radialStrength.value !== 0) {
        const dx = px - params.attractor.value.x;
        const dy = py - params.attractor.value.y;
        const dz = pz - params.attractor.value.z;
        const d2 = dx*dx + dy*dy + dz*dz + 0.1;
        const f = params.radialStrength.value / d2;
        ax += (dx / Math.sqrt(d2)) * f;
        ay += (dy / Math.sqrt(d2)) * f;
        az += (dz / Math.sqrt(d2)) * f;
      }

      // Fricción constante para evitar explosión de la forma
      ax -= vx * 4.0;
      ay -= vy * 4.0;
      az -= vz * 4.0;

      vx += ax * dt; vy += ay * dt; vz += az * dt;
      px += vx * dt; py += vy * dt; pz += vz * dt;

      pos[i3] = px; pos[i3 + 1] = py; pos[i3 + 2] = pz;
      velocities[i3] = vx; velocities[i3 + 1] = vy; velocities[i3 + 2] = vz;

      // Color según desplazamiento respecto a su forma original
      const displacement = Math.sqrt((px - tx)**2 + (py - ty)**2 + (pz - tz)**2);
      const t = Math.min(displacement * 1.5, 1.0);

      if (t < 0.3) tempCol.copy(pal.slow).lerp(pal.mid, t * 3.33);
      else if (t < 0.8) tempCol.copy(pal.mid).lerp(pal.fast, (t - 0.3) * 2.0);
      else tempCol.copy(pal.fast).lerp(pal.core, (t - 0.8) * 5.0);

      col[i3] = tempCol.r; col[i3 + 1] = tempCol.g; col[i3 + 2] = tempCol.b;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  }

  return { reset, stepSimulation };
}