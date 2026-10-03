'use client';
import { useState } from 'react';

export default function ConversationalDesigner() {
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [input, setInput] = useState('');
  const [versions, setVersions] = useState<string[]>([
    'https://via.placeholder.com/600x400?text=Design+Canvas'
  ]);
  const [activeVersion, setActiveVersion] = useState(0);

  const sendMessage = async () => {
    if (!input) return;
    setMessages([...messages, { role: 'user', text: input }]);
    
    // Simulate AI response delay
    setTimeout(() => {
      setMessages(m => [...m, { role: 'agent', text: 'Design updated successfully!' }]);
      setVersions(v => [...v, `https://via.placeholder.com/600x400?text=Design+Version+${v.length + 1}`]);
      setActiveVersion(versions.length);
    }, 1500);

    setInput('');
  };

  const undo = () => setActiveVersion(Math.max(0, activeVersion - 1));
  const redo = () => setActiveVersion(Math.min(versions.length - 1, activeVersion + 1));

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat Panel */}
      <div className="w-1/3 border-r bg-white flex flex-col">
        <div className="p-4 border-b font-bold text-lg">AI Designer Studio</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`p-3 rounded-lg w-fit max-w-[85%] ${m.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="p-4 border-t flex gap-2">
          <input 
            className="flex-1 border p-2 rounded"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Make the gold brighter..."
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button className="bg-black text-white px-4 py-2 rounded" onClick={sendMessage}>Send</button>
        </div>
      </div>

      {/* Canvas Panel */}
      <div className="flex-1 flex flex-col p-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button onClick={undo} disabled={activeVersion === 0} className="px-3 py-1 border rounded disabled:opacity-50">Undo</button>
            <button onClick={redo} disabled={activeVersion === versions.length - 1} className="px-3 py-1 border rounded disabled:opacity-50">Redo</button>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-600 text-white rounded">Download PNG (Transparent)</button>
          </div>
        </div>
        <div className="flex-1 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
          <img src={versions[activeVersion]} alt="Active Design" className="max-w-full max-h-full object-contain" />
        </div>
        <div className="text-center mt-2 text-sm text-gray-500">
          Version {activeVersion + 1} of {versions.length}
        </div>
      </div>
    </div>
  );
}
