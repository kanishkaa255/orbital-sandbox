import { useState } from 'react';

function CreateSystemForm({ onSimulationCreated }) {
  const [bodies, setBodies] = useState([
  { mass: '', x: '', y: '', vx: '', vy: '', radius: '', color: '' }
]);

function updateBody(index, field, value) {
  const newBodies = [...bodies];
  newBodies[index] = { ...newBodies[index], [field]: value };
  setBodies(newBodies);
}

function addBody() {
  setBodies([...bodies, { mass: '', x: '', y: '', vx: '', vy: '', radius: '', color: '' }]);
}
async function handleSubmit(e) {
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

  const response = await fetch('http://127.0.0.1:8000/simulations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'user-created system', config: { bodies: parsedBodies } }),
  });

  const data = await response.json();
  onSimulationCreated(data.config.bodies); 
}

  return (
  <form onSubmit={handleSubmit}>
    {bodies.map((body, index) => (
      <div key={index}>
        <input type="text" value={body.mass} onChange={(e) => updateBody(index, 'mass', e.target.value)} placeholder="mass" />
        <input type="text" value={body.x} onChange={(e) => updateBody(index, 'x', e.target.value)} placeholder="x" />
        <input type="text" value={body.y} onChange={(e) => updateBody(index, 'y', e.target.value)} placeholder="y" />
        <input type="text" value={body.vx} onChange={(e) => updateBody(index, 'vx', e.target.value)} placeholder="vx" />
        <input type="text" value={body.vy} onChange={(e) => updateBody(index, 'vy', e.target.value)} placeholder="vy" />
        <input type="text" value={body.radius} onChange={(e) => updateBody(index, 'radius', e.target.value)} placeholder="radius" />
        <input type="text" value={body.color} onChange={(e) => updateBody(index, 'color', e.target.value)} placeholder="color" />
      </div>
    ))}
    <button type="button" onClick={addBody}>+ Add body</button>
    <button type="submit">Save</button>
  </form>
);
}

export default CreateSystemForm;