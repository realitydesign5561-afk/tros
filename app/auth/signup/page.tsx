'use client';
import { useState } from 'react';

export default function SignupPage() {
  const [status, setStatus] = useState('');

  const handleSignup = (e: any) => {
    e.preventDefault();
    setStatus('Account created! Pending Admin approval.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-[400px]">
        <h1 className="text-2xl font-bold mb-6 text-center">Create TROS Account</h1>
        
        {status ? (
          <div className="p-4 bg-yellow-50 text-yellow-800 rounded mb-4 text-center font-medium">
            {status}
          </div>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" required className="w-full border p-2 rounded" />
            </div>
            <button className="w-full bg-blue-600 text-white p-2 rounded font-medium">Sign Up</button>
            <div className="text-center text-sm text-gray-500 mt-4">or</div>
            <button type="button" className="w-full bg-white border p-2 rounded font-medium flex justify-center items-center gap-2">
              Sign up with Google
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
