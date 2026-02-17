import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
