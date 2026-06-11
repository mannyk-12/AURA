"use client";

import { useEffect, useState } from "react";
import { Coffee, AlertCircle, Leaf } from "lucide-react";
import { getCafeteriaMenuAction } from "@/app/actions/mcp";
import { useAuth } from "@/components/AuthProvider";

export function CafeteriaWidget() {
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      if (user) {
        setLoading(true);
        const idToken = await user.getIdToken();
        const today = new Date().toISOString().split('T')[0];
        const data = await getCafeteriaMenuAction(today, idToken);
        setMenu(data);
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Filter to show just lunch or dinner based on current time
  const currentHour = new Date().getHours();
  const mealType = currentHour < 15 ? 'Lunch' : 'Dinner';
  const displayMenu = menu?.[mealType.toLowerCase()] || menu?.['breakfast'];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border-default h-full flex flex-col bg-bg-surface">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-accent-glow rounded-lg">
          <Coffee className="w-5 h-5 text-accent-primary" />
        </div>
        <h3 className="font-space-grotesk font-semibold text-lg text-text-primary">Cafeteria Menu</h3>
        <span className="ml-auto text-xs text-text-tertiary">Live from Cafeteria</span>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse mt-4">
          <div className="h-20 bg-bg-elevated rounded-xl" />
          <div className="h-20 bg-bg-elevated rounded-xl" />
        </div>
      ) : displayMenu?.length > 0 ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="mb-3 shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent-primary">{mealType} Menu</span>
          </div>
          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {displayMenu.map((item: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-bg-elevated border border-border-subtle flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-text-primary flex items-center gap-2">
                    {item.name}
                    {item.dietary_tags?.includes("vegetarian") && <Leaf className="w-3 h-3 text-green-500" />}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{item.description}</p>
                </div>
                <span className="text-xs font-semibold text-text-secondary px-2 py-1 bg-bg-canvas rounded-lg shrink-0 ml-2">
                  {item.calories} cal
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-bg-elevated rounded-xl mt-2 border border-dashed border-border-default">
          <AlertCircle className="w-8 h-8 text-text-tertiary mb-2" />
          <p className="text-sm text-text-secondary">Menu unavailable for today.</p>
        </div>
      )}
    </div>
  );
}
