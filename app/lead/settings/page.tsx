'use client';
import { useState } from 'react';

export default function LeadSettings() {
  const [connections] = useState([
    { id: 1, email: 'john@realityhomes.demo', provider: 'GMAIL', status: 'CONNECTED', expiresAt: '2027-01-01' }
  ]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Email Connections</h1>
      <p className="text-gray-600 mb-8">
        Connect your sending domains via secure OAuth. We never store raw passwords.
      </p>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-600">Email Address</th>
              <th className="p-4 font-medium text-gray-600">Provider</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {connections.map(conn => (
              <tr key={conn.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4">{conn.email}</td>
                <td className="p-4">{conn.provider}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">{conn.status}</span>
                </td>
                <td className="p-4 flex gap-2">
                  <button className="text-red-600 hover:underline text-sm">Disconnect</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded font-medium flex items-center gap-2">
          <span>Connect Google (OAuth)</span>
        </button>
        <button className="bg-gray-800 text-white px-4 py-2 rounded font-medium flex items-center gap-2">
          <span>Connect SMTP</span>
        </button>
      </div>
      
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Suppression List</h2>
        <p className="text-sm text-gray-600 mb-4">Domains and emails that will never receive automated sequences.</p>
        <div className="flex gap-2 max-w-md">
          <input type="text" placeholder="example.com or user@domain.com" className="flex-1 border p-2 rounded" />
          <button className="bg-gray-200 px-4 py-2 rounded text-gray-700">Add to List</button>
        </div>
      </div>
    </div>
  );
}
