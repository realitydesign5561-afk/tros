'use client';
import { useState, useRef } from 'react';
import { Sparkles, Upload, Image as ImageIcon, Send, ArrowRight, Loader2 } from 'lucide-react';

export default function ConversationalDesigner() {
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [input, setInput] = useState('');
  const [versions, setVersions] = useState<string[]>([]);
  const [activeVersion, setActiveVersion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setVersions([url]);
      setActiveVersion(0);
      setMessages(m => [...m, { role: 'user', text: `[Uploaded Image: ${file.name}]` }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    setMessages(m => [...m, { role: 'user', text: input }]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    
    try {
      const formData = new FormData()
      formData.append('prompt', currentInput)
      formData.append('provider', 'automatic')
      formData.append('format', 'png')
      
      const fileInput = fileInputRef.current;
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        formData.append('reference', fileInput.files[0])
      }

      const res = await fetch('/api/designer', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate')

      setVersions(v => [...v, data.outputUrl]);
      setActiveVersion(v => v.length);
      setMessages(m => [...m, { role: 'agent', text: 'I updated the design based on your request!' }]);
    } catch (err: any) {
      setMessages(m => [...m, { role: 'agent', text: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const undo = () => setActiveVersion(Math.max(0, activeVersion - 1));
  const redo = () => setActiveVersion(Math.min(versions.length - 1, activeVersion + 1));

  return (
    <div className="flex h-screen bg-[#A9B3A7] p-4 md:p-8">
      <div className="flex w-full h-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        {/* Chat Panel */}
        <div className="w-[400px] border-r border-gray-100 bg-[#F4F5F4] flex flex-col">
          <div className="p-6 border-b border-gray-200 bg-white flex items-center gap-3">
            <div className="size-10 bg-[#EAF79F] rounded-xl flex items-center justify-center text-[#1B1E1C]">
              <Sparkles className="size-5" />
            </div>
            <div className="font-semibold text-xl tracking-tight text-[#1B1E1C]">AI Designer</div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 font-medium mt-10">
                Upload a base design to edit, or prompt me to generate a new design from scratch.
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`p-4 rounded-2xl w-fit max-w-[85%] text-sm font-medium ${m.role === 'user' ? 'bg-[#1B1E1C] text-white ml-auto' : 'bg-white border border-gray-100 text-gray-800 shadow-sm'}`}>
                  {m.text}
                </div>
              ))
            )}
            {loading && (
              <div className="p-4 rounded-2xl w-fit max-w-[85%] bg-white border border-gray-100 shadow-sm flex items-center gap-2 text-sm font-medium text-gray-500">
                <Loader2 className="size-4 animate-spin" /> Designing...
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex flex-col gap-3">
              {uploadedImage && (
                <div className="relative w-16 h-16 rounded-xl border-2 border-[#EAF79F] overflow-hidden">
                  <img src={uploadedImage} alt="Reference" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="relative flex items-center bg-[#F4F5F4] rounded-2xl border border-gray-200 p-1 focus-within:border-[#1B1E1C] transition-colors">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-gray-400 hover:text-black transition"
                  title="Upload Image"
                >
                  <Upload className="size-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  accept="image/*"
                />
                
                <input 
                  className="flex-1 bg-transparent px-2 text-sm font-medium outline-none text-black"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Generate or redesign..."
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                
                <button 
                  className="p-3 bg-[#1B1E1C] text-white rounded-xl hover:bg-black transition disabled:opacity-50" 
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                >
                  <Send className="size-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Panel */}
        <div className="flex-1 flex flex-col p-8 bg-white relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button onClick={undo} disabled={activeVersion === 0 || versions.length === 0} className="px-5 py-2.5 bg-[#F4F5F4] rounded-full text-sm font-bold disabled:opacity-50 hover:bg-gray-200 transition">Undo</button>
              <button onClick={redo} disabled={activeVersion === versions.length - 1 || versions.length === 0} className="px-5 py-2.5 bg-[#F4F5F4] rounded-full text-sm font-bold disabled:opacity-50 hover:bg-gray-200 transition">Redo</button>
            </div>
            <div className="flex gap-2">
              <button disabled={versions.length === 0} className="px-6 py-2.5 bg-[#EAF79F] text-[#1B1E1C] font-bold rounded-full disabled:opacity-50 hover:brightness-95 transition flex items-center gap-2">
                Download <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-[#F4F5F4] rounded-[2rem] flex items-center justify-center overflow-hidden border border-gray-100 shadow-inner relative">
            {versions.length > 0 ? (
              <img src={versions[activeVersion]} alt="Active Design" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-center text-gray-400 flex flex-col items-center">
                <ImageIcon className="size-16 mb-4 opacity-50" />
                <p className="font-medium">No design active. Upload an image or generate one.</p>
              </div>
            )}
          </div>
          
          {versions.length > 0 && (
            <div className="text-center mt-6 text-sm font-bold text-gray-400 uppercase tracking-widest">
              Version {activeVersion + 1} of {versions.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
