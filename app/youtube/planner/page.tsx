'use client';

export default function PlannerBoard() {
  const weeks = Array.from({ length: 13 }, (_, i) => i + 1); // 90 days = ~13 weeks

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">90-Day Strategy Planner</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md">Regenerate Plan</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weeks.map((week) => (
          <div key={week} className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-bold text-lg mb-2">Week {week}</h3>
            <ul className="space-y-3">
              <li className="text-sm">
                <span className="font-semibold text-blue-600">Long-form:</span> Top AI Trends for Q{Math.ceil(week/4)}
              </li>
              <li className="text-sm">
                <span className="font-semibold text-purple-600">Short:</span> ChatGPT Hack #1
              </li>
              <li className="text-sm">
                <span className="font-semibold text-purple-600">Short:</span> Midjourney Tip
              </li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
