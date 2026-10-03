'use client';
import { useState } from 'react';

export default function OperationsCenter() {
  const [telemetry] = useState({
    aiLatency: '245ms',
    aiFailureRate: '0.04%',
    errorRate: '0.02%',
    activeJobs: 17,
    dlqSize: 2,
    dbHealth: '99.99% UPTIME',
    oauthHealth: 'HEALTHY'
  });

  const modules = [
    { name: 'SYSTEM', status: 'HEALTHY', repairable: true },
    { name: 'AI PROVIDERS', status: 'DEGRADED', repairable: true },
    { name: 'DATABASE', status: 'HEALTHY', repairable: false },
    { name: 'QUEUES', status: 'HEALTHY', repairable: true },
    { name: 'AUTOMATIONS', status: 'HEALTHY', repairable: true },
    { name: 'INTEGRATIONS', status: 'HEALTHY', repairable: true },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Global Operations Center</h1>
          <p className="text-gray-600">Observability, Resilience, and Data Safety Telemetry.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-red-600 text-white px-4 py-2 rounded font-medium">Trigger Graceful Shutdown</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded font-medium">Flush DLQ</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-sm border border-gray-700">
          <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">AI Latency</div>
          <div className="text-3xl font-bold mt-1 text-green-400">{telemetry.aiLatency}</div>
        </div>
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-sm border border-gray-700">
          <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Error Rate</div>
          <div className="text-3xl font-bold mt-1 text-green-400">{telemetry.errorRate}</div>
        </div>
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-sm border border-gray-700">
          <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Active Resumable Jobs</div>
          <div className="text-3xl font-bold mt-1 text-blue-400">{telemetry.activeJobs}</div>
        </div>
        <div className="bg-gray-900 text-white p-4 rounded-lg shadow-sm border border-gray-700">
          <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Dead Letter Queue</div>
          <div className="text-3xl font-bold mt-1 text-yellow-400">{telemetry.dlqSize}</div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Infrastructure Matrix</h2>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-600">Component</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Last Check</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(mod => (
              <tr key={mod.name} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-800">{mod.name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${mod.status === 'HEALTHY' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {mod.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">Just now</td>
                <td className="p-4 flex gap-2">
                  <button className="text-blue-600 text-sm font-medium hover:underline">View Logs</button>
                  {mod.repairable && <button className="text-blue-600 text-sm font-medium hover:underline">Safe Repair</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
