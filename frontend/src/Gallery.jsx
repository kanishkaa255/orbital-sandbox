import { useEffect, useState } from 'react';

function Gallery({ onSimulationLoaded }) {
  const [simulations, setSimulations] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/simulations')
      .then(res => res.json())
      .then(data => setSimulations(data));
  }, []);

  function handleLoad(sim) {
    onSimulationLoaded(sim);
  }

  return (
    <ul className = "gallery-list">
      {simulations.map(sim => {
        const bodyCount = sim.config.bodies.length;
        const totalMass = sim.config.bodies.reduce((sum, b) => sum + b.mass, 0);
        return(
          <li key={sim.id} className="gallery-item">
            <div className="gallery-item-header">
              <span className="gallery-item-name">{sim.name}</span>
              <button onClick={() => handleLoad(sim)}>Load</button>
            </div>
            <div className="gallery-item-details">
              ID {sim.id}, {bodyCount} {bodyCount === 1 ? 'body' : 'bodies'}, Total Mass: {totalMass.toExponential(2)} kg
              {sim.forked_from_id && 'forked from #' + sim.forked_from_id}
            </div>
          </li>
        )
      })}
    </ul>
  );
}
export default Gallery;