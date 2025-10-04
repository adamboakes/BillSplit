"use client"

import { useState } from "react"
import { Plus, MapPin, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { CreateTripDialog } from "@/components/create-trip-dialog"
import { TripCard } from "@/components/trip-card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

type Profile = {
  id: string
  email: string
  display_name: string | null
}

type TripData = {
  id: string
  name: string
  description: string | null
  created_by: string
  created_at: string
  creator: Profile
  trip_participants: Array<{
    user: Profile
  }>
}

type TripsPageProps = {
  user: User
  profile: Profile | null
  initialTrips: TripData[]
}

export function TripsPage({ user, profile, initialTrips }: TripsPageProps) {
  const [trips, setTrips] = useState<TripData[]>(initialTrips)
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const handleTripCreated = () => {
    setIsCreateTripOpen(false)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance">SplitEasy</h1>
                <p className="text-xs text-muted-foreground">{profile?.display_name || user.email}</p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Header Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-balance">Your Trips</h2>
          <p className="text-muted-foreground text-pretty">Create trips and split expenses with friends</p>
        </div>

        {/* Trips List */}
        <div className="space-y-4">
          {trips.length === 0 ? (
            <Card className="p-8 text-center">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <CardTitle className="mb-2 text-balance">No trips yet</CardTitle>
              <CardDescription className="mb-4 text-pretty">
                Create your first trip to start splitting bills with friends
              </CardDescription>
              <Button onClick={() => setIsCreateTripOpen(true)} size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Trip
              </Button>
            </Card>
          ) : (
            <>
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} currentUserId={user.id} />
              ))}
              <Button onClick={() => setIsCreateTripOpen(true)} variant="outline" size="lg" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create New Trip
              </Button>
            </>
          )}
        </div>
      </main>

      <CreateTripDialog
        open={isCreateTripOpen}
        onOpenChange={setIsCreateTripOpen}
        userId={user.id}
        onTripCreated={handleTripCreated}
      />
    </div>
  )
}
