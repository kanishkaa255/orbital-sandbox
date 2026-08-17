import { useEffect, useRef } from 'react';
import { runChaosMap } from './physics';

function ChaosMap({ baseBodies, onClose }){
    const canvasRef = useRef(null);

    useEffect(() => {
        console.log('ChaosMap useEffect fired, baseBodies:', baseBodies);
        const canvas = canvasRef.current;
        if (!canvas) return;

        console.log('canvas element:', canvas);
        console.log('is canvas in document?', document.contains(canvas));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.fillRect(50, 50, 200, 200);
        console.log('red square drawn');
        ctx.fillStyle = 'rgb(11, 14, 20)';
        ctx.fillRect(0,0, canvas.width, canvas.height);

        const runs = runChaosMap(structuredClone(baseBodies), 25, 15000, 3600, 1e-1);
        console.log('runs computed:', runs.length);;
        if (!runs || runs.length === 0) return;

        let maxInitialDistance = 1;
        baseBodies.forEach(b => {
            maxInitialDistance = Math.max(maxInitialDistance, Math.abs(b.x), Math.abs(b.y));
        });

        const centerX = canvas.width/2;
        const centerY = canvas.height/2;
        const allPositions = runs.flat().flatMap(step => step.map(b => Math.max(Math.abs(b.x), Math.abs(b.y))));
        const maxCoord = maxInitialDistance * 3.5;
        console.log('maxCoord:', maxCoord);
        const scaleX = (canvas.width * 0.7) / (2 * maxCoord);
        const scaleY = (canvas.height * 0.7) / (2 * maxCoord);
        const SCALE = Math.min(scaleX, scaleY);
        console.log('SCALE:', SCALE);

        const colors = ['#7DD3E8', '#E8A05C', '#E86A6A', '#8AE86A', '#C87DE8'];

        runs.forEach((trajectory, runIndex) => {
            if (!trajectory || trajectory.length === 0) return;

            const firstStep = trajectory[0];
            const numBodies = firstStep ? firstStep.length : 0;

            const bodyIndex = 0;
            ctx.strokeStyle = colors[runIndex % colors.length];
            ctx.globalAlpha = 1;
            ctx.lineWidth = 1;
            ctx.beginPath();
            trajectory.forEach((step, i) => {
                const currentBody = step[bodyIndex];
                const screenX = centerX + currentBody.x * SCALE;
                const screenY = centerY + currentBody.y * SCALE;
                if (i === 0) ctx.moveTo(screenX, screenY);
                else ctx.lineTo(screenX, screenY);
            });
            ctx.stroke();
        });
        ctx.globalAlpha = 1.0;
        console.log('drawing complete');
    }, [baseBodies]);
    

    return (
        <div className = "chaos-overlay">
            <div className = "chaos-header">
                <h2>Chaos Map - 25 runs, ±0.0001% velocity variation </h2>
                <button onClick = {onClose}>Close</button>
            </div>
            <canvas ref = {canvasRef} width={900} height={700} style={{ background: 'var(--bg)'}} />
        </div>
    );
}

export default ChaosMap;

