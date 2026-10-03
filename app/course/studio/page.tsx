'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CourseStudio() {
  const [prompt, setPrompt] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const router = useRouter();

  const startGeneration = async () => {
    const res = await fetch('/api/course/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, userId: 'current-user-id' }),
    });
    const data = await res.json();
    setJobId(data.jobId);
    setStatus('QUEUED');
  };

  const checkStatus = async () => {
    if (!jobId) return;
    const res = await fetch(`/api/course/job/${jobId}`);
    const data = await res.json();
    setStatus(data.status);
    if (data.status === 'COMPLETED') {
      router.push(`/course/${data.courseId}`);
    }
  };

  const pauseJob = async () => {
    if (!jobId) return;
    await fetch(`/api/course/job/${jobId}/pause`, { method: 'POST' });
    setStatus('PAUSED');
  };

  const resumeJob = async () => {
    if (!jobId) return;
    await fetch(`/api/course/job/${jobId}/resume`, { method: 'POST' });
    setStatus('QUEUED');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Course Studio</h1>
      <textarea
        className="w-full h-32 p-2 border rounded"
        placeholder="Enter a course prompt, e.g., 'Create a complete course teaching beginners how to build professional websites with AI.'"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="mt-4 flex gap-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={startGeneration}
          disabled={!prompt || !!jobId}
        >
          Generate Course
        </button>
        {jobId && (
          <>
            <button className="bg-gray-200 px-4 py-2 rounded" onClick={checkStatus}>Check Status</button>
            {status === 'QUEUED' && <button className="bg-yellow-500 text-white px-4 py-2 rounded" onClick={pauseJob}>Pause</button>}
            {status === 'PAUSED' && <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={resumeJob}>Resume</button>}
          </>
        )}
      </div>
      {jobId && <p className="mt-2">Job ID: {jobId} – Status: {status}</p>}
    </div>
  );
}
