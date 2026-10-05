'use client';
import { useState } from 'react';

export default function SignupPage() {
  const [status, setStatus] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.error) setStatus('Error: ' + data.error);
      else setStatus('Account created! Pending Admin approval.');
    } catch(e) {
      setStatus('Network error occurred.');
    }
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
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full border p-2 rounded" />
            </div>
            <button className="w-full h-14 bg-[#1B1E1C] hover:bg-black transition text-white rounded-full font-bold">Sign Up</button>
            <div className="text-center text-sm text-gray-500 mt-4 font-medium">or</div>
            <button type="button" className="w-full bg-[#F4F5F4] hover:bg-gray-200 transition h-14 text-black rounded-full font-bold flex justify-center items-center gap-2">
              Sign up with Google
            </button>
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 font-medium">
                  Already have an account?{' '}
                  <a href="/login" className="text-[#1B1E1C] font-semibold hover:underline">
                    Sign in
                  </a>
                </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
