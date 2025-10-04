"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AddBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onBillAdded: () => void
}

type UserProfile = {
  id: string
  email: string
  display_name: string | null
}

export function AddBillDialog({ open, onOpenChange, userId, onBillAdded }: AddBillDialogProps) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [splitWith, setSplitWith] = useState<string[]>([])
  const [searchEmail, setSearchEmail] = useState("")
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSearchUsers = async () => {
    if (!searchEmail.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", `%${searchEmail}%`)
        .neq("id", userId)
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

  const toggleUser = (userToAdd: UserProfile) => {
    setSplitWith((prev) => {
      if (prev.includes(userToAdd.id)) {
        return prev.filter((id) => id !== userToAdd.id)
      }
      return [...prev, userToAdd.id]
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return

    setIsSubmitting(true)
    setError(null)

    try {
      // Create the bill
      const { data: bill, error: billError } = await supabase
        .from("bills")
        .insert({
          title,
          amount: Number.parseFloat(amount),
          paid_by: userId,
          category: "General",
        })
        .select()
        .single()

      if (billError) throw billError

      // Add participants (including the payer)
      const participantsToAdd = [userId, ...splitWith]
      const { error: participantsError } = await supabase.from("bill_participants").insert(
        participantsToAdd.map((participantId) => ({
          bill_id: bill.id,
          user_id: participantId,
        })),
      )

      if (participantsError) throw participantsError

      // Reset form
      setTitle("")
      setAmount("")
      setSplitWith([])
      setSearchEmail("")
      setSearchResults([])
      onBillAdded()
    } catch (err) {
      console.error("Error creating bill:", err)
      setError(err instanceof Error ? err.message : "Failed to create bill")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedUsers = searchResults.filter((user) => splitWith.includes(user.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-balance">Add New Bill</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Description</Label>
            <Input
              id="title"
              placeholder="Dinner, groceries, etc."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Split with</Label>
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
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {searchResults.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={splitWith.includes(user.id)}
                      onCheckedChange={() => toggleUser(user)}
                    />
                    <label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer text-sm">
                      {user.display_name || user.email}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {selectedUsers.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Splitting with: You + {selectedUsers.map((u) => u.display_name || u.email).join(", ")}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Adding Bill..." : "Add Bill"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
