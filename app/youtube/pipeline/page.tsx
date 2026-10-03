'use client';

export default function PipelineBoard() {
  const columns = ['RESEARCH', 'IDEA', 'SCRIPT', 'VOICE', 'VISUALS', 'REVIEW', 'SCHEDULED', 'PUBLISHED'];
  const videos = [
    { id: 1, title: 'Top 5 AI Tools for Restaurants', status: 'IDEA' },
    { id: 2, title: 'Automate Your Marketing with ChatGPT', status: 'SCRIPT' },
    { id: 3, title: 'AI Customer Service Bots Explained', status: 'REVIEW' },
  ];

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Content Pipeline</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md">Generate New Video</button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {columns.map((col) => (
          <div key={col} className="min-w-[250px] bg-gray-100 rounded-lg p-4 flex flex-col">
            <h3 className="font-semibold text-gray-700 mb-4">{col}</h3>
            <div className="space-y-3 flex-1 overflow-y-auto">
              {videos.filter(v => v.status === col).map(video => (
                <div key={video.id} className="bg-white p-3 rounded shadow-sm border text-sm">
                  <div className="font-medium mb-2">{video.title}</div>
                  {col === 'REVIEW' && (
                    <div className="flex gap-2 mt-3">
                      <button className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Approve</button>
                      <button className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
