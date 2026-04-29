"use client";

import { useState } from 'react';
import { Play } from 'lucide-react';

export default function CrawlConfigPanel() {
  const [url, setUrl] = useState('');
  const [depth, setDepth] = useState(2);
  const [rule, setRule] = useState('');
  const [loading, setLoading] = useState(false);

  const startCrawl = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const selectors = rule ? { content: rule } : { content: "body" };
      const response = await fetch('http://localhost:8000/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_url: url,
          max_depth: depth,
          css_selectors: selectors
        })
      });
      if (response.ok) {
        setUrl('');
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel p-6 col-span-2">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <span className="w-2 h-6 bg-primary rounded-full mr-3"></span>
        New Crawl Job
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">Target URL</label>
          <input 
            type="url" 
            placeholder="https://example.com"
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-2">
              Max Depth: <span className="text-primary font-bold">{depth}</span>
            </label>
            <input 
              type="range" 
              min="1" max="10" 
              value={depth}
              onChange={(e) => setDepth(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
             <label className="block text-sm font-medium text-foreground/80 mb-2">Extraction Rule (CSS)</label>
             <input 
              type="text" 
              placeholder="e.g. .product-title or h1"
              value={rule}
              onChange={(e) => setRule(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 pt-4 border-t border-border">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="rounded text-primary focus:ring-primary bg-surface border-border" defaultChecked />
            <span className="text-sm">Use Playwright (JS Rendering)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" className="rounded text-primary focus:ring-primary bg-surface border-border" defaultChecked />
            <span className="text-sm">Respect Robots.txt</span>
          </label>
        </div>

        <button 
          onClick={startCrawl}
          disabled={loading || !url}
          className="w-full py-3 rounded-lg bg-primary hover:bg-primaryHover text-white font-semibold transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 mt-6 disabled:opacity-50">
          <Play className="w-5 h-5 fill-current" />
          <span>{loading ? "Starting..." : "Start Crawling"}</span>
        </button>
      </div>
    </div>
  );
}
