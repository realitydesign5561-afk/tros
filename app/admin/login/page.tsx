'use client';
import { useState } from 'react';

export default function AdminLogin() {
  const [error, setError] = useState('');

  const handleLogin = (e: any) => {
    e.preventDefault();
    // In real app, authenticates against User table where role='ADMIN'
    window.location.href = '/admin/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-[400px] border border-gray-700">
        <h1 className="text-2xl font-bold mb-2 text-center text-white">TROS Administration</h1>
        <p className="text-gray-400 text-center mb-6 text-sm">Secure System Access</p>
        
        {error && <div className="p-3 bg-red-900/50 text-red-200 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Admin Email</label>
            <input type="email" required className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
            <input type="password" required className="w-full bg-gray-900 border border-gray-700 p-2 rounded text-white" />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-medium mt-4">Secure Login</button>
        </form>
      </div>
    </div>
  );
}
