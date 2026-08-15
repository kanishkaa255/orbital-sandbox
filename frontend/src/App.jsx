import { useEffect, useRef, useState } from 'react';
import { step, computeScale } from './physics';
import CreateSystemForm from './CreateSystemForm';
import Gallery from './Gallery';
import './App.css';
import Crawl from './Crawl';

function App() {
  const canvasRef = useRef(null);
  const [activeBodies, setActiveBodies] = useState([]);
  const [narration, setNarration] = useState('');
  const [showCrawl, setShowCrawl] = useState(false);
  const[analyzing, setAnalyzing] = useState(false);

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

  return (
  <div className="app-shell">
    <header className="app-header">
      <h1 className="app-title">Orbital <span>Sandbox</span></h1>
    </header>
    <aside className="sidebar">
      <div className="panel-section">
        <div className="panel-label">Bodies</div>
        <CreateSystemForm 
          onSimulationCreated={setActiveBodies}
          onAnalysisStart={() => {
            console.log('analysis started');
            setAnalyzing(true);
          }}
          onPredictionReady={(text) => { 
            setAnalyzing(false);
            setNarration(text); 
            setShowCrawl(true); 
          }}
        />
        {analyzing && <p style = {{color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>Analyzing system...</p>}
        {narration && !showCrawl && (
          <button onClick={() => setShowCrawl(true)}> Review summary </button>
        )}
      </div>
      <div className="panel-section">
        <div className="panel-label">Saved Systems</div>
        <Gallery onSimulationLoaded={setActiveBodies} />
      </div>
    </aside>
    <main className="canvas-area">
      <canvas ref={canvasRef} width={800} height={600} style={{ background: 'var(--bg)', border: '1px solid var(--border)' }} />
    </main>
    {showCrawl && <Crawl text={narration} onFinished={() => setShowCrawl(false)} />}
  </div>
  );
}

export default App;