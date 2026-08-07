import { useEffect, useRef, useState } from 'react';
import { step, computeScale } from './physics';
import CreateSystemForm from './CreateSystemForm';
import Gallery from './Gallery';

function App() {
  const canvasRef = useRef(null);
  const [activeBodies, setActiveBodies] = useState([]);

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

    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
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

  animate();

  return () => cancelAnimationFrame(animationId);
}, [activeBodies]);

  return (
    <>
      <CreateSystemForm onSimulationCreated={setActiveBodies} />
      <Gallery onSimulationLoaded={setActiveBodies} />
      <canvas ref={canvasRef} width={800} height={600} style={{ background: 'black' }} />
    </>
  );
}

export default App;