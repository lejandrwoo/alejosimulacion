export function createParameters() {
  return {
    dt: { value: 1 / 60 },
    timeScale: { value: 1.05 },
    particleSize: { value: 0.015 },

    // Estados de teclado
    keyW: { value: false },
    keyA: { value: false },
    keyS: { value: false },
    keyD: { value: false },

    keyI: { value: false },
    keyJ: { value: false },
    keyK: { value: false },
    keyL: { value: false }
  };
}