import { UserProfile } from '@clerk/clerk-react'

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Account Settings</h1>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <UserProfile routing="path" path="/settings" />
      </div>
    </div>
  )
}
