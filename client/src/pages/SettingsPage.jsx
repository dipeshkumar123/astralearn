import { UserProfile } from '@clerk/clerk-react'

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-1 py-4 sm:py-6">
      <h1 className="mb-4 text-2xl font-bold text-slate-900 sm:mb-6 sm:text-3xl">Account Settings</h1>
      <div className="rounded-xl bg-white p-3 shadow-sm sm:p-4">
        <div className="overflow-x-auto">
          <UserProfile routing="path" path="/settings" />
        </div>
      </div>
    </div>
  )
}
