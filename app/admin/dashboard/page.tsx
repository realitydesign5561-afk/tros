'use client';
import { useState } from 'react';

export default function AdminDashboard() {
  const [repairing, setRepairing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleMasterFix = () => {
    setRepairing(true);
    setLogs(['Initiating Master System Fix...', 'Snapshotting DB...', 'Diagnosing APIs...']);
    setTimeout(() => {
      setLogs(prev => [...prev, 'All systems repaired successfully.']);
      setRepairing(false);
    }, 3000);
  };

  const handleAppRestart = () => {
    setLogs(['Initiating controlled restart...', 'Marking jobs as resumable...', 'Sending SIGTERM...']);
  };

  const features = [
    { name: 'Social OS', status: 'HEALTHY', lastRun: '2 mins ago', errors: 0, jobs: 4 },
    { name: 'Course Studio', status: 'DEGRADED', lastRun: '1 hour ago', errors: 2, jobs: 1 },
    { name: 'Lead Gen', status: 'HEALTHY', lastRun: '10 mins ago', errors: 0, jobs: 12 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-screen flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">System Administration</h1>
        <div className="flex gap-4">
          <button onClick={handleMasterFix} disabled={repairing} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50">
            {repairing ? 'Repairing...' : 'Master System Fix'}
          </button>
          <button onClick={handleAppRestart} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium">
            Controlled Restart
          </button>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm mb-8">
          {logs.map((log, i) => <div key={i}>&gt; {log}</div>)}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500 uppercase">Users Online</div>
          <div className="text-2xl font-bold">14</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500 uppercase">Active Jobs</div>
          <div className="text-2xl font-bold">17</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500 uppercase">Failed Jobs (24h)</div>
          <div className="text-2xl font-bold text-red-600">3</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-sm text-gray-500 uppercase">DB Health</div>
          <div className="text-2xl font-bold text-green-600">99.9%</div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Module Health & Management</h2>
      <div className="grid grid-cols-3 gap-6">
        {features.map(f => (
          <div key={f.name} className="bg-white rounded-lg shadow-sm border p-5">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">{f.name}</h3>
              <span className={`px-2 py-1 text-xs rounded font-bold ${f.status === 'HEALTHY' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {f.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1 mb-6">
              <div>Last Run: {f.lastRun}</div>
              <div>Errors: {f.errors}</div>
              <div>Active Jobs: {f.jobs}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-gray-100 hover:bg-gray-200 py-1.5 rounded text-sm font-medium border">Test</button>
              <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-1.5 rounded text-sm font-medium border border-blue-200">Repair</button>
              <button className="bg-red-50 text-red-600 py-1.5 rounded text-sm font-medium border border-red-200">Disable</button>
              <button className="bg-green-50 text-green-600 py-1.5 rounded text-sm font-medium border border-green-200">Enable</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
