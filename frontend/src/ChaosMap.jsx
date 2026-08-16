import { useEffect, useRef } from 'react';
import { runChaosMap } from './physics';

function ChaosMap({ baseBodies, onClose }){
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgb(11, 14, 20)';
        ctx.fillRect(0,0, canvas.width, canvas.height);

        const runs = runChaosMap(structuredClone(baseBodies), 25, 15000, 3600, 1e-1);

        const centerX = canvas.width/2;
        const centerY = canvas.height/2;
        const allPositions = runs.flat().flatMap(step => step.map(b => Math.max(Math.abs(b.x), Math.abs(b.y))));
        const maxCoord = allPositions.reduce((max, val) => Math.max(max,val), 1);
        const scaleX = (canvas.width * 0.7) / (2 * maxCoord);
        const scaleY = (canvas.height * 0.7) / (2 * maxCoord);
        const SCALE = Math.min(scaleX, scaleY);

        const colors = ['#7DD3E8', '#E8A05C', '#E86A6A', '#8AE86A', '#C87DE8'];

        runs.forEach((trajectory, runIndex) => {
            const bodyIndex = 0;
            ctx.strokeStyle = colors[runIndex % colors.length];
            ctx.globalAlpha = 1;
            ctx.lineWidth = 1;
            ctx.beginPath();
            trajectory.forEach((step, i) => {
                const screenX = centerX + step[bodyIndex].x * SCALE;
                const screenY = centerY + step[bodyIndex].y * SCALE;
                if (i === 0) ctx.moveTo(screenX, screenY);
                else ctx.lineTo(screenX, screenY);
            });
            ctx.stroke();
        });
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

