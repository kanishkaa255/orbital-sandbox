# Orbital Sandbox

A 2D N-body gravity simulator in the browser. Build custom planetary systems, watch them evolve under Newtonian gravity in real time, save/load configurations through a global sidebar gallery, get an automated AI narration of how a system behaves, and visualize chaos theory by running dozens of nearly-identical copies of a system side-by-side.

**Live demo:** [orbital-sandbox-eta.vercel.app](https://orbital-sandbox-eta.vercel.app)

## What it Does

- **Build a System:** Add custom bodies by configuring true mass, position vectors, velocity components, radius, and color.
- **Real-Time Evolution:** Watch systems evolve on an HTML canvas using client-side Verlet integration with smooth trails.
- **Gallery Architecture:** Save custom systems to a global sidebar gallery and load any saved configuration directly back into the live interactive editor for modifications or replication.
- **Duplicate Detection:** The application automatically runs coordinate checking and attribute verification checks before database insertion to prevent duplicate entries from flooding the layout.
- **AI Narration:** Sends high-fidelity simulated trajectory data arrays (not just the starting states) to Claude, which synthesizes a plain-English structural description of how the bodies behave over time.
- **Chaos Map Visualizations:** Generates 25 parallel simulation tracks of the active layout with a minute random velocity variance (\(\pm 0.15\%\)). The engine calculates each track forward and superimposes all 25 paths on a translucent overlay using advanced alpha-blending—creating a stark, immediate visual demonstration of a chaotic strange attractor and sensitive dependence on initial conditions. Runs entirely in-browser. Note worth mentioning: (\(\pm 0.15\%\)) is exaggerated well beyond realistic chaos-theory scale for visual clarity in quick demos. Really, any sensitive dependence in this system emerges from pertubations many orders of magnitude

## Physics Implementation

- **Newton's Law of Gravitation:** \(O(n^2)\) pairwise force computations where every body attracts every other body across the field.
- **Velocity Verlet Integration:** The physics engine uses a high-fidelity Velocity Verlet formulation to optimize mathematical orbital stability and ensure strong energy conservation profiles (verified via integration checks in `physics/test_engine.py`).
- **Measured Energy Drift (Standard 2-Body Sun-Earth System):**
  - **Euler** (30 simulated days): Relative energy drift \(\approx 1.6 \times 10^{-7}\)
  - **Verlet** (2 simulated years): Relative energy drift \(\approx -2.08 \times 10^{-11}\)
- **Automated Verification:** Conservation of momentum and energy laws are strictly asserted via custom testing suites in CI on every single pull request to guarantee physics parity.
- **The Dual-Engine Design:** To maintain 60fps animations without flooding backend server pipelines, the engine uses two identical implementations: `physics/engine.py` (Python, leveraged by the API for server-side verification and queued prediction operations) and `frontend/src/physics.js` (JavaScript, powering real-time canvas rendering and Chaos Maps).

## Stack

Python (FastAPI) · React + Vite · Postgres (SQLAlchemy + Alembic) · Redis + RQ (Redis Queue) · Anthropic API (Claude) · Docker & Docker Compose · GitHub Actions CI

## System Architecture

```text
Browser (React, Canvas)
 ├─ Evaluates physics engine client-side for live animations + Chaos Maps
 └─ Communicates with FastAPI for: save / list / fork / duplicate-check / predict

FastAPI (api/)
 ├─ Postgres Database — Stores saved initial configurations and state intervals
 └─ Enqueues background prediction jobs onto Redis RQ

Worker (worker/)
 ├─ Polls background tasks from Redis, executing server-side physics sweeps for true trajectory maps
 └─ Interfaces with the Anthropic Claude API to generate descriptions and saves state results to Postgres
```

## Running Locally

There are two ways to run the workspace locally: **Method A (Docker Only)** or **Method B (Hybrid Developer Setup)**. Method B runs the execution layers natively on your machine, enabling fast code updates, hot-reloading, and compatibility with Windows environments.

First, pursuing either path, clone the repository and set up environment variables:
```bash
git clone https://github.com/kanishkaa255/orbital-sandbox.git
cd orbital-sandbox
```
Create a `.env` file in the project root with your Anthropic credentials:
```bash
ANTHROPIC_API_KEY=your-actual-api-key-here
```

### Method A: Full Docker Mode
This spins up the entire stack inside container network namespaces.
```bash
export ANTHROPIC_API_KEY=your-key-here
docker compose up --build
```
*Note: Run `alembic upgrade head` to initialize tables, and launch the frontend via `npm run dev` in the `/frontend` directory.*

### Method B: Hybrid Developer Setup (Hot-Reloading)
This runs persistent storage (`db`, `redis`) inside light Docker slots while spinning up your development servers directly in independent terminal instances for instant debugging logs.

1. **Spin up your storage infrastructure:**
   ```bash
   docker compose up db redis -d
   ```

2. **Initialize database schemas:**
   ```bash
   # Make sure you are in the root directory
   alembic upgrade head
   ```

3. **Launch the FastAPI application (API Layer):**
   ```bash
   # From the root directory
   export ANTHROPIC_API_KEY=your-key-here
   uvicorn api.main:app --reload
   ```
   *The API boots on `http://localhost:8000` with instant live code reloading.*

4. **Launch the Redis Queue background task worker:**
   ```bash
   # From the root directory
   rq worker --worker-class rq.worker.SimpleWorker --url redis://localhost:6379
   ```
   *Note: The `--worker-class rq.worker.SimpleWorker` flag is explicitly required to run job tasks sequentially within the active thread process. This avoids Unix fork errors, allowing the background queue to operate flawlessly across Windows and macOS architectures.*

5. **Start the React + Vite frontend dashboard:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The interface loads directly on Vite's default port `http://localhost:5173`.*


### Running Tests
```bash
# Execute structural physics and endpoint tests
pytest -v

# Run Python code formatting and linting sweeps
ruff check .
```
The automated GitHub Actions CI pipeline (`.github/workflows/ci.yml`) triggers this sequence alongside an operational multi-container Docker build validation check on every Pull Request.

## What's Not in v1

No active authentication boundaries or user profiles (saves are globally public and anonymous), no mobile viewport styling optimizations, and two-dimensional coordinate limits only.

## Deploy Status

The application’s core backend services (API, Postgres, Redis, worker) run locally via Docker Compose orchestration and are deployed in production on Railway. The client interface is continuously built and hosted live on Vercel with CORS configured for the production origin. 
Deploying surfaced real cross-service networking challenges: navigating internal-vs-public Postgres/Redis connection strings across Railway projects, and running production database migrations via the Railway CLI against a live environment. Scaling the individual service tiers into a distributed, infrastructure-managed Kubernetes architecture remains the primary structural stretch goal.

## Retro

### Technical Successes
Engineering the **Chaos Map overlay** was the most rewarding component of this project. Capturing complex physical phenomena—such as the rapid divergence of paths resulting from floating-point variations—and converting it into an elegant, multi-body alpha-blended canvas visualization felt incredibly impactful. Transitioning the core coordinate progression tracking from a basic Euler scheme to a full Velocity Verlet mathematical integrator allowed me to drop energy variance by orders of magnitude ($\approx 10^{-7}$ down to $\approx 10^{-11}$), ensuring trajectories remain stable even over massive simulation iterations.

### Architectural Tradeoffs & Challenges
The defining architectural challenge was managing the **Dual-Engine Architecture**. Replicating the exact physics calculation loop across both Python (backend worker validation) and JavaScript (frontend animations) was a conscious sacrifice made to ensure responsive client interactions without constantly hitting server networks. The cost of this choice is an engine maintenance sync constraint: updates to the mathematical calculations or collision rules must be thoroughly ported to both source files simultaneously to ensure that real-time canvas paths do not drift from server-side prediction data.

If building this system again from scratch, I would write the foundational physics core a single time using Rust or C, compiling the codebase down into a centralized WebAssembly (WASM) binary package. This would provide high-performance, native-speed processing cycles within the frontend canvas while permitting the exact same calculation package to be imported directly into the Python backend API—eliminating parity drift concerns entirely while securing a completely unified codebase.

