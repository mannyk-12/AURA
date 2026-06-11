"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";

interface UserProfile {
  studentId: string;
  branch: string;
  onboardingComplete: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Set persistence to session so different tabs can have different users
    setPersistence(auth, browserSessionPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const profileRef = doc(db, "users", currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        } else {
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = pathname === "/login";
    const isPublicRoute = pathname === "/";
    const hasProfile = !!profile?.onboardingComplete;

    if (!user) {
      if (!isAuthRoute && !isPublicRoute) router.push("/login");
    } else {
      if (!hasProfile) {
        if (!isAuthRoute && !isPublicRoute) router.push("/login");
      } else {
        if (isAuthRoute || isPublicRoute) router.push("/dashboard");
      }
    }
  }, [user, profile, loading, pathname, router]);

  // Don't render anything while loading to prevent flash
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-canvas">
        <div className="w-8 h-8 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const isAuthRoute = pathname === "/login";
  const isPublicRoute = pathname === "/";
  const hasProfile = !!profile?.onboardingComplete;
  
  // Protect routes from rendering
  if (!user && !isAuthRoute && !isPublicRoute) return null;
  if (user && !hasProfile && !isAuthRoute && !isPublicRoute) return null;

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
