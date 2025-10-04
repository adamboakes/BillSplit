"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Trash2, UserPlus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type Profile = {
  id: string
  email: string
  display_name: string | null
}

type BillData = {
  id: string
  title: string
  amount: number
  category: string
  paid_by: string
  created_at: string
  payer: Profile
  bill_participants: Array<{
    user: Profile
  }>
}

interface BillDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: BillData | null
  currentUserId: string
}

export function BillDetailsDialog({ open, onOpenChange, bill, currentUserId }: BillDetailsDialogProps) {
  const [searchEmail, setSearchEmail] = useState("")
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  if (!bill) return null

  const participants = [bill.payer, ...bill.bill_participants.map((bp) => bp.user)]
  const splitAmount = Number(bill.amount) / participants.length
  const isOwner = bill.paid_by === currentUserId

  const handleSearchUsers = async () => {
    if (!searchEmail.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      const participantIds = participants.map((p) => p.id)

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", `%${searchEmail}%`)
        .not("id", "in", `(${participantIds.join(",")})`)
        .limit(5)

      if (error) throw error

      setSearchResults(data || [])
    } catch (err) {
      console.error("Error searching users:", err)
      setError("Failed to search users")
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddParticipant = async (user: Profile) => {
    setIsUpdating(true)
    setError(null)

    try {
      const { error } = await supabase.from("bill_participants").insert({
        bill_id: bill.id,
        user_id: user.id,
      })

      if (error) throw error

      setSearchEmail("")
      setSearchResults([])
      router.refresh()
    } catch (err) {
      console.error("Error adding participant:", err)
      setError(err instanceof Error ? err.message : "Failed to add participant")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveParticipant = async (userId: string) => {
    if (userId === bill.paid_by) {
      setError("Cannot remove the person who paid")
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      const { error } = await supabase.from("bill_participants").delete().eq("bill_id", bill.id).eq("user_id", userId)

      if (error) throw error

      router.refresh()
    } catch (err) {
      console.error("Error removing participant:", err)
      setError(err instanceof Error ? err.message : "Failed to remove participant")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteBill = async () => {
    if (!confirm("Are you sure you want to delete this bill?")) return

    setIsUpdating(true)
    setError(null)

    try {
      const { error } = await supabase.from("bills").delete().eq("id", bill.id)

      if (error) throw error

      onOpenChange(false)
      router.refresh()
    } catch (err) {
      console.error("Error deleting bill:", err)
      setError(err instanceof Error ? err.message : "Failed to delete bill")
    } finally {
      setIsUpdating(false)
    }
  }

  const COLORS = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-teal-500"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-balance">Bill Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bill Info */}
          <div className="space-y-2">
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="text-lg font-semibold text-balance">{bill.title}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Total Amount</Label>
              <p className="text-2xl font-bold">${Number(bill.amount).toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Paid by</Label>
              <p className="font-medium text-balance">
                {bill.payer.id === currentUserId ? "You" : bill.payer.display_name || bill.payer.email}
              </p>
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <Label>Split between ({participants.length} people)</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
              {participants.map((person, index) => {
                const colorClass = COLORS[index % COLORS.length]
                const initial = (person.display_name || person.email)[0].toUpperCase()
                const isPayer = person.id === bill.paid_by

                return (
                  <div key={person.id} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center`}>
                        <span className="text-xs font-medium text-white">{initial}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-balance">
                          {person.display_name || person.email}
                          {person.id === currentUserId && " (You)"}
                        </p>
                        <p className="text-xs text-muted-foreground">${splitAmount.toFixed(2)}</p>
                      </div>
                    </div>
                    {isOwner && !isPayer && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveParticipant(person.id)}
                        disabled={isUpdating}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add Participants (only for owner) */}
          {isOwner && (
            <div className="space-y-2">
              <Label>Add more people</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearchUsers())}
                />
                <Button type="button" size="sm" onClick={handleSearchUsers} disabled={isSearching}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted">
                      <span className="text-sm text-balance">{user.display_name || user.email}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddParticipant(user)}
                        disabled={isUpdating}
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions */}
          {isOwner && (
            <div className="pt-2 border-t">
              <Button variant="destructive" className="w-full" onClick={handleDeleteBill} disabled={isUpdating}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Bill
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
