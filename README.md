# 🌱 EcoStep Premium: Carbon Footprint Tracker & Insights

EcoStep Premium is an interactive, gamified single-page React web application designed to help individuals calculate, track, and offset their carbon footprint through simple actions and rules-based advisor audits.

🔗 **Production Deployment URL:** [https://ecostep-premium-955161174564.us-central1.run.app](https://ecostep-premium-955161174564.us-central1.run.app)

---

## 🏛️ Project Architecture Diagram

The application is structured as a component-driven client-side SPA persistence layer running inside a containerized Nginx web server, built in the cloud via GCP Cloud Build, and hosted serverless on GCP Cloud Run.

```mermaid
graph TD
    subgraph Client Browser
        A[React App Shell src/App.tsx]
        A --> B[Dashboard Component]
        A --> C[Log Calculator Form]
        A --> D[Offset Simulator]
        A --> E[Advisor Hub & Challenges]
        A --> F[LocalStorage Persistence]
        
        B -->|Gross vs Target Budget| B1[Circular Eco Gauge]
        B -->|Category Breakdown| B2[Responsive Bar Chart]
        C -->|15 XP & Logging| A
        D -->|Simulated Trees/Energy/Ocean| D1[Net Footprint Calc]
        E -->|Challenge Complete| E1[Unlock Badges & Gain XP]
    end

    subgraph GCP Production Environment
        G[GCP Cloud Run Service]
        G -->|Serves Static Files| Client
        H[Nginx Web Server Container]
        H -->|Hosts SPA| G
        I[Artifact Registry]
        I -->|Stores Docker Images| H
    end

    subgraph CI/CD & Deploy Flow
        J[Local Workspace Source] -->|gcloud CLI run deploy| K[GCP Cloud Build]
        K -->|Compiles TypeScript & Bundles| I
    end
```

---

## 🔄 Core Workflows

### 1. Carbon Tracking & Gamification Flow

When a user logs a carbon footprint activity, emissions are computed using static coefficients, and XP status and badge criteria are dynamically updated.

```mermaid
sequenceDiagram
    autonumber
    User->>Log Calculator: Selects category & inputs value (e.g. 50km Petrol Car)
    Log Calculator->>Emission Factors: Fetches conversion factor (0.18 kg CO2e/km)
    Emission Factors-->>Log Calculator: Computes 9.0 kg CO2e
    Log Calculator->>App Shell: Dispatches action (log object + 15 XP)
    App Shell->>LocalStorage: Saves updated logs & profile state
    App Shell->>Badge Engine: Re-evaluates criteria (logs count >= 5? offset > 100kg?)
    Badge Engine-->>App Shell: Unlocks badge if criteria met
    App Shell->>UI: Re-renders Dashboard, budget rings, and advisor tips
```

### 2. Offsetting & Net-Zero Flow

Users can simulate offsetting projects (planting trees, investing in solar grids) to actively reduce their net emissions metrics.

```mermaid
sequenceDiagram
    autonumber
    User->>Offset Simulator: Drags sliders (e.g., Plant 10 Trees)
    Offset Simulator->>Offset Formulas: Computes avoided carbon (22kg/tree * 10 = 220kg CO2e)
    Offset Simulator->>App Shell: Commits simulated offsets to Profile
    App Shell->>LocalStorage: Updates Profile offsets state
    App Shell->>UI: Deducts Offset from Gross emissions (Net = Gross - Offset)
    UI-->>User: Renders green "Net-Zero Status" if net carbon equals 0
```

---

## 🛠️ Technology Stack
*   **Framework**: React (Vite) with TypeScript.
*   **Styling**: Premium nature-themed custom CSS variables, glassmorphic card overlays, glowing indicator gauges, and transitions.
*   **Calculations**: Pre-configured global average coefficients for cars, public transit, flights, electricity grids, heating fuels, diets, and consumer shopping items.
*   **GCP Configurations**: Multi-stage `Dockerfile` and `nginx.conf` routing setups for URL fallbacks.

---

## 🚀 Local Setup & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sahil138-psk/ecostep-premium.git
   cd ecostep-premium
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local dev server:**
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your web browser.*

4. **Production Build compilation:**
   ```bash
   npm run build
   ```

---

## ☁️ Deploying to GCP Cloud Run
Refer to [gcp-deploy.md](gcp-deploy.md) for full commands. The simplest build-from-source command is:
```bash
gcloud run deploy ecostep-premium --source . --region us-central1 --allow-unauthenticated --port 8080 --project YOUR_PROJECT_ID
```
