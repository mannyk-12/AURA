"use client";

import { AcademicsWidget } from "./AcademicsWidget";
import { CafeteriaWidget } from "./CafeteriaWidget";
import { EventsWidget } from "./EventsWidget";
import { LibraryWidget } from "./LibraryWidget";

export function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full">
      <div id="academics" className="h-[350px] scroll-mt-20">
        <AcademicsWidget />
      </div>
      <div id="cafeteria" className="h-[350px] scroll-mt-20">
        <CafeteriaWidget />
      </div>
      <div id="events" className="h-[350px] scroll-mt-20">
        <EventsWidget />
      </div>
      <div id="library" className="h-[350px] scroll-mt-20">
        <LibraryWidget />
      </div>
    </div>
  );
}
