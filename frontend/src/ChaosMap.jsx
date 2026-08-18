import { useEffect, useRef } from 'react';
import { runChaosMap } from './physics';

function ChaosMap({ baseBodies, onClose }) {
    const canvasRef = useRef(null);

      useEffect(() => { 
        console.log('ChaosMap useEffect fired, baseBodies:', baseBodies); 
        const canvas = canvasRef.current; 
        if (!canvas) return; 

        const ctx = canvas.getContext('2d'); 
        if (!ctx) return; 

        ctx.fillStyle = 'rgb(11, 14, 20)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height); 

        const runs = runChaosMap(structuredClone(baseBodies), 25, 15000, 3600, 0.15); 
        console.log('runs computed:', runs.length); 
        if (!runs || runs.length === 0) return; 

        const centerX = canvas.width / 2; 
        const centerY = canvas.height / 2; 

        const coordsList = [];
        runs.forEach((trajectory) => {
            trajectory.forEach((step) => {
                step.forEach((body) => {
                    coordsList.push(Math.abs(body.x));
                    coordsList.push(Math.abs(body.y));
                });
            });
        });

        coordsList.sort((a, b) => a - b);

        const cutoffIndex = Math.floor(coordsList.length * 0.75);
        const maxSimulatedDistance = coordsList[cutoffIndex] || 1;

        const maxCoord = maxSimulatedDistance * 1.15;
        console.log('Filtered maxCoord:', maxCoord); 

        const scaleX = (canvas.width * 0.7) / (2 * maxCoord); 
        const scaleY = (canvas.height * 0.7) / (2 * maxCoord); 
        const SCALE = Math.min(scaleX, scaleY); 
        console.log('SCALE:', SCALE); 

        const colors = ['#7DD3E8', '#E8A05C', '#E86A6A', '#8AE86A', '#C87DE8']; 
        const numBodies = baseBodies ? baseBodies.length : 0; 

        for (let bIndex = 0; bIndex < numBodies; bIndex++) { 
            runs.forEach((trajectory, runIndex) => { 
                if (!trajectory || trajectory.length === 0) return; 
            ctx.strokeStyle = colors[(runIndex + bIndex) % colors.length]; 
            ctx.globalAlpha = 0.4; 
            ctx.lineWidth = 1; 
            ctx.beginPath(); 
        
            trajectory.forEach((step, i) => { 
                const currentBody = step[bIndex]; 
                if (!currentBody) return; 

                const screenX = centerX + currentBody.x * SCALE; 
                const screenY = centerY + currentBody.y * SCALE; 

                if (i === 0) ctx.moveTo(screenX, screenY); 
                else ctx.lineTo(screenX, screenY); 
            }); 
            ctx.stroke(); 
            }); 
        } 
        ctx.globalAlpha = 1.0; 
    }, [baseBodies]);


    return (
        <div className="chaos-overlay">
            <div className="chaos-header">
                <h2>Chaos Map - 25 runs, ±0.0001% velocity variation</h2>
                <button onClick={onClose}>Close</button>
            </div>
            <canvas ref={canvasRef} width={900} height={700} style={{ background: 'var(--bg)' }} />
        </div>
    );
}

export default ChaosMap;

