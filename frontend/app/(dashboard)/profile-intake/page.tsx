'use client'

import { AdvancedProfileIntake } from '@/components/dashboard/advanced-profile-intake'

export default function ProfileIntakePage() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Candidate Profile Intake</h1>
        <p className="text-muted-foreground mt-2">Submit a new candidate profile with comprehensive information</p>
      </div>
      <AdvancedProfileIntake />
    </div>
  )
}
