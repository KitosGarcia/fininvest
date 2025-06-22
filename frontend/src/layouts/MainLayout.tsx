import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-jarvis-bg text-jarvis-text overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full">
        <Topbar className="h-14 bg-jarvis-panel border-b border-blue-900" />
        <main className="flex-1 overflow-y-auto bg-jarvis-bg p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
