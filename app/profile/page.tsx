'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { User, Mail, Shield, LogOut, Save, Camera, Key } from 'lucide-react'

export default function ProfilePage() {
  const [name, setName] = useState('Admin User')
  const [email, setEmail] = useState('realitydesign5561@gmail.com')
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    setIsEditing(false)
    alert('Profile updated successfully!')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full max-w-5xl mx-auto px-4 lg:px-8 py-6">
      
      <div className="mb-8">
        <h1 className="text-4xl font-light tracking-tight text-[#1B1E1C]">Your <span className="font-medium">Profile</span></h1>
        <p className="text-gray-500 font-medium mt-2">Manage your account details and security settings.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-[2rem] bg-white border border-gray-100 p-8 shadow-sm flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              <div className="size-32 rounded-full bg-[#F4F5F4] border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                <User className="size-12 text-gray-400" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="size-6" />
              </div>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-[#1B1E1C]">{name}</h2>
            <p className="text-sm text-gray-500 font-medium">{email}</p>
            <div className="mt-6 w-full flex flex-col gap-3">
              <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center justify-center gap-2 rounded-full bg-[#1B1E1C] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black">
                <LogOut className="size-4" /> Sign Out
              </button>
              <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50">
                <User className="size-4" /> Change Account
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[2.5rem] bg-white border border-gray-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Personal Information</h3>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="text-sm font-semibold text-[#1B1E1C] hover:underline">Edit</button>
              ) : (
                <button onClick={handleSave} className="flex items-center gap-2 text-sm font-semibold text-white bg-[#1B1E1C] px-4 py-2 rounded-full hover:bg-black transition">
                  <Save className="size-4" /> Save Changes
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 bg-[#F4F5F4] border border-transparent focus:border-gray-300 focus:bg-white rounded-xl outline-none transition disabled:opacity-70 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 bg-[#F4F5F4] border border-transparent focus:border-gray-300 focus:bg-white rounded-xl outline-none transition disabled:opacity-70 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-semibold mb-6">Security</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition text-left">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-[#EAF79F] flex items-center justify-center">
                    <Key className="size-5 text-[#1B1E1C]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Change Password</p>
                    <p className="text-xs text-gray-500">Update your password for better security</p>
                  </div>
                </div>
                <span className="text-[#1B1E1C] font-semibold text-sm">Update</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition text-left">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-full bg-[#1B1E1C] flex items-center justify-center">
                    <Shield className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <span className="text-[#1B1E1C] font-semibold text-sm">Enable</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
