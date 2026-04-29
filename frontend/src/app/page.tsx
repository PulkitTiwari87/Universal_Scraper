"use client";

import Sidebar from '@/components/Sidebar';
import CrawlConfigPanel from '@/components/CrawlConfigPanel';
import LiveFeedMonitor from '@/components/LiveFeedMonitor';
import { useEffect, useState } from 'react';

type Extraction = {
  source_url: string;
  status: string;
  items_found: number;
  time: string;
};

export default function Home() {
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [activeJobs, setActiveJobs] = useState(0);

  useEffect(() => {
    const fetchExtractions = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/extractions');
        if (res.ok) {
          const data = await res.json();
          setExtractions(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/status');
        if (res.ok) {
          const data = await res.json();
          setActiveJobs(data.active_jobs);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchExtractions();
    fetchStatus();
    
    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchExtractions();
      fetchStatus();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-background p-4 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      <Sidebar />
      
      <main className="flex-1 ml-6 flex flex-col space-y-6 overflow-y-auto pr-2 pb-6">
        <header className="flex justify-between items-center glass-panel p-4 rounded-xl">
          <h2 className="text-xl font-medium tracking-tight">Overview</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-foreground/60">Active Workers: <span className="text-primary font-bold">{activeJobs}</span></span>
            <div className="h-8 w-8 rounded-full bg-surface border border-border flex items-center justify-center">
               <span className="text-sm font-bold">JD</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-6 h-[500px]">
          <CrawlConfigPanel />
          <LiveFeedMonitor />
        </div>

        {/* Data Preview Section */}
        <div className="glass-panel p-6 flex-1 min-h-[300px]">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold">Recent Extractions</h3>
             <button className="text-sm bg-surface hover:bg-surfaceHover border border-border px-4 py-2 rounded-lg transition-colors">
               Export CSV
             </button>
           </div>
           
           <div className="border border-border rounded-lg overflow-hidden">
             <table className="w-full text-sm text-left">
               <thead className="bg-surface text-foreground/70">
                 <tr>
                   <th className="px-6 py-3 font-medium">Source URL</th>
                   <th className="px-6 py-3 font-medium">Status</th>
                   <th className="px-6 py-3 font-medium">Items Found</th>
                   <th className="px-6 py-3 font-medium text-right">Time</th>
                 </tr>
               </thead>
               <tbody>
                 {extractions.map((ext, idx) => (
                   <tr key={idx} className="border-t border-border/50 hover:bg-surface/50 transition-colors">
                     <td className="px-6 py-4 truncate max-w-xs" title={ext.source_url}>{ext.source_url}</td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          ext.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          ext.status === 'running' ? 'bg-primary/20 text-primary' :
                          ext.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {ext.status}
                        </span>
                     </td>
                     <td className="px-6 py-4">{ext.items_found || 0}</td>
                     <td className="px-6 py-4 text-right text-foreground/50">{new Date(ext.time).toLocaleString()}</td>
                   </tr>
                 ))}
                 {extractions.length === 0 && (
                   <tr>
                     <td colSpan={4} className="px-6 py-8 text-center text-foreground/50">No recent extractions found.</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </main>
    </div>
  );
}
