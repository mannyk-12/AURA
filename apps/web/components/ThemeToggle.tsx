'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('aura-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
      if (savedTheme === 'dark') document.documentElement.classList.add('dark');
    } else if (prefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('aura-theme', 'dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aura-theme', 'light');
    }
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme}
      className="glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-border-default bg-transparent"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-orange-500 animate-pulse-dot" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-blue-400 animate-pulse-dot" />
      )}
    </Button>
  );
}
