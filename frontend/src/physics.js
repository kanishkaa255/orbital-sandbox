function computeAcceleration(body, other) {
    const G = 6.674e-11;

    const dx = other.x - body.x;
    const dy = other.y - body.y;
    
    const r_squared = dx**2 + dy**2;
    const r = Math.sqrt(r_squared);

    const f = G * body.mass * other.mass / r_squared;

    const fx = f * (dx / r);
    const fy = f * (dy / r);

    const ax = fx / body.mass;
    const ay = fy / body.mass;
    return {ax, ay};
}

function computeAllAccelerations(bodies) {
    const accelerations = bodies.map(body => {
        let totalAx = 0;
        let totalAy = 0;
        for (const other of bodies) {
            if (body !== other) {
                const {ax, ay} = computeAcceleration(body, other);
                totalAx += ax;
                totalAy += ay;
            }
        }
        return { ax: totalAx, ay: totalAy };
    });
    return accelerations;
}

export function step(bodies, dt) {
    const accelerations = computeAllAccelerations(bodies);
    
    for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        const { ax, ay } = accelerations[i];
        
        body.x += body.vx * dt + 0.5 * ax * dt ** 2;
        body.y += body.vy * dt + 0.5 * ay * dt ** 2;

        body._oldAx = ax;
        body._oldAy = ay;
    }

    const new_accelerations = computeAllAccelerations(bodies);

    for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        const newAx = new_accelerations[i].ax;
        const newAy = new_accelerations[i].ay;

        body.vx += 0.5 * (body._oldAx + newAx) * dt;
        body.vy += 0.5 * (body._oldAy + newAy) * dt;
  }
}

export function computeScale(bodies, canvasWidth, canvasHeight) {
  const maxCoord = Math.max(
    ...bodies.map(b => Math.hypot(b.x, b.y)),
    1
  );
  const padding = 0.8;
  const scaleX = (canvasWidth * padding) / (2 * maxCoord);
  const scaleY = (canvasHeight * padding) / (2 * maxCoord);
  return Math.min(scaleX, scaleY);
}

export function runChaosMap(baseBodies, numRuns, numSteps, dt, perturbation = 1e-6){
    const runs = [];
    for(let r=0; r< numRuns; r++) {
        const bodies = baseBodies.map(b=> ({
            ...b,
            vx: b.vx * (1 + (Math.random() - 0.5) * perturbation),
            vy: b.vy * (1 + (Math.random() - 0.5) * perturbation),
        }));

        const trajectory = [];
        for (let s = 0; s< numSteps; s++){
            step(bodies, dt);
            trajectory.push(bodies.map(b =>({ x: b.x, y: b.y})));
        }
        runs.push(trajectory);
    }
    return runs;
}
