import { LayoutDashboard, PlayCircle, Activity, Database, Settings } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: PlayCircle, label: 'New Job', active: false },
    { icon: Activity, label: 'Live Feed', active: false },
    { icon: Database, label: 'Data Explorer', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <aside className="w-64 glass-panel h-[calc(100vh-2rem)] flex flex-col p-4">
      <div className="flex items-center space-x-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-bold tracking-tight">Crawler<span className="text-primary">Pro</span></h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              item.active 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'text-foreground/70 hover:bg-surface hover:text-foreground'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="mt-auto p-4 rounded-xl bg-surface border border-border">
        <p className="text-xs text-foreground/50 text-center">System Status: Online</p>
      </div>
    </aside>
  );
}
