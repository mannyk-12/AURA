"use client";

import { useEffect, useState } from "react";
import { Calendar, AlertCircle, MapPin, Users } from "lucide-react";
import { getUpcomingEventsAction } from "@/app/actions/mcp";
import { useAuth } from "@/components/AuthProvider";

export function EventsWidget() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (user) {
        setLoading(true);
        const idToken = await user.getIdToken();
        const data = await getUpcomingEventsAction(idToken);
        if (data && Array.isArray(data)) {
          setEvents(data.slice(0, 3)); // Only show top 3
        }
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border-default h-full flex flex-col bg-bg-surface">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-accent-glow rounded-lg">
          <Calendar className="w-5 h-5 text-accent-primary" />
        </div>
        <h3 className="font-space-grotesk font-semibold text-lg text-text-primary">Upcoming Events</h3>
        <span className="ml-auto text-xs text-text-tertiary">Live from Events</span>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse mt-4">
          <div className="h-24 bg-bg-elevated rounded-xl" />
          <div className="h-24 bg-bg-elevated rounded-xl" />
        </div>
      ) : events.length > 0 ? (
        <div className="space-y-3 mt-2 overflow-y-auto pr-2 custom-scrollbar">
          {events.map((event: any, idx: number) => {
            const dateObj = new Date(event.date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            return (
              <div key={idx} className="p-4 rounded-xl bg-bg-elevated border border-border-subtle flex gap-4">
                <div className="flex flex-col items-center justify-center bg-bg-canvas px-3 py-2 rounded-lg min-w-[60px] h-fit">
                  <span className="text-xs font-semibold text-accent-primary uppercase">{formattedDate.split(' ')[0]}</span>
                  <span className="text-lg font-bold text-text-primary">{formattedDate.split(' ')[1]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-text-primary line-clamp-1">{event.title}</h4>
                  <p className="text-xs text-text-tertiary mt-1 line-clamp-1">{event.organiser_club}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-text-secondary flex items-center gap-1"><MapPin className="w-3 h-3" /> <span className="line-clamp-1">{event.venue || 'TBA'}</span></span>
                    <span className="text-xs text-text-secondary flex items-center gap-1 shrink-0"><Users className="w-3 h-3" /> {event.seats_total || 'Open'} max</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-bg-elevated rounded-xl mt-2 border border-dashed border-border-default">
          <AlertCircle className="w-8 h-8 text-text-tertiary mb-2" />
          <p className="text-sm text-text-secondary">No upcoming events found.</p>
        </div>
      )}
    </div>
  );
}
