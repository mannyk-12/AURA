import { ChatInterface } from "@/components/ChatInterface";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";

export default function Home() {
  return (
    <div className="h-full flex flex-col p-6 space-y-6 animate-slide-up">
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Column: Live Widgets */}
        <div className="lg:col-span-2 overflow-y-auto pr-2 custom-scrollbar">
          <DashboardGrid />
        </div>

        {/* Right Column: Chat Interface */}
        <div className="lg:col-span-1 h-full min-h-[500px]">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
