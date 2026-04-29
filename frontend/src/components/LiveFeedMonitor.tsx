"use client";

import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

type Log = {
  id: number;
  time: string;
  status: string;
  message: string;
};

export default function LiveFeedMonitor() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/logs');
    
    ws.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      setLogs((prevLogs) => [newLog, ...prevLogs].slice(0, 100)); // Keep last 100
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="glass-panel p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <Activity className="w-5 h-5 text-primary mr-2" />
          Live Feed
        </h2>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      </div>

      <div className="flex-1 bg-background/50 rounded-lg border border-border p-4 font-mono text-sm overflow-y-auto space-y-2">
        {logs.map((log, index) => (
          <div key={index} className="flex space-x-3">
            <span className="text-foreground/40">[{log.time}]</span>
            <span className={`
              ${log.status === 'success' ? 'text-green-400' : ''}
              ${log.status === 'warning' ? 'text-yellow-400' : ''}
              ${log.status === 'extracting' ? 'text-blue-400' : ''}
              ${log.status === 'queued' ? 'text-purple-400' : ''}
            `}>
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-foreground/40 text-center mt-10">Waiting for logs...</div>
        )}
      </div>
    </div>
  );
}
