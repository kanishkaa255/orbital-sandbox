import pytest
from .engine import Body, step, G

def test_momentum_conservation():
    sun = Body(name="sun", mass=1.989e30, x=0, y=0, vx=0, vy=0, radius=10)
    earth = Body(name="earth", mass=5.972e24, x=1.496e11, y=0, vx=0, vy=29780, radius=2)

    bodies = [sun, earth]
    initial_xmomentum = sum(body.mass * body.vx for body in bodies)
    initial_ymomentum = sum(body.mass * body.vy for body in bodies)
    dt = 3600  # one hour, in seconds

    for i in range(24 * 30):  # simulate ~30 days
        step(bodies, dt)

    final_xmomentum = sum(body.mass * body.vx for body in bodies)
    final_ymomentum = sum(body.mass * body.vy for body in bodies)

    assert final_xmomentum == pytest.approx(initial_xmomentum, abs=1e18)
    assert final_ymomentum == pytest.approx(initial_ymomentum, abs=1e18)

def test_energy_conservation():
    sun = Body(name="sun", mass=1.989e30, x=0, y=0, vx=0, vy=0, radius=10)
    earth = Body(name="earth", mass=5.972e24, x=1.496e11, y=0, vx=0, vy=29780, radius=2)

    bodies = [sun, earth]
    dt = 3600  # one hour, in seconds

    def total_energy(bodies):
        kinetic = sum(0.5 * body.mass * (body.vx**2 + body.vy**2) for body in bodies)
        potential = 0
        for i in range(len(bodies)):
            for j in range(i + 1, len(bodies)):
                dx = bodies[j].x - bodies[i].x
                dy = bodies[j].y - bodies[i].y
                r = (dx**2 + dy**2) ** 0.5
                potential -= G * bodies[i].mass * bodies[j].mass / r
        return kinetic + potential

    initial_energy = total_energy(bodies)

    for i in range(24 * 3665 * 2):  # simulate 2 years
        step(bodies, dt)

    final_energy = total_energy(bodies)

    rel_diff = abs(final_energy - initial_energy) / initial_energy #added for testing
    print(f"\nrelative energy drift: {rel_diff:.6e}")

    assert final_energy == pytest.approx(initial_energy, rel=1e-3)
    #Euler drift over 30 days: 1.6e-7 relative