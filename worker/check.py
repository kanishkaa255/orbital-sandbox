from tasks import analyze_simulation, generate_narration

config = {
    "bodies": [
        {"mass": 1.989e30, "x": 0, "y": 0, "vx": 0, "vy": 0},
        {"mass": 5.972e24, "x": 1.496e11, "y": 0, "vx": 0, "vy": 29780},
    ]
}

summary = analyze_simulation(config, num_steps=1000, dt=3600)
narration = generate_narration(summary)
print(narration)