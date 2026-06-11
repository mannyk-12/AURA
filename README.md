# AURA: AI Unified Resource Assistant

Welcome to **AURA** (AI Unified Resource Assistant), an AI-powered unified campus intelligence dashboard. This application centralizes all campus data—from library records and cafeteria menus to academic schedules and upcoming events—into a single, beautiful, generative UI interface.

## 🚀 Features

- **Generative UI:** AURA goes beyond traditional chat by dynamically rendering rich, interactive UI cards natively within the chat interface based on real-time campus data.
- **Microservices Architecture (MCP):** Powered by the Model Context Protocol (MCP), campus data is split into specialized, modular backend servers:
  - 📚 **Library MCP:** Tracks books, new arrivals, and interdisciplinary picks.
  - 🍽️ **Cafeteria MCP:** Real-time menus, dietary tags, and caloric information.
  - 📅 **Events MCP:** Upcoming campus events and RSVP status.
  - 🎓 **Academics MCP:** Classes, schedules, exams, and announcements via a RAG (Retrieval-Augmented Generation) engine parsing academic PDFs.
- **Glassmorphic Design System:** A highly polished, responsive frontend built with Next.js and Tailwind CSS featuring a modern glassmorphic aesthetic.
- **Firebase Authentication:** Secure authentication utilizing Google Auth and Firebase Security Rules.

## 🛠️ Technology Stack

- **Frontend:** Next.js, React, Tailwind CSS, Lucide Icons
- **Backend/API:** Google Gemini 2.5 Flash / 3.1 Flash-Lite, Firebase (Auth, Firestore)
- **Architecture:** Model Context Protocol (MCP) via `@modelcontextprotocol/sdk`
- **Monorepo:** Turborepo (pnpm workspaces)

## 🐳 Running Locally

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up Environment Variables:**
   Create an `.env.local` file in `apps/web/` and add your keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY=...
   ```

3. **Start the Development Servers:**
   The dashboard runs Next.js alongside 4 independent MCP servers. You can start them all concurrently using Turbo:
   ```bash
   pnpm run dev
   ```

4. **Open the App:**
   Visit [http://localhost:3000](http://localhost:3000)

## ☁️ Deployment (Cloud Run)

This project is configured to deploy as a single monolithic Docker container to Google Cloud Run, leveraging `concurrently` to run the Next.js frontend and the 4 MCP servers side-by-side in production.

```bash
gcloud run deploy campus-dashboard --source . --allow-unauthenticated
```
