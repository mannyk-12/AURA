'use client';

import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Domain = 'library' | 'cafeteria' | 'events' | 'academics';

interface StatusCardProps {
  title: string;
  domain: Domain;
  status: 'online' | 'offline' | 'loading';
  lastUpdated?: string;
}

export function StatusCard({ title, domain, status, lastUpdated }: StatusCardProps) {
  // Map domain to CSS variable for border/accent colors
  const domainColorClass = {
    library: 'border-l-blue-500 hover:shadow-[0_0_15px_rgba(79,142,247,0.15)]',
    cafeteria: 'border-l-emerald-400 hover:shadow-[0_0_15px_rgba(52,211,153,0.15)]',
    events: 'border-l-violet-400 hover:shadow-[0_0_15px_rgba(167,139,250,0.15)]',
    academics: 'border-l-orange-400 hover:shadow-[0_0_15px_rgba(251,146,60,0.15)]',
  }[domain];

  return (
    <Card className={`glass-panel border-l-4 transition-all duration-300 ${domainColorClass} animate-slide-up`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-text-primary uppercase tracking-wide">
          {title}
        </CardTitle>
        {status === 'online' && <CheckCircle2 className="h-4 w-4 text-[var(--status-success)]" />}
        {status === 'offline' && <XCircle className="h-4 w-4 text-[var(--status-error)]" />}
        {status === 'loading' && <RefreshCw className="h-4 w-4 text-text-tertiary animate-spin" />}
      </CardHeader>
      <CardContent>
        <div className="text-xs text-text-secondary mt-1">
          {status === 'online' ? `Last updated: ${lastUpdated || 'Just now'}` : 
           status === 'offline' ? 'Server Unreachable' : 'Connecting...'}
        </div>
      </CardContent>
    </Card>
  );
}
