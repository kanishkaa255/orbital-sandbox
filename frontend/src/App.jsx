import { useEffect, useRef, useState } from 'react';
import { step, computeScale } from './physics';
import CreateSystemForm from './CreateSystemForm';
import Gallery from './Gallery';
import './App.css';
import Crawl from './Crawl';
import ChaosMap from './ChaosMap';

function App() {
  const canvasRef = useRef(null);
  const [activeBodies, setActiveBodies] = useState([]);
  const [narration, setNarration] = useState('');
  const [showCrawl, setShowCrawl] = useState(false);
  const[analyzing, setAnalyzing] = useState(false);
  const[formBodies, setFormBodies] = useState([
    { name: '', mass: '', x: '', y: '', vx: '', vy: '', radius: '', color: ''}
  ]);
  const [formName, setFormName] = useState('');
  const[showChaosMap, setShowChaosMap] = useState(false);

  useEffect(() => {
  if (activeBodies.length === 0) return;
  console.log('animating with bodies:', JSON.stringify(activeBodies));
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  let animationId;

  function animate() {
    for (let i = 0; i < 12; i++) {
      //step(activeBodies, 1200);
      step(activeBodies, 3600); // 1 hour per step
    }

    const SCALE = computeScale(activeBodies, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(11, 14, 20, 0.12)'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const body of activeBodies) {
      const screenX = centerX + body.x * SCALE;
      const screenY = centerY + body.y * SCALE;
      const displayRadius = (body.radius || 1) * 4;
      ctx.beginPath();
      ctx.arc(screenX, screenY, displayRadius, 0, 2 * Math.PI);
      ctx.fillStyle = body.color || 'white';
      ctx.fill();
    }

    animationId = requestAnimationFrame(animate);
  }
  console.log('canvas dimensions:', canvas.width, canvas.height);
  ctx.fillStyle = 'rgb(11, 14, 20)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  console.log('solid navy fill applied');

  animate();

  return () => cancelAnimationFrame(animationId);
}, [activeBodies]);

function handleLoadSimulation(sim) {
  setActiveBodies(sim.config.bodies);
  const source = sim.initial_config?.bodies || sim.config.bodies;
  const formattedBodies = source.map(b => ({
    name: b.name || '',
    mass: String(b.mass || ''),
    x: String(b.x),
    y: String(b.y),
    vx: String(b.vx),
    vy: String(b.vy),
    radius: String(b.radius || ''),
    color: b.color || '',
  }));
  setFormBodies(formattedBodies);
  setFormName(sim.name + '(loaded)');
}

  return (
  <div className="app-shell">
    <header className="app-header">
      <h1 className="app-title">Orbital <span>Sandbox</span></h1>
    </header>
    <aside className="sidebar">
      <div className="panel-section">
        <div className="panel-label">Bodies</div>
        <CreateSystemForm 
          bodies={formBodies}
          setBodies={setFormBodies}
          systemName={formName}
          setSystemName={setFormName}
          onSimulationCreated={setActiveBodies}
          onAnalysisStart={() => {
            setAnalyzing(true);
          }}
          onPredictionReady={(text) => { 
            setAnalyzing(false);
            setNarration(text); 
            setShowCrawl(true); 
          }}
          onDuplicateFound = {
            handleLoadSimulation
          }
            narration={narration}
            showCrawl={showCrawl}
            setShowCrawl={setShowCrawl}
        />
        {analyzing && <p style = {{color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Analyzing system...</p>}
        <div style={{marginBottom:'1rem', marginTop: '1rem', borderBottom: '1px solid var(--border)'}}>
          <button onClick={() => setShowChaosMap(true)} style ={{width: '100%', marginBottom: '1rem', background: '#C837E8',  color: '#ffffff', border: '1px solid #C837E8', 
            boxShadow: '0 0 8px #C837E8, 0 0 16px rgba(200, 55, 232, 0.5)', fontWeight: 600, }}>Chaos Map</button>
        </div>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-dim)', marginTop: '1rem', paddingBottom: '1rem', lineHeight: 1.4, borderBottom: '1px solid var(--border)' }}>
            Chaos Map runs 25 nearly-identical copies of this system with tiny random variations, showing how small differences can lead to wildly different outcomes, visually demonstrating chaos theory!
        </p>
      </div>
      <div className="panel-section">
        <div className="panel-label">Saved Systems</div>
        <Gallery onSimulationLoaded={handleLoadSimulation} />
      </div>
    </aside>
    <main className="canvas-area">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        style={{ 
          background: 'var(--bg)', 
          border: '1px solid var(--border)',
          maxWidth: '100%',
          maxHeight: '100%',
          width: 'auto',
          height: 'auto',
        }} 
      />
    </main>
    {showCrawl && <Crawl text={narration} onFinished={() => setShowCrawl(false)} />}
    {showChaosMap && <ChaosMap baseBodies={formBodies.map((b, i) => ({
      name: b.name || `body_${i}`,
      mass: parseFloat(b.mass),
      x: parseFloat(b.x),
      y: parseFloat(b.y),
      vx: parseFloat(b.vx),
      vy: parseFloat(b.vy),
      radius: parseFloat(b.radius),
      color: b.color,
    }))} onClose={() => setShowChaosMap(false)} />}
  </div>
  );
}

export default App;