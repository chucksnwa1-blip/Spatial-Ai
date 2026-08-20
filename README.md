# SpatialAI Studio

SpatialAI Studio is an interactive, enterprise-grade AI 3D Spatial Computing & CAD Asset Generator. It translates natural language prompts and parametric engineering specifications into real-time interactive 3D models with Finite Element Analysis (FEA) diagnostics, multi-platform XR compliance checks, Cloud Firestore persistence, Firebase Authentication, and CAD export pipelines.

---

## Key Capabilities & Architecture

### 1. Interactive 3D WebGL Engine (Three.js / React Three Fiber)
- **High-Performance Rendering**: 60 FPS viewport powered by Three.js, `@react-three/fiber`, and `@react-three/drei`.
- **Parametric Assembly Explode**: Custom assembly exploded-view slider to inspect multi-part internal components.
- **Interactive 3D Caliper Ruler**: Real-time vertex-to-vertex and surface distance measurement tool with Delta X/Y/Z readouts.
- **Dynamic Lighting Rigs**: Studio Neutral, Cyberpunk Neon, Industrial Rig, Sunset Warmth, and Deep Space presets.
- **Touch & Mobile Optimized**: Clean touch gesture controls without browser pull-to-refresh or tap borders.

### 2. Generative AI & Spatial Diagnostics
- **Gemini 2.5 / 3.7 Flash Engine**: Backend proxy endpoint (`/api/generate-asset` and `/api/refine-asset`) for generating procedural geometries, PBR materials, and subcomponents from natural language.
- **Finite Element Analysis (FEA) Telemetry**: Real-time yield strength, load tolerance, and safety factor calculations.
- **XR Platform Budget Checks**: Automated compliance checks for Apple Vision Pro (visionOS), Meta Quest 3 (OpenXR), and WebXR.
- **AI Refinement Copilot**: Conversational assistant to tweak dimensions, materials, and structural properties.

### 3. Cloud Persistence & User Management
- **Firebase Authentication**: Google Sign-In and Email/Password with real-time profile management and role assignment (`Lead Architect`, `CAD Engineer`, `Viewer`).
- **Cloud Firestore Database**: Persistent storage for personal 3D models, configuration states, and public CAD asset libraries.
- **Zero-Trust ABAC Security**: Deployed Firestore rules restricting reads/writes based on authenticated ownership.

### 4. CAD Export & Deployment
- **Export Pipelines**: Single-click export to **GLTF 2.0 (.gltf)**, **GLB Binary (.glb)**, **Wavefront (.obj)**, and full **Engineering Metadata Packages (.json)**.
- **WebXR VR Mode**: Spatial computing preview mode with stereoscopic inspection guidance.
- **Full-Stack API Routes**: Standalone Express server bundled with esbuild into CommonJS (`dist/server.cjs`).

---

## Local Development & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/spatial-ai-studio.git
cd spatial-ai-studio

# Install dependencies
npm install

# Run the development server
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Environment Variables

Copy `.env.example` to `.env`:
```env
GEMINI_API_KEY="your-google-gemini-api-key"
APP_URL="http://localhost:3000"
```

---

## Deploying to GitHub & Vercel

### Step 1: Push to GitHub

1. Initialize git and commit:
```bash
git init
git add .
git commit -m "feat: initial release of SpatialAI Studio"
```

2. Create a new repository on [GitHub](https://github.com/new).

3. Link and push to GitHub:
```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

---

### Step 2: Deploy to Vercel

1. **Sign in to Vercel**: Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. **Import Git Repository**: Select the GitHub repository you just pushed.
3. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Add Environment Variables** (in Vercel Project Settings -> Environment Variables):
   - `GEMINI_API_KEY`: Your Gemini API Key from Google AI Studio.
5. **Click Deploy**: Vercel will automatically build and provide a live production URL (e.g., `https://spatial-ai-studio.vercel.app`).
