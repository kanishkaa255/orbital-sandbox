from engine import Body, step

# a heavy "star" at the center, a light "planet" given sideways velocity
sun = Body(name="sun", mass=1.989e30, x=0, y=0, vx=0, vy=0, radius=10)
earth = Body(name="earth", mass=5.972e24, x=1.496e11, y=0, vx=0, vy=29780, radius=2)
moon = Body(name="moon", mass=7.348e22, x=1.496e11 + 3.844e8, y=0, vx=0, vy=29780 + 1022, radius=1)

bodies = [sun, earth, moon]
dt = 3600  # one hour, in seconds

for i in range(24 * 30):  # simulate ~30 days
    step(bodies, dt)

print(f"Earth position after 30 days: x={earth.x:.3e}, y={earth.y:.3e}")
print(f"Earth velocity: vx={earth.vx:.3e}, vy={earth.vy:.3e}")
print(f"Moon position after 30 days relative to Earth: x={moon.x - earth.x:.3e}, y={moon.y - earth.y:.3e}")
print(f"Moon velocity: vx={moon.vx:.3e}, vy={moon.vy:.3e}")