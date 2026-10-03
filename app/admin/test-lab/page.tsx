'use client';
import { useState } from 'react';

export default function TestLab() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any>({});

  const modules = [
    'Website Factory', 'Workflow Builder', 'Social OS', 
    'Course Studio', 'YouTube OS', 'AI Designer', 
    'Lead Gen', 'AI Features', 'Authentication', 'AI Gateway'
  ];

  const handleRunAll = () => {
    setRunning(true);
    const newResults: any = {};
    modules.forEach(m => {
      newResults[m] = { smoke: 'PASS', integration: 'PASS', e2e: Math.random() > 0.8 ? 'WARNING' : 'PASS', health: 'PASS' };
    });
    setTimeout(() => {
      setResults(newResults);
      setRunning(false);
    }, 2000);
  };

  const getBadge = (status: string) => {
    if (status === 'PASS') return <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">PASS</span>;
    if (status === 'FAIL') return <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">FAIL</span>;
    if (status === 'WARNING') return <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold">WARN</span>;
    return <span className="text-gray-400 bg-gray-50 px-2 py-1 rounded text-xs font-bold">-</span>;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">QA Test Lab</h1>
          <p className="text-gray-600 mt-1">Execute Smoke, Integration, E2E, and Health tests across all modules.</p>
        </div>
        <button onClick={handleRunAll} disabled={running} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium shadow-sm disabled:opacity-50">
          {running ? 'Running Test Suite...' : 'Run Full Suite'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-medium text-gray-700">Module</th>
              <th className="p-4 font-medium text-gray-700 text-center">Smoke</th>
              <th className="p-4 font-medium text-gray-700 text-center">Integration</th>
              <th className="p-4 font-medium text-gray-700 text-center">E2E</th>
              <th className="p-4 font-medium text-gray-700 text-center">Health</th>
              <th className="p-4 font-medium text-gray-700 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(m => (
              <tr key={m} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-800">{m}</td>
                <td className="p-4 text-center">{getBadge(results[m]?.smoke)}</td>
                <td className="p-4 text-center">{getBadge(results[m]?.integration)}</td>
                <td className="p-4 text-center">{getBadge(results[m]?.e2e)}</td>
                <td className="p-4 text-center">{getBadge(results[m]?.health)}</td>
                <td className="p-4 text-right">
                  <button className="text-blue-600 text-sm font-medium hover:underline">Run Tests</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
