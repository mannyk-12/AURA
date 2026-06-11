"use client";

import { useEffect, useState } from 'react';
import { Home, MessageSquare, BookOpen, Coffee, Calendar, GraduationCap } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { getServiceStatusesAction } from '@/app/actions/mcp';

export function Sidebar() {
  const { profile } = useAuth();
  const [statuses, setStatuses] = useState<Record<string, boolean>>({
    Academics: false,
    Library: false,
    Events: false,
    Cafeteria: false
  });

  useEffect(() => {
    async function checkStatus() {
      const liveStatuses = await getServiceStatusesAction();
      if (liveStatuses) {
        setStatuses(liveStatuses);
      }
    }
    
    // Check immediately
    checkStatus();
    
    // Then poll every 30 seconds
    const intervalId = setInterval(checkStatus, 30000);
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <aside className="w-16 lg:w-64 border-r border-border-default bg-bg-surface glass-panel hidden md:flex flex-col flex-shrink-0 h-[calc(100vh-4rem)]">
      <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          <NavItem href="#" icon={<Home />} label="Dashboard" isActive />
        </div>

        <div>
          <p className="px-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">System Status</p>
          <div className="space-y-1">
            <StatusItem icon={<GraduationCap />} label="Academics" isLive={statuses.Academics} />
            <StatusItem icon={<BookOpen />} label="Library" isLive={statuses.Library} />
            <StatusItem icon={<Calendar />} label="Events" isLive={statuses.Events} />
            <StatusItem icon={<Coffee />} label="Cafeteria" isLive={statuses.Cafeteria} />
          </div>
        </div>
      </nav>
      
      {profile && (
        <div className="p-4 border-t border-border-default">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-glow flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-accent-primary">
                {profile.displayName ? profile.displayName.substring(0, 2).toUpperCase() : 'ME'}
              </span>
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-medium text-text-primary truncate">{profile.displayName || profile.studentId}</p>
              <p className="text-xs text-text-tertiary truncate">{profile.branch}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function NavItem({ icon, label, isActive, color, href }: { icon: React.ReactNode; label: string; isActive?: boolean; color?: string, href: string }) {
  return (
    <a 
      href={href}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md ${
        isActive 
          ? 'bg-accent-glow text-accent-primary font-medium shadow-sm border border-accent-primary/20' 
          : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary border border-transparent hover:border-border-subtle'
      }`}
    >
      <div className={`w-5 h-5 shrink-0 flex items-center justify-center ${color || ''}`}>
        {icon}
      </div>
      <span className="hidden lg:block text-sm">{label}</span>
    </a>
  );
}

function StatusItem({ icon, label, isLive }: { icon: React.ReactNode; label: string; isLive: boolean }) {
  // Render status indicator based on live ping
  return (
    <div className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-transparent bg-bg-surface">
      <div className="flex items-center gap-3 text-text-secondary">
        <div className="w-5 h-5 shrink-0 flex items-center justify-center">
          {icon}
        </div>
        <span className="hidden lg:block text-sm">{label}</span>
      </div>
      {isLive ? (
        <div className="hidden lg:flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34D399]"></span>
          </span>
          <span className="text-[10px] font-medium text-[#34D399] uppercase tracking-wider">Live</span>
        </div>
      ) : (
        <div className="hidden lg:flex items-center gap-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-text-tertiary"></span>
          <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">Offline</span>
        </div>
      )}
    </div>
  );
}
