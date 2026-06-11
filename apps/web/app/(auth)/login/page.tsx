"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { BookOpen, GraduationCap, Loader2, Sparkles } from "lucide-react";

const BRANCHES = [
  "Computer Science Engineering",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Chemical Engineering",
  "Civil Engineering",
];

function emailToName(email: string) {
  const parts = email.split("@")[0].split(".");
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function LoginPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    
    // If it's sign up, we also require branch
    if (isSignUp && !branch) {
      toast.error("Please select a branch");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create profile immediately
        await createProfile(userCredential.user.uid, userCredential.user.email, null, branch);
      } else {
        // Just login
        await signInWithEmailAndPassword(auth, email, password);
      }
      // AuthProvider handles the redirect!
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      // Login with Google (this creates an auth user if new, or logs them in if existing)
      await signInWithPopup(auth, provider);
      setLoading(false);
      // AuthProvider will catch the user state change.
      // If they are new, they will have no profile, and the UI will switch to the Branch selection step.
    } catch (error: any) {
      toast.error(error.message || "Google sign in failed");
      setLoading(false);
    }
  };

  const createProfile = async (uid: string, userEmail: string | null, displayName: string | null, userBranch: string) => {
    const branchPrefix = userBranch.split(" ").map(w => w[0]).join("").toUpperCase();
    const currentYear = new Date().getFullYear();
    const randomRoll = Math.floor(100 + Math.random() * 900);
    const generatedStudentId = `${branchPrefix}-${currentYear}-${randomRoll}`;

    const profileData = {
      uid,
      email: userEmail,
      displayName: displayName || emailToName(userEmail || ""),
      studentId: generatedStudentId,
      branch: userBranch,
      onboardingComplete: true,
      dietaryPreferences: [],
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, "users", uid), profileData);
  };

  const handleFinishSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !branch) return;
    
    setLoading(true);
    try {
      await createProfile(user.uid, user.email, user.displayName, branch);
      // Once created, AuthProvider will detect the profile update and redirect to "/"
    } catch (error: any) {
      toast.error("Failed to complete setup");
      setLoading(false);
    }
  };

  // 1. Loading State
  if (authLoading || (user && profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-canvas">
        <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  // 2. Finish Setup State (User logged in via Google but has no profile yet)
  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-canvas relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="w-full max-w-md p-8 bg-bg-surface/50 backdrop-blur-xl border border-border-default/50 rounded-2xl shadow-2xl relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-accent-primary/20 rounded-xl flex items-center justify-center mb-4 ring-1 ring-accent-primary/30">
              <GraduationCap className="w-6 h-6 text-accent-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">One Last Step</h1>
            <p className="text-text-secondary mt-2 text-center text-sm">
              We just need to know your branch to personalize your dashboard.
            </p>
          </div>

          <form onSubmit={handleFinishSetup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">Your Branch</label>
              <Select value={branch} onValueChange={(val) => setBranch(val || "")} required>
                <SelectTrigger className="bg-bg-elevated border-border-default text-text-primary h-12 rounded-xl">
                  <SelectValue placeholder="Select your branch" />
                </SelectTrigger>
                <SelectContent className="bg-bg-elevated border-border-default text-text-primary">
                  {BRANCHES.map((b) => (
                    <SelectItem key={b} value={b} className="hover:bg-accent-primary/20 focus:bg-accent-primary/20 cursor-pointer">
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={loading || !branch}
              className="w-full bg-accent-primary hover:bg-accent-secondary text-white h-12 rounded-xl font-medium transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Setup"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // 3. Normal Login / Signup State
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-canvas relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md p-8 bg-bg-surface/40 backdrop-blur-2xl border border-border-default/40 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-accent-primary/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Welcome to AURA
          </h1>
          <p className="text-text-secondary mt-2 text-center text-sm">
            {isSignUp ? "Create an account to access your campus intelligence" : "Sign in to access your unified campus dashboard"}
          </p>
        </div>

        <div className="space-y-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-bg-elevated hover:bg-bg-elevated/80 border-border-default text-text-primary h-12 rounded-xl transition-all flex items-center justify-center gap-3 font-medium"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-default"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-bg-surface text-text-tertiary">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-bg-elevated border-border-default text-text-primary h-12 rounded-xl focus-visible:ring-accent-primary"
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-bg-elevated border-border-default text-text-primary h-12 rounded-xl focus-visible:ring-accent-primary"
                required
              />
              
              {/* Only show Branch selection if they are signing up via Email */}
              {isSignUp && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <Select value={branch} onValueChange={(val) => setBranch(val || "")} required>
                    <SelectTrigger className="bg-bg-elevated border-border-default text-text-primary h-12 rounded-xl focus:ring-accent-primary">
                      <SelectValue placeholder="Select your branch" />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-elevated border-border-default text-text-primary">
                      {BRANCHES.map((b) => (
                        <SelectItem key={b} value={b} className="hover:bg-accent-primary/20 focus:bg-accent-primary/20 cursor-pointer">
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-primary hover:bg-accent-secondary text-white h-12 rounded-xl font-medium transition-all shadow-lg shadow-accent-primary/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? "Create Account" : "Sign In")}
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-accent-primary hover:text-accent-secondary font-medium transition-colors"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
