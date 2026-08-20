import GUI from 'lil-gui';

export function createLabPanel({ params, onReset, onModeChange }) {
  const gui = new GUI({ title: 'U3 · Forces Instrument' });
  gui.domElement.style.position = 'fixed';
  gui.domElement.style.top = '10px';
  gui.domElement.style.left = '10px';
  gui.domElement.style.zIndex = '1000';

  // Subtítulo de instrucciones en UI
  const subTitle = document.createElement('div');
  subTitle.style.cssText = 'font-size:10px; color:#aaa; padding: 0 10px 10px; font-family: sans-serif;';
  subTitle.innerText = 'LAB: aísla fuerzas. P cambia a PERFORMANCE. WASD/IJKL: comportamientos.';
  gui.domElement.insertBefore(subTitle, gui.domElement.children[1]);

  // Sección SIMULACIÓN
  const simFolder = gui.addFolder('SIMULACIÓN');
  simFolder.add(params.timeScale, 'value', 0.1, 3.0, 0.05).name('timeScale');
  simFolder.add(params.particleSize, 'value', 0.005, 0.05, 0.001).name('particleSize');

  // Sección FUERZAS TECLAS (Suma Dinámica)
  const forcesFolder = gui.addFolder('FUERZAS ACTIVAS');
  forcesFolder.add(params.keyW, 'value').name('W (Espiral Girasol)').listen();
  forcesFolder.add(params.keyA, 'value').name('A (Viento / Repulsión)').listen();
  forcesFolder.add(params.keyS, 'value').name('S (Drip Style / Goteo)').listen();
  forcesFolder.add(params.keyD, 'value').name('D (Implosión Centro)').listen();
  forcesFolder.add(params.keyI, 'value').name('I (Dispersión 3D)').listen();
  forcesFolder.add(params.keyK, 'value').name('K (Compresión Radial)').listen();
  forcesFolder.add(params.keyJ, 'value').name('J (Vórtice Anti-Horario)').listen();
  forcesFolder.add(params.keyL, 'value').name('L (Vórtice Horario + Z)').listen();

  // Acciones y Modos
  const actionsFolder = gui.addFolder('CONTROLES');
  actionsFolder.add({ reset: onReset }, 'reset').name('Reiniciar (R)');
  actionsFolder.add({ toggleMode: onModeChange }, 'toggleMode').name('Alternar UI (P)');

  // Indicador de modo en la esquina inferior derecha
  const statusOverlay = document.createElement('div');
  statusOverlay.style.cssText = `
    position: fixed;
    bottom: 12px;
    right: 15px;
    color: #ffffff;
    font-family: monospace;
    font-size: 11px;
    background: rgba(0, 0, 0, 0.7);
    padding: 4px 8px;
    border-radius: 4px;
    pointer-events: none;
    z-index: 1000;
  `;
  statusOverlay.innerText = 'LAB · P: performance · R: reset';
  document.body.appendChild(statusOverlay);

  return {
    setVisible(visible) {
      if (visible) {
        gui.show();
        statusOverlay.innerText = 'LAB · P: performance · R: reset';
      } else {
        gui.hide();
        statusOverlay.innerText = 'PERFORMANCE · P: lab · R: reset';
      }
    },
    refresh() {
      gui.controllersRecursive().forEach(c => c.updateDisplay());
    }
  };
}