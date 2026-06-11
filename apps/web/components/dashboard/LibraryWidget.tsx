"use client";

import { useEffect, useState } from "react";
import { BookMarked, AlertCircle, TrendingUp } from "lucide-react";
import { getNewArrivalsAction, getRandomBooksAction } from "@/app/actions/mcp";
import { useAuth } from "@/components/AuthProvider";

export function LibraryWidget() {
  const { user } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (user) {
        setLoading(true);
        const idToken = await user.getIdToken();
        let data = await getNewArrivalsAction(idToken);
        
        if (!data || data.length === 0) {
          data = await getRandomBooksAction(idToken);
          setIsFallback(true);
        } else {
          setIsFallback(false);
        }

        if (data && Array.isArray(data)) {
          setBooks(data);
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
          <BookMarked className="w-5 h-5 text-accent-primary" />
        </div>
        <h3 className="font-space-grotesk font-semibold text-lg text-text-primary">
          {isFallback ? "Interdisciplinary Picks" : "Library Additions"}
        </h3>
        <span className="ml-auto text-xs text-text-tertiary">Live from Library</span>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse mt-4">
          <div className="h-16 bg-bg-elevated rounded-xl" />
          <div className="h-16 bg-bg-elevated rounded-xl" />
          <div className="h-16 bg-bg-elevated rounded-xl" />
        </div>
      ) : books.length > 0 ? (
        <div className="space-y-3 mt-2 overflow-y-auto pr-2 custom-scrollbar">
          {books.map((book: any, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-bg-elevated border border-border-subtle flex gap-4 items-center">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-text-primary line-clamp-1">{book.title}</h4>
                <p className="text-xs text-text-secondary mt-1">{book.author}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${book.copies_available > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {book.copies_available > 0 ? 'Available' : 'Checked Out'}
                  </span>
                  <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {isFallback ? "Suggested Read" : "New Arrival"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-bg-elevated rounded-xl mt-2 border border-dashed border-border-default">
          <AlertCircle className="w-8 h-8 text-text-tertiary mb-2" />
          <p className="text-sm text-text-secondary">No books found.</p>
        </div>
      )}
    </div>
  );
}
