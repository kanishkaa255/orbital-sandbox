import { useState } from 'react';
import { API_URL } from './config';

function CreateSystemForm({ bodies, setBodies, systemName, setSystemName, onSimulationCreated, onPredictionReady, onAnalysisStart, onDuplicateFound, narration, showCrawl, setShowCrawl }) {

function updateBody(index, field, value) {
  const newBodies = [...bodies];
  newBodies[index] = { ...newBodies[index], [field]: value };
  setBodies(newBodies);
}

function addBody() {
  setBodies([...bodies, { name: '', mass: '', x: '', y: '', vx: '', vy: '', radius: '', color: '' }]);
}

async function handleRun(e) {
  e.preventDefault();
  const parsedBodies = bodies.map((b, i) => ({
    name: b.name || `body_${i}`,
    mass: parseFloat(b.mass),
    x: parseFloat(b.x),
    y: parseFloat(b.y),
    vx: parseFloat(b.vx),
    vy: parseFloat(b.vy),
    radius: parseFloat(b.radius),
    color: b.color,
  }));
  onSimulationCreated(structuredClone(parsedBodies));
  onAnalysisStart?.();

  const response = await fetch(`${API_URL}/predict-preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bodies: parsedBodies }),
  });
   const data = await response.json();
   onPredictionReady?.(data.narration);

}

async function handleSave() {
  const parsedBodies = bodies.map((b, i) => ({
    name: b.name || `body_${i}`,
    mass: parseFloat(b.mass),
    x: parseFloat(b.x),
    y: parseFloat(b.y),
    vx: parseFloat(b.vx),
    vy: parseFloat(b.vy),
    radius: parseFloat(b.radius),
    color: b.color,
  }));

  const checkResponse = await fetch(`${API_URL}/simulations/check-duplicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({ bodies: parsedBodies }),
  })
  const checkData = await checkResponse.json();

  console.log('duplicate check payload:', JSON.stringify({ bodies: parsedBodies }));
  if(checkData.duplicate) {
    const proceed = window.confirm(
      `This system already exists as "${checkData.duplicate.name}" (ID ${checkData.duplicate.id}). Save anyway?`
    );
    if (!proceed){
      const dupResponse = await fetch(`${API_URL}/simulations/${checkData.duplicate.id}`);
      const dupData = await dupResponse.json()
      onDuplicateFound?.(dupData);
      return;
    }
  }


  await fetch(`${API_URL}/simulations`, {
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
      <div key={index} style={{ marginBottom: '1rem'}}>
        <input type="text" value={body.name} onChange={(e) => updateBody(index, 'name', e.target.value)} placeholder="name (e.g. Earth)" />
        <input type="text" value={body.mass} onChange={(e) => updateBody(index, 'mass', e.target.value)} placeholder="mass (e.g. 5.97e24)" />
        <input type="text" value={body.x} onChange={(e) => updateBody(index, 'x', e.target.value)} placeholder="x (e.g. 1.5e11)" />
        <input type="text" value={body.y} onChange={(e) => updateBody(index, 'y', e.target.value)} placeholder="y (e.g. 0)" />
        <input type="text" value={body.vx} onChange={(e) => updateBody(index, 'vx', e.target.value)} placeholder="vx (e.g. 0)" />
        <input type="text" value={body.vy} onChange={(e) => updateBody(index, 'vy', e.target.value)} placeholder="vy (e.g. 29780)" />
        <input type="text" value={body.radius} onChange={(e) => updateBody(index, 'radius', e.target.value)} placeholder="radius (e.g. 5)" />
        <input type="text" value={body.color} onChange={(e) => updateBody(index, 'color', e.target.value)} placeholder="color (e.g. blue)" />
      </div>
    ))}
    <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)', marginBottom: '1rem', lineHeight: 1.4, paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        Values should be physically consistent (e.g. mass in kg, distance in meters).
        Unrealistic/unatural combinations may cause bodies to move very fast or fly off screen. 
    </p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)'}}>
      <button type="button" onClick={addBody}>+ Add body</button>
      <button type="submit">Run</button>
      <button type="button" onClick={handleSave}>Save to gallery</button>
      {narration && !showCrawl && (
        <button onClick={() => setShowCrawl(true)} style ={ {marginBottom: '1rem'}}>Review summary</button>
      )}
    </div>
  </form>
);
}

export default CreateSystemForm;