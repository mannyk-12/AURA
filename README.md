<div align="center">
  <div style="background: radial-gradient(circle at 50% 50%, #101726 0%, #0A0F1A 100%); padding: 40px; border-radius: 20px; color: white;">
    <h1 style="font-size: 3rem; margin: 0; font-family: 'Space Grotesk', sans-serif;">AURA</h1>
    <p style="font-size: 1.5rem; margin-top: 10px; color: #94a3b8;">Unified Campus Intelligence Dashboard</p>
  </div>
</div>

<br/>

**AURA (AI Unified Resource Assistant)** is an enterprise-grade, multi-agent AI campus dashboard. It solves the fragmentation of university portals by centralizing library databases, cafeteria menus, academic schedules, and campus events into a single, cohesive, conversational interface driven by Google Gemini.

### 🌐 **Live Demo:** [https://aura-dashboard-118861957249.europe-west1.run.app](https://aura-dashboard-118861957249.europe-west1.run.app)

---

## ✨ Comprehensive Feature Set

### 1. Generative UI (UI-as-a-Service)
AURA transcends traditional text-based AI. When a user queries their data, the LLM determines the most appropriate visual response and streams interactive React Server Components directly into the chat:
- **Academics Cards:** Displays class schedules, exams with dates, weightages, and locations.
- **Library Cards:** Shows book availability, exact shelf locations, floors, and categories.
- **Cafeteria Cards:** Renders daily menus with caloric values and pricing.
- **Event Cards:** Showcases upcoming events, timings, organizing clubs, and registration links.

### 2. Multi-Agent MCP Architecture
AURA abandons the monolithic API pattern. Instead, it utilizes the **Model Context Protocol (MCP)** to orchestrate 4 entirely independent Node.js microservices. Gemini dynamically routes queries to the appropriate specialized server:
- `mcp-academics`: Manages structured data for class schedules, exams, and syllabus details.
- `mcp-cafeteria`: Manages daily menus and handles caloric sorting across the entire campus dining database.
- `mcp-events`: Handles event schedules and registration links.
- `mcp-library`: Queries the book inventory and tracks checkouts.

### 3. Glassmorphic User Experience
The frontend is built with a highly polished "deep space" dark mode aesthetic. It features dynamic CSS particle backgrounds, responsive grid layouts, skeleton loading states, and hardware-accelerated animations using Tailwind CSS.

### 4. Enterprise Auth & Real-Time Sync
- **Firebase Auth:** Custom Google Sign-In with an onboarding flow to capture student branch and dietary preferences.
- **Firestore Real-time Listeners:** The dashboard state (including auth sessions) reacts instantly to database mutations via `onSnapshot` listeners.

---

## 🏗️ System Architecture & Monorepo Structure

This project uses **Turborepo** to manage the monorepo structure, allowing the Next.js frontend and the 4 MCP microservices to run side-by-side.

```text
campus-dashboard/
├── apps/
│   └── web/                     # Next.js 14 Frontend Application
│       ├── app/                 # App Router (Pages, Layouts, API Routes)
│       ├── components/          # React Components (Generative UI Cards, Dashboard)
│       ├── lib/                 # Firebase config, MCP SSE client logic
│       └── public/              # Static assets
├── packages/
│   ├── mcp-academics/           # Academics Microservice (PDF RAG Engine)
│   ├── mcp-cafeteria/           # Cafeteria Microservice
│   ├── mcp-events/              # Campus Events Microservice
│   └── mcp-library/             # Library Inventory Microservice
├── firestore.rules              # Security rules for Firestore database
├── firestore.indexes.json       # Database indexing rules
└── Dockerfile                   # Production container configuration
```

---

## 🛠️ Detailed Local Development Setup

Follow these precise steps to run the entire distributed system on your local machine.

### 1. Prerequisites
- **Node.js**: v20 or higher.
- **pnpm**: v9 or higher (`npm install -g pnpm`).
- **Firebase Account**: A free Firebase project.
- **Google AI Studio Account**: A free Gemini API key.

### 2. Clone and Install
```bash
git clone <your-repo-url>
cd campus-dashboard
pnpm install
```

### 3. Setup Firebase
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Authentication** (turn on the Google Sign-in provider).
3. Enable **Firestore Database** (start in production mode).
4. Go to **Project Settings > Service Accounts** and generate a new Node.js Private Key. This will download a `.json` file containing your Admin credentials.
5. Apply the Firestore security rules provided in this repository:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add <your-project-id>
   firebase deploy --only firestore:rules
   ```

### 4. Configure Environment Variables
Create an `.env.local` file inside the `apps/web/` directory. You must fill in the values from your Firebase Project Settings and your Gemini API key:

```env
# AI Model Configuration
GEMINI_API_KEY="AIzaSyYourGeminiKeyHere..."

# Firebase Client SDK (Found in Firebase Project Settings > General)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyYourClientKey..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234:web:abcde"

# Firebase Admin SDK (From the downloaded Service Account JSON)
# CRITICAL: Keep the exact formatting for the private key, including the \n newline characters.
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgk...\n-----END PRIVATE KEY-----\n"
```

### 5. Launch the Ecosystem
AURA relies on `concurrently` (via Turborepo) to spin up all 5 servers (Next.js + 4 MCPs) simultaneously in development mode with hot-reloading enabled.

Run this from the root `campus-dashboard` directory:
```bash
pnpm run dev
```

You should see the terminal booting up the MCP servers on ports `3001` through `3004`, and the Next.js app on port `3000`.

**Open your browser to:** [http://localhost:3000](http://localhost:3000)

---

## ☁️ Production Deployment (Google Cloud Run)

AURA is optimized to be deployed as a single, scalable Docker container to Google Cloud Run. The included `Dockerfile` builds the frontend and bundles the MCP servers using `concurrently` so they all run together in production without needing a complex Kubernetes cluster.

### 1. Authenticate with Google Cloud CLI
```bash
gcloud auth login
gcloud config set project [YOUR_PROJECT_ID]
```

### 2. Configure Production Secrets
Before deploying, ensure you have set all your environment variables in Google Cloud Run.
1. Go to the **Cloud Run** console.
2. Ensure you have authorized your custom domain (e.g., `aura-dashboard...run.app`) in the **Firebase Console > Authentication > Settings > Authorized Domains** to allow Google Sign-in to work in production.

### 3. Build and Deploy
Execute the following command from the root directory to build the image via Cloud Build and deploy it instantly:

```bash
gcloud run deploy aura-dashboard \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --memory 1024Mi \
  --cpu 1
```

---

<p align="center">
  Built with ❤️ by MrManny.
</p>
