'use client';

export default function CalendarPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">30-Day Content Calendar</h1>
        <div className="flex gap-2">
          <button className="bg-gray-200 px-4 py-2 rounded-md">Generate Today's Content</button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md">Generate Campaign</button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-4">
        {/* Placeholder for 30 days */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="border p-4 rounded-md min-h-[120px] flex flex-col justify-between">
            <span className="text-sm font-semibold text-gray-500">Day {i + 1}</span>
            {i === 0 && (
              <div className="bg-yellow-100 text-yellow-800 text-xs p-1 rounded mt-2">DRAFT</div>
            )}
            {i === 1 && (
              <div className="bg-blue-100 text-blue-800 text-xs p-1 rounded mt-2">SCHEDULED</div>
            )}
            
            <div className="mt-2 text-xs flex gap-1 flex-wrap">
              <button className="bg-gray-100 px-1 py-0.5 rounded">Visual</button>
              <button className="bg-green-100 text-green-800 px-1 py-0.5 rounded">Approve</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
