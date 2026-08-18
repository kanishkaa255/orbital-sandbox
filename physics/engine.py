from dataclasses import dataclass

G = 6.674e-11  #gravitational constant

@dataclass
class Body:
    name: str
    mass: float
    x: float
    y: float
    vx: float
    vy: float
    radius: float = 1.0
    color: str = "white"


def compute_acceleration(body: Body, other: Body):
    """Acceleration on `body` due to `other body`, using F = G*m1*m2/r^2."""
    dx = other.x - body.x
    dy = other.y - body.y
    r_squared = dx**2 + dy**2
    EPSILON_SQ = 5e9**2 
    r = (r_squared + EPSILON_SQ) ** 0.5 

    # force magnitude
    f = G * body.mass * other.mass / (r_squared + EPSILON_SQ)

    # break force into x and y components
    fx = f * (dx / r)
    fy = f * (dy / r)

    # a = F / m
    ax = fx / body.mass
    ay = fy / body.mass
    return ax, ay

def compute__all_accelerations(bodies: list[Body]):
    accelerations = []
    for body in bodies:
        ax_total, ay_total = 0.0, 0.0
        for other in bodies: #make sure its not the same one
            if other is body:
                continue
            ax, ay = compute_acceleration(body, other)
            ax_total += ax
            ay_total += ay
        accelerations.append((ax_total, ay_total))
    return accelerations



def step(bodies: list[Body], dt: float):
    """Advance the whole system by one timestep, in place."""
    #compute total acceleration on each body from every other body
    accelerations = compute__all_accelerations(bodies)

    #Update velocity FIRST, then position using the NEW velocity
    # semi-implicit Euler
    #for body, (ax, ay) in zip(bodies, accelerations):
        #body.vx += ax * dt
        #body.vy += ay * dt
        #body.x += body.vx * dt
        #body.y += body.vy * dt


        # Update position using current velocity and acceleration
    for body, (ax, ay) in zip(bodies, accelerations):
        body.x += body.vx * dt + 0.5 * ax * dt**2
        body.y += body.vy * dt + 0.5 * ay * dt**2

    new_accelerations = compute__all_accelerations(bodies)  # Compute new acceleration after position update

    # Update velocity using the new acceleration
    for body, (ax, ay), (ax_new, ay_new) in zip(bodies, accelerations, new_accelerations):
        body.vx += 0.5 * (ax + ax_new) * dt
        body.vy += 0.5 * (ay + ay_new) * dt