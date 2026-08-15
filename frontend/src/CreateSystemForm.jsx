import { useState } from 'react';

function CreateSystemForm({ onSimulationCreated, onPredictionReady, onAnalysisStart }) {
  const [bodies, setBodies] = useState([
  { mass: '', x: '', y: '', vx: '', vy: '', radius: '', color: '' }
]);

const [systemName, setSystemName] = useState('');

function updateBody(index, field, value) {
  const newBodies = [...bodies];
  newBodies[index] = { ...newBodies[index], [field]: value };
  setBodies(newBodies);
}

function addBody() {
  setBodies([...bodies, { mass: '', x: '', y: '', vx: '', vy: '', radius: '', color: '' }]);
}
async function handleRun(e) {
  e.preventDefault();
  const parsedBodies = bodies.map(b => ({
    mass: parseFloat(b.mass),
    x: parseFloat(b.x),
    y: parseFloat(b.y),
    vx: parseFloat(b.vx),
    vy: parseFloat(b.vy),
    radius: parseFloat(b.radius),
    color: b.color,
  }));
  onSimulationCreated(parsedBodies);
  onAnalysisStart?.();

  const response = await fetch('http://127.0.0.1:8000/predict-preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bodies: parsedBodies }),
  });
   const data = await response.json();
   onPredictionReady?.(data.narration);
}

async function handleSave() {
  const parsedBodies = bodies.map(b => ({
    mass: parseFloat(b.mass),
    x: parseFloat(b.x),
    y: parseFloat(b.y),
    vx: parseFloat(b.vx),
    vy: parseFloat(b.vy),
    radius: parseFloat(b.radius),
    color: b.color,
  }));


  await fetch('http://127.0.0.1:8000/simulations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: systemName || 'Untitled system',
        config: { bodies: parsedBodies }
    }),
  });
}

  return (
  <form onSubmit={handleRun}>
    <input
      type="text"
      value={systemName}
      onChange={(e) => setSystemName(e.target.value)}
      placeholder="system name (e.g. Sun-Earth Pair)"
      style={{ marginBottom: '1rem', width: '100%' }}
    />
    {bodies.map((body, index) => (
      <div key={index} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <input type="text" value={body.mass} onChange={(e) => updateBody(index, 'mass', e.target.value)} placeholder="mass (e.g. 5.97e24)" />
        <input type="text" value={body.x} onChange={(e) => updateBody(index, 'x', e.target.value)} placeholder="x (e.g. 1.5e11)" />
        <input type="text" value={body.y} onChange={(e) => updateBody(index, 'y', e.target.value)} placeholder="y (e.g. 0)" />
        <input type="text" value={body.vx} onChange={(e) => updateBody(index, 'vx', e.target.value)} placeholder="vx (e.g. 0)" />
        <input type="text" value={body.vy} onChange={(e) => updateBody(index, 'vy', e.target.value)} placeholder="vy (e.g. 29780)" />
        <input type="text" value={body.radius} onChange={(e) => updateBody(index, 'radius', e.target.value)} placeholder="radius (e.g. 5)" />
        <input type="text" value={body.color} onChange={(e) => updateBody(index, 'color', e.target.value)} placeholder="color (e.g. blue)" />
      </div>
    ))}
    <button type="button" onClick={addBody}>+ Add body</button>
    <button type="submit">Run</button>
    <button type="button" onClick={handleSave} style={{ marginLeft: '0.5rem' }}>Save to gallery</button>
    <p style={{ fontSize: '1rem', color: 'var(--text-dim)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
        Values should be physically consistent (e.g. mass in kg, distance in meters) — 
        unrealistic combinations may cause bodies to move very fast or fly off screen. 
    </p>
  </form>
);
}

export default CreateSystemForm;