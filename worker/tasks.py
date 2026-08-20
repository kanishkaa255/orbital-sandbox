import os
import sys

from api.models import Simulation

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import math

from anthropic import Anthropic
from dotenv import load_dotenv

from api.db import SessionLocal
from physics.engine import Body, step

#DATABASE_URL = "postgresql://orbital_user:orbital_pass@localhost:5432/orbital_db"
#engine = create_engine(DATABASE_URL)
#SessionLocal = sessionmaker(bind=engine)

load_dotenv()
client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])


def analyze_simulation(config, num_steps=1000, dt=3600):
    bodies = [
        Body(name=b.get("name", f"body_{i}"), mass=b["mass"], x=b["x"], y=b["y"], vx=b["vx"], vy=b["vy"])
        for i, b in enumerate(config["bodies"])
    ]

    initial_distances = _distances_from_center_of_mass(bodies)

    for _ in range(num_steps):
        step(bodies, dt)

    final_distances = _distances_from_center_of_mass(bodies)

    summary = []
    for i, body in enumerate(bodies):
        growth = final_distances[i] / initial_distances[i] if initial_distances[i] > 0 else 1
        summary.append({
            "name": body.name,
            "mass": body.mass,
            "initial_distance_from_center": initial_distances[i],
            "final_distance_from_center": final_distances[i],
            "distance_growth_ratio": growth,
        })

    return summary


def _distances_from_center_of_mass(bodies):
    total_mass = sum(b.mass for b in bodies)
    com_x = sum(b.mass * b.x for b in bodies) / total_mass
    com_y = sum(b.mass * b.y for b in bodies) / total_mass
    return [math.hypot(b.x - com_x, b.y - com_y) for b in bodies]


def generate_narration(summary):
    body_descriptions = []
    for b in summary:
        body_descriptions.append(
            f"- {b['name']} (mass {b['mass']:.2e} kg): distance from system center changed "
            f"by a factor of {b['distance_growth_ratio']:.3f} over the simulated period"
        )

    prompt = (
        "You are narrating the behavior of an N-body gravitational simulation for a general audience. "
        "Based on the following computed data, write a short (2-3 sentence) plain-English description "
        "of what's happening to this system. Do not invent numbers not given below.\n\n"
        + "\n".join(body_descriptions)
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=200,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text

def run_prediction_job(simulation_id):
    from api.models import Simulation

    db = SessionLocal()
    try:
        sim = db.query(Simulation).filter(Simulation.id == simulation_id).first()
        if sim is None:
            return

        summary = analyze_simulation(sim.config)
        narration = generate_narration(summary)

        sim.ai_narration = narration
        sim.ai_narration_status = "complete"
        db.commit()
    finally:
        db.close()

def mark_prediction_failed(job, connection, type, value, traceback):
    simulation_id = job.args[0]
    db = SessionLocal()
    try:
        sim = db.query(Simulation).filter(Simulation.id == simulation_id).first()
        if sim:
            sim.ai_narration_status = "failed"
            db.commit()
    finally:
        db.close()