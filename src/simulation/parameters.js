import * as THREE from 'three';

export function createParameters() {
  return {
    dt: { value: 1 / 60 },
    timeScale: { value: 1.0 },
    particleSize: { value: 0.035 },

    // Morfogénesis y Estabilidad
    shapeMemory: { value: 8.0 }, // Fuerza que regresa las partículas a la forma
    sphereRadius: { value: 2.2 },
    morphologyMode: { value: 0 }, // 0: Dalia, 1: Helicoidal, 2: Panal, 3: Prisma
    
    // Deformaciones de Teclado (Q, E, IJKL)
    spikeAmount: { value: 0.0 },   // Tecla Q
    pulseAmount: { value: 0.0 },   // Tecla E
    squashY: { value: 1.0 },       // Teclas I/K
    twistAmount: { value: 0.0 },   // Teclas J/L

    // Fuerzas Físicas Directas
    radialStrength: { value: 0.0 },
    vortexStrength: { value: 0.0 },
    attractor: { value: new THREE.Vector3(0, 0, 0) },

    // Paletas
    colorMode: { value: 0 }
  };
}