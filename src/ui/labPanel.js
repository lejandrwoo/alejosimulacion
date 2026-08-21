export function createLabPanel({ params, onReset, onModeChange, onPauseChange }) {
  const panel = document.createElement('aside');
  panel.className = 'panel';
  panel.innerHTML = `
    <h1>U3 · Escultura Esférica Interactiva</h1>
    <p class="subtitle">Guía de Teclas y Combinaciones Avanzadas</p>
    
    <div class="keyboard-guide">
      <div class="key-group">
        <h3>1. Morfología Base + Paleta (WASD)</h3>
        <ul>
          <li><kbd>W</kbd> <strong>Dalia Organoide</strong> (Flor cálida)</li>
          <li><kbd>A</kbd> <strong>Rosa U.V. / Crisálida</strong> (Espiral helicoidal)</li>
          <li><kbd>S</kbd> <strong>Panal Insecto</strong> (Estructura de enjambre)</li>
          <li><kbd>D</kbd> <strong>Prisma Flora</strong> (Crestas orgánicas)</li>
        </ul>
      </div>

      <div class="key-group">
        <h3>2. Combinaciones de Alteración (WASD + Q / E)</h3>
        <ul>
          <li><kbd>W + Q</kbd> <strong>Dalia de Espinas Fuego</strong> (Agujas reactivas)</li>
          <li><kbd>W + E</kbd> <strong>Flor Cíclica</strong> (Pulso de expansión orgánico)</li>
          <li><kbd>A + Q</kbd> <strong>Crisálida Destrozada</strong> (Dispersión caótica)</li>
          <li><kbd>A + E</kbd> <strong>Crisálida Latente</strong> (Ondulación helicoidal)</li>
          <li><kbd>S + Q</kbd> <strong>Panal Perturbado</strong> (Vibración de alta frecuencia)</li>
          <li><kbd>S + E</kbd> <strong>Enjambre Latente</strong> (Condensación y pulso)</li>
          <li><kbd>D + Q</kbd> <strong>Prisma Fracturado</strong> (Fragmentación de cristal)</li>
          <li><kbd>D + E</kbd> <strong>Pulsación Prismática</strong> (Onda de crestas)</li>
          <li><kbd>Q + E</kbd> <strong>Perturbación Cíclica Total</strong> (Modificador dual)</li>
          <li><kbd>Espacio</kbd> <strong>Repulsión Directa</strong> (En la posición del puntero)</li>
        </ul>
      </div>

      <div class="key-group">
        <h3>3. Juegos de Cámara (1, 2, 3)</h3>
        <ul>
          <li><kbd>1</kbd> <strong>Órbita Cinemática</strong> (Giro automático 360°)</li>
          <li><kbd>2</kbd> <strong>Zoom Macro Inmersivo</strong> (Acercamiento interno)</li>
          <li><kbd>3</kbd> <strong>Vista Cenital</strong> (Plano superior Top-Down)</li>
        </ul>
      </div>

      <div class="key-group">
        <h3>4. Escultura Manual e Inercia</h3>
        <ul>
          <li><kbd>I</kbd> / <kbd>K</kbd> Aplastar / Alargar esfera (Eje Y)</li>
          <li><kbd>J</kbd> / <kbd>L</kbd> Torsión y Rotación Axial (Twist)</li>
          <li><kbd>P</kbd> Activar / Desactivar Interfaz (Modo Presentación)</li>
          <li><kbd>R</kbd> Restaurar Esfera Original</li>
        </ul>
      </div>
    </div>
  `;

  const actions = document.createElement('div');
  actions.className = 'group';
  
  const bReset = document.createElement('button');
  bReset.textContent = 'Restaurar Forma (R)';
  bReset.onclick = onReset;

  const bPause = document.createElement('button');
  bPause.textContent = 'Pausar / Continuar';
  bPause.onclick = onPauseChange;

  const bPres = document.createElement('button');
  bPres.textContent = 'Modo Presentación (P)';
  bPres.onclick = onModeChange;

  actions.append(bReset, bPause, bPres);
  panel.append(actions);
  document.body.append(panel);

  return {
    element: panel,
    setVisible(v) { panel.style.display = v ? 'block' : 'none'; }
  };
}