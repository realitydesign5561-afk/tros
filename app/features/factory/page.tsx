'use client';
import { useState } from 'react';

export default function FeatureFactory() {
  const [status, setStatus] = useState('FEATURE_DRAFT');
  const [health, setHealth] = useState('UNKNOWN');
  
  const [logs, setLogs] = useState([
    { id: 1, action: 'CREATE', result: 'SUCCESS', desc: 'Analyzed requirement and created specification.' }
  ]);

  const addLog = (action: string, result: string, desc: string) => {
    setLogs(prev => [...prev, { id: prev.length + 1, action, result, desc }]);
  };

  const handleBuild = () => {
    addLog('BUILD', 'SUCCESS', 'Executed npm run build in sandbox.');
    setStatus('FEATURE_TESTING');
  };

  const handleTest = () => {
    addLog('TEST', 'SUCCESS', 'Passed 12 UI tests, 4 API tests. Linting clean.');
    setStatus('FEATURE_APPROVAL');
    setHealth('HEALTHY');
  };

  const handleDeploy = () => {
    addLog('DEPLOY', 'SUCCESS', 'Merged sandbox into master branch.');
    setStatus('FEATURE_ACTIVE');
  };

  const handleRollback = () => {
    addLog('ROLLBACK', 'SUCCESS', 'Reverted to previous snapshot.');
    setStatus('FEATURE_TESTING');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex gap-8 h-screen overflow-hidden">
      
      {/* Left Panel: Feature State */}
      <div className="w-1/2 flex flex-col space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h1 className="text-2xl font-bold mb-2">Support Dashboard</h1>
          <p className="text-gray-600 mb-4">Users can upload documents and ask questions.</p>
          
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-md">
            <div>
              <div className="text-xs text-gray-500 uppercase">Status</div>
              <div className="font-semibold">{status}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">Health</div>
              <div className={`font-semibold ${health === 'HEALTHY' ? 'text-green-600' : 'text-yellow-600'}`}>
                {health}
              </div>
            </div>
          </div>
        </div>

        {/* Test Lab Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm border flex-1">
          <h2 className="text-xl font-bold mb-4">Sandbox Test Lab</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={handleBuild} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-md font-medium border">
              Build Workspace
            </button>
            <button onClick={handleTest} disabled={status === 'FEATURE_DRAFT'} className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 rounded-md font-medium border border-blue-200 disabled:opacity-50">
              Run Tests & Lint
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 rounded-md font-medium border border-purple-200">
              Live Preview
            </button>
            <button onClick={handleDeploy} disabled={status !== 'FEATURE_APPROVAL'} className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium shadow-sm disabled:opacity-50">
              Approve & Deploy
            </button>
            <button onClick={handleRollback} className="bg-red-50 hover:bg-red-100 text-red-700 py-3 rounded-md font-medium border border-red-200">
              Rollback Snapshot
            </button>
            <button className="bg-gray-800 text-white py-3 rounded-md font-medium">
              Disable Feature
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: Audit Logs */}
      <div className="w-1/2 bg-white rounded-lg shadow-sm border flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold">Audit History</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {logs.map(log => (
            <div key={log.id} className="p-3 bg-gray-50 rounded border text-sm">
              <div className="flex justify-between font-bold mb-1">
                <span>{log.action}</span>
                <span className={log.result === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}>{log.result}</span>
              </div>
              <div className="text-gray-600">{log.desc}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
