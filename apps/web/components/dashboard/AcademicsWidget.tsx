"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getClassScheduleAction } from "@/app/actions/mcp";

export function AcademicsWidget() {
  const { profile, user } = useAuth();
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (profile?.branch && user) {
        setLoading(true);
        const idToken = await user.getIdToken();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayStr = days[new Date().getDay()];
        const data = await getClassScheduleAction(profile.branch, idToken, todayStr);
        setSchedule(data);
        setLoading(false);
      }
    }
    loadData();
  }, [profile?.branch]);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border-default h-full flex flex-col bg-bg-surface">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-accent-glow rounded-lg">
          <BookOpen className="w-5 h-5 text-accent-primary" />
        </div>
        <h3 className="font-space-grotesk font-semibold text-lg text-text-primary">Today's Classes</h3>
        <span className="ml-auto text-xs text-text-tertiary">Live from Academics</span>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse mt-4">
          <div className="h-16 bg-bg-elevated rounded-xl" />
          <div className="h-16 bg-bg-elevated rounded-xl" />
          <div className="h-16 bg-bg-elevated rounded-xl" />
        </div>
      ) : schedule?.length > 0 ? (
        <div className="space-y-3 mt-2 overflow-y-auto pr-2 custom-scrollbar">
          {schedule.map((item: any, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-bg-elevated border border-border-subtle flex gap-4 items-center">
              <div className="flex flex-col items-center justify-center bg-bg-canvas px-3 py-2 rounded-lg min-w-20">
                <span className="text-sm font-semibold text-text-primary">{item.start_time}</span>
                <span className="text-xs text-text-tertiary">{item.end_time}</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary">{item.course_name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-secondary bg-bg-canvas px-2 py-0.5 rounded-full">{item.type}</span>
                  <span className="text-xs text-text-secondary flex items-center gap-1"><Clock className="w-3 h-3" /> {item.venue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-bg-elevated rounded-xl mt-2 border border-dashed border-border-default">
          <AlertCircle className="w-8 h-8 text-text-tertiary mb-2" />
          <p className="text-sm text-text-secondary">No classes scheduled for today.</p>
        </div>
      )}
    </div>
  );
}
