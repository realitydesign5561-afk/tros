'use client';

export default function ConnectionsPage() {
  const platforms = [
    { name: 'Twitter / X', status: 'Connected' },
    { name: 'LinkedIn', status: 'Needs reauthorization' },
    { name: 'Facebook', status: 'Disconnected' },
    { name: 'Instagram', status: 'Disconnected' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Social Accounts Connection Manager</h1>
      <p className="text-gray-600 mb-8">
        Securely connect your social media accounts via OAuth. We never store your raw passwords.
      </p>

      <div className="grid gap-4">
        {platforms.map((platform) => (
          <div key={platform.name} className="flex justify-between items-center p-6 border rounded-lg bg-white shadow-sm">
            <div>
              <h3 className="text-lg font-semibold">{platform.name}</h3>
              <p className={`text-sm mt-1 ${
                platform.status === 'Connected' ? 'text-green-600' : 
                platform.status === 'Needs reauthorization' ? 'text-orange-600' : 'text-gray-500'
              }`}>
                {platform.status}
              </p>
            </div>
            
            <button className={`px-4 py-2 rounded-md font-medium ${
              platform.status === 'Connected' ? 'bg-gray-100 text-gray-700' : 'bg-blue-600 text-white'
            }`}>
              {platform.status === 'Connected' ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
