"use client";


import { ProfileIntake } from "@/components/dashboard/profile-intake";


export default function ProfileIntakePage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Candidate Profile</h1>
        <p className="text-muted-foreground mt-2">
          Upload a resume PDF and connect a GitHub profile. We&apos;ll extract
          skills and store the profile for later job matching.
        </p>
      </div>
      <ProfileIntake />
    </div>
  );
}

