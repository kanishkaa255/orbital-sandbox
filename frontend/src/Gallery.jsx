import { useEffect, useState } from 'react';

function Gallery({ onSimulationLoaded }) {
  const [simulations, setSimulations] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/simulations')
      .then(res => res.json())
      .then(data => setSimulations(data));
  }, []);

  function handleLoad(sim) {
    onSimulationLoaded(sim.config.bodies);
  }

  return (
    <div>
      <h3>Saved Systems</h3>
      <ul>
        {simulations.map(sim => (
          <li key={sim.id}>
            {sim.name} (id: {sim.id})
            <button onClick={() => handleLoad(sim)}>Load</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Gallery;