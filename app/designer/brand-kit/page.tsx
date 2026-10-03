'use client';
import { useState } from 'react';

export default function BrandKitManager() {
  const [colors, setColors] = useState(['#1a56db', '#fbbf24', '#ffffff']);
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Brand Kit Manager</h1>
      <p className="text-gray-600 mb-8">
        Save your preferred logos, colors, fonts, and visual styles to enforce brand consistency across all generated designs.
      </p>

      <div className="space-y-6">
        <div className="border p-6 rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Brand Colors</h2>
          <div className="flex gap-4">
            {colors.map((c, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border shadow-inner mb-2" style={{ backgroundColor: c }}></div>
                <span className="text-xs uppercase text-gray-500">{c}</span>
              </div>
            ))}
            <button className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center text-gray-400 hover:bg-gray-50">
              +
            </button>
          </div>
        </div>

        <div className="border p-6 rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Typography & Spacing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Primary Font</label>
              <input type="text" className="w-full border p-2 rounded" defaultValue="Inter, sans-serif" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Preferred Formats</label>
              <input type="text" className="w-full border p-2 rounded" defaultValue="PNG (Transparent), WebP" />
            </div>
          </div>
        </div>

        <div className="border p-6 rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Visual Guidelines (AI Prompt)</h2>
          <textarea 
            className="w-full h-24 border p-2 rounded" 
            defaultValue="Always use a minimalist aesthetic. Ensure high contrast between the blue and gold elements. Avoid realistic human photos; use flat illustrations instead."
          />
        </div>

        <button className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium">
          Save Brand Kit
        </button>
      </div>
    </div>
  );
}
