'use client';
import { useState } from 'react';

export default function LeadTable() {
  const [leads, setLeads] = useState<any[]>([]);

  const handleDiscover = async () => {
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover', query: 'web dev', ownerId: 'demo' })
      });
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch(e) {}
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Prospects</h1>
        <button onClick={handleDiscover} className="bg-blue-600 text-white px-4 py-2 rounded">Discover Leads</button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-600">Name</th>
              <th className="p-4 font-medium text-gray-600">Company</th>
              <th className="p-4 font-medium text-gray-600">Email</th>
              <th className="p-4 font-medium text-gray-600">Score</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => (
              <tr key={lead.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">{lead.name}</td>
                <td className="p-4">{lead.company}</td>
                <td className="p-4">{lead.email}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">{lead.score}</span>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">{lead.status}</span>
                </td>
                <td className="p-4 flex gap-2">
                  <button className="text-blue-600 hover:underline text-sm">Enrich</button>
                  <button className="text-blue-600 hover:underline text-sm">Draft Email</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
