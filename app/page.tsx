import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TripsPage } from "@/components/trips-page"

export default async function Page() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  let trips = []
  let profile = null

  try {
    const tripsResponse = await supabase.from("trips").select("*").order("created_at", { ascending: false })

    if (!tripsResponse.error) {
      trips = tripsResponse.data || []
    }

    const profileResponse = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

    if (!profileResponse.error) {
      profile = profileResponse.data
    }
  } catch (err) {
    console.error("Database error:", err)
  }

  return <TripsPage user={data.user} profile={profile} initialTrips={trips} />
}
