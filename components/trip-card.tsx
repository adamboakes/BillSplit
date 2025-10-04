"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

type TripCardProps = {
  trip: {
    id: string
    name: string
    description: string | null
    created_by: string
    created_at: string
  }
  currentUserId: string
}

export function TripCard({ trip, currentUserId }: TripCardProps) {
  const router = useRouter()
  const isCreator = trip.created_by === currentUserId

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleClick = () => {
    router.push(`/trips/${trip.id}`)
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-balance flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {trip.name}
            </CardTitle>
            {trip.description && <CardDescription className="mt-1 text-pretty">{trip.description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(trip.created_at)}</span>
            </div>
          </div>
          {isCreator && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Creator</span>}
        </div>
      </CardContent>
    </Card>
  )
}
