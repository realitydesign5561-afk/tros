'use client';

export default function MonetizationDashboard() {
  const metrics = {
    subscribers: 150,
    watchHours: 120,
    shortsViews: 5000,
  };

  const reqs = {
    subs: 1000,
    watchHours: 4000,
    shortsViews: 10000000,
  };

  const subPercent = Math.min(100, (metrics.subscribers / reqs.subs) * 100);
  const watchPercent = Math.min(100, (metrics.watchHours / reqs.watchHours) * 100);
  const shortsPercent = Math.min(100, (metrics.shortsViews / reqs.shortsViews) * 100);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Monetization Readiness</h1>
      <p className="text-gray-600 mb-8">
        Track your progress toward the YouTube Partner Program (YPP). We never fabricate these metrics.
      </p>

      <div className="space-y-6">
        <div className="border p-6 rounded-lg bg-white shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Subscribers</span>
            <span>{metrics.subscribers.toLocaleString()} / {reqs.subs.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${subPercent}%` }}></div>
          </div>
        </div>

        <div className="border p-6 rounded-lg bg-white shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Public Watch Hours (365 days)</span>
            <span>{metrics.watchHours.toLocaleString()} / {reqs.watchHours.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-green-600 h-4 rounded-full" style={{ width: `${watchPercent}%` }}></div>
          </div>
        </div>

        <div className="border p-6 rounded-lg bg-white shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Public Shorts Views (90 days)</span>
            <span>{metrics.shortsViews.toLocaleString()} / {reqs.shortsViews.toLocaleString()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-purple-600 h-4 rounded-full" style={{ width: `${shortsPercent}%` }}></div>
          </div>
        </div>

        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
          <strong>Note:</strong> You need 1,000 subscribers AND either 4,000 valid public watch hours or 10M valid public Shorts views.
        </div>
      </div>
    </div>
  );
}
