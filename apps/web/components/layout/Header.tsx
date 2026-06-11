"use client";

import { Bell, User, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '../AuthProvider';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { profile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-border-default h-16 flex items-center justify-between px-6 bg-bg-surface/80">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-library via-accent-events to-accent-academics flex items-center justify-center animate-gradient-shift shadow-lg shadow-accent-primary/20">
          <span className="text-white font-black font-space-grotesk text-xl tracking-widest drop-shadow-md">A</span>
        </div>
        <h1 className="font-space-grotesk font-black text-2xl tracking-tighter hidden md:block bg-gradient-to-r from-accent-library via-accent-events to-accent-academics bg-clip-text text-transparent animate-gradient-shift">
          AURA
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-text-secondary hover:text-text-primary">
          <Bell className="w-5 h-5" />
        </Button>
        
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger className="w-8 h-8 rounded-full bg-accent-glow border border-accent-primary flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-bg-surface">
            <User className="w-4 h-4 text-accent-primary" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-panel border-border-default">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.displayName || "Student"}</p>
                  <p className="text-xs leading-none text-text-tertiary">
                    {profile?.studentId || "Guest"}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border-subtle" />
            <DropdownMenuItem onClick={handleLogout} className="text-status-error cursor-pointer focus:text-status-error focus:bg-status-error/10">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
