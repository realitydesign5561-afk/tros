'use client';
import { useState } from 'react';

export default function CampaignBuilder() {
  const [sequences] = useState([
    { day: 1, subject: 'Custom website for {{company}}', type: 'Email' },
    { day: 3, subject: 'Re: Custom website for {{company}}', type: 'Follow-up Email' },
    { day: 7, subject: 'Quick question about {{company}}', type: 'Follow-up Email' },
  ]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Campaign Builder</h1>
        <div className="flex gap-2">
          <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded">Save Draft</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded">Launch Campaign</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Sequence</h2>
            <div className="space-y-4">
              {sequences.map((seq, i) => (
                <div key={i} className="flex border rounded-md overflow-hidden">
                  <div className="bg-gray-50 border-r px-4 py-3 flex flex-col justify-center items-center w-24">
                    <span className="text-xs text-gray-500 uppercase font-semibold">Day</span>
                    <span className="text-lg font-bold">{seq.day}</span>
                  </div>
                  <div className="p-4 flex-1">
                    <div className="text-sm text-blue-600 font-medium mb-1">{seq.type}</div>
                    <div className="font-semibold text-gray-800">{seq.subject}</div>
                  </div>
                </div>
              ))}
              <button className="w-full py-3 border-2 border-dashed rounded-md text-gray-500 hover:bg-gray-50">
                + Add Step
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Limit</label>
                <input type="number" defaultValue={50} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stop on Reply</label>
                <select className="w-full border p-2 rounded">
                  <option>Yes (Recommended)</option>
                  <option>No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select className="w-full border p-2 rounded">
                  <option>john@realityhomes.demo (Gmail)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
