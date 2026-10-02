'use client';

import { useState } from 'react';

export default function CampaignsPage() {
  const [prompt, setPrompt] = useState('Create a 30-day social campaign for a Nigerian real estate company targeting first-time home buyers.');
  
  const handleGenerate = async () => {
    // Call the SocialAgent API
    alert('Generating Campaign Strategy...');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Social Campaigns</h1>
      
      <div className="flex flex-col gap-4">
        <label className="font-semibold">Campaign Prompt</label>
        <textarea 
          className="w-full p-4 border rounded-md"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button 
          onClick={handleGenerate}
          className="bg-blue-600 text-white px-6 py-2 rounded-md w-max"
        >
          Generate Campaign
        </button>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Your Campaigns</h2>
        <div className="p-6 border rounded-md bg-gray-50">
          <p className="text-gray-500">No campaigns yet. Generate one to see the strategy, content pillars, and schedule here.</p>
        </div>
      </div>
    </div>
  );
}
