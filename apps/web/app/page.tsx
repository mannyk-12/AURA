import Link from "next/link";
import { ArrowRight, BookOpen, Coffee, Calendar, GraduationCap, Brain, Shield, Zap, Server, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="dark space-background bg-[#0A0F1A] h-screen overflow-y-auto text-text-primary flex flex-col relative">
      {/* Dynamic Stars Overlay */}
      <div className="stars-overlay"></div>

      {/* Navigation Bar */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12 backdrop-blur-md bg-bg-surface/30 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-events flex items-center justify-center font-space-grotesk font-bold text-lg text-white shadow-lg shadow-accent-glow animate-pulse-dot">
            A
          </div>
          <span className="font-space-grotesk font-bold text-2xl tracking-tight text-white drop-shadow-md">
            AURA
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="px-6 py-2 rounded-full font-medium text-text-secondary hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link 
            href="/login" 
            className="px-6 py-2 rounded-full bg-accent-primary hover:bg-accent-primary/90 text-white font-medium shadow-lg shadow-accent-glow transition-all hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center lg:py-20">
        
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-glow border border-accent-primary/20 text-accent-primary font-medium text-sm mb-8 animate-slide-up backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
          Next-Gen Campus Intelligence
        </div>

        {/* Hero Title */}
        <h1 className="font-space-grotesk text-6xl lg:text-8xl font-extrabold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-accent-events animate-slide-up drop-shadow-2xl max-w-5xl">
          Unified Resource Assistant.
        </h1>
        
        <p className="text-xl lg:text-2xl text-text-secondary max-w-2xl mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Experience the future of campus living. AURA seamlessly integrates academics, library, cafeteria, and events into one powerful AI-driven platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link 
            href="/login" 
            className="px-8 py-4 rounded-full bg-white text-bg-canvas font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 flex items-center gap-2"
          >
            Enter Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="https://github.com/mannyk-12/AURA" 
            target="_blank"
            className="px-8 py-4 rounded-full bg-bg-surface/50 text-white font-bold text-lg border border-border-subtle hover:bg-bg-elevated backdrop-blur-md transition-all hover:scale-105"
          >
            View Architecture
          </Link>
        </div>

        {/* 3D Floating Feature Cards */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl px-4 perspective-1000">
          
          <div className="animate-float bg-bg-surface/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl hover:border-accent-academics/50 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-accent-academics/20 flex items-center justify-center mb-6 text-accent-academics group-hover:scale-110 transition-transform">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-space-grotesk">Academics</h3>
            <p className="text-text-tertiary">Real-time schedules, exams, and attendance tracking.</p>
          </div>

          <div className="animate-float-delayed bg-bg-surface/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl hover:border-accent-library/50 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-accent-library/20 flex items-center justify-center mb-6 text-accent-library group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-space-grotesk">Library</h3>
            <p className="text-text-tertiary">Instant book availability and AI-powered recommendations.</p>
          </div>

          <div className="animate-float bg-bg-surface/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl hover:border-accent-cafeteria/50 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-accent-cafeteria/20 flex items-center justify-center mb-6 text-accent-cafeteria group-hover:scale-110 transition-transform">
              <Coffee className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-space-grotesk">Cafeteria</h3>
            <p className="text-text-tertiary">Live daily menus, calories, and nutritional breakdown.</p>
          </div>

          <div className="animate-float-delayed bg-bg-surface/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl hover:border-accent-events/50 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-accent-events/20 flex items-center justify-center mb-6 text-accent-events group-hover:scale-110 transition-transform">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-space-grotesk">Events</h3>
            <p className="text-text-tertiary">Campus workshops, club activities, and RSvP tracking.</p>
          </div>

        </div>
      </main>

      {/* Goal / Mission Section */}
      <section className="relative z-10 w-full bg-bg-surface/10 border-y border-white/5 py-24 backdrop-blur-sm mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="font-space-grotesk text-4xl lg:text-5xl font-bold text-white mb-8">The AURA Mission</h2>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Campuses today are fragmented. Students juggle half a dozen portals to check their grades, find a library book, look up cafeteria menus, and RSVP for events. AURA unifies every aspect of campus life into a single, intuitive interface powered by an advanced AI agent that understands your specific needs.
          </p>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-space-grotesk text-4xl lg:text-5xl font-bold text-white mb-4">Enterprise-Grade Architecture</h2>
          <p className="text-lg text-text-secondary">Powered by Google Cloud, Next.js, and the Model Context Protocol (MCP).</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-start gap-6 p-8 rounded-3xl bg-bg-surface/20 border border-white/5 hover:bg-bg-surface/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3 font-space-grotesk">Agentic AI Core</h3>
              <p className="text-text-tertiary leading-relaxed">
                AURA isn't just a chatbot. It uses the Google Gemini 2.0 Flash model to dynamically reason about your queries and autonomously fetch real-time data from disparate campus subsystems.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6 p-8 rounded-3xl bg-bg-surface/20 border border-white/5 hover:bg-bg-surface/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3 font-space-grotesk">Microservices via MCP</h3>
              <p className="text-text-tertiary leading-relaxed">
                By leveraging the Model Context Protocol, AURA connects its central AI brain to isolated backend servers (Academics, Library, Cafeteria) securely and asynchronously.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6 p-8 rounded-3xl bg-bg-surface/20 border border-white/5 hover:bg-bg-surface/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3 font-space-grotesk">Real-time Synchronization</h3>
              <p className="text-text-tertiary leading-relaxed">
                Built on top of Firebase Firestore and Server-Sent Events (SSE), the dashboard updates instantly without ever needing a manual refresh.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6 p-8 rounded-3xl bg-bg-surface/20 border border-white/5 hover:bg-bg-surface/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 text-orange-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3 font-space-grotesk">Secure & Monolithic</h3>
              <p className="text-text-tertiary leading-relaxed">
                Deployed as a single, highly-scalable Docker container on Google Cloud Run, ensuring zero-trust networking between the AI and private campus databases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 w-full py-24 text-center">
        <h2 className="font-space-grotesk text-3xl font-bold text-white mb-8">Ready to revolutionize your campus experience?</h2>
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent-primary hover:bg-accent-primary/90 text-white font-bold text-lg shadow-[0_0_40px_rgba(79,142,247,0.4)] transition-all hover:scale-105"
        >
          Access AURA Dashboard <ChevronRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 border-t border-white/10 text-center text-text-tertiary">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} AURA Intelligence. Built by Mayank.
        </p>
      </footer>
    </div>
  );
}
