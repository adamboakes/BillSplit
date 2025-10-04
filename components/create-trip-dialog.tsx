"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

type CreateTripDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onTripCreated: () => void
}

export function CreateTripDialog({ open, onOpenChange, userId, onTripCreated }: CreateTripDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("[v0] Creating trip:", { name, description, userId })

      const { data, error } = await supabase
        .from("trips")
        .insert({
          name,
          description: description || null,
          created_by: userId,
        })
        .select()

      console.log("[v0] Trip creation response:", { data, error })

      if (error) throw error

      setName("")
      setDescription("")
      onOpenChange(false)
      onTripCreated()
    } catch (error) {
      console.error("[v0] Error creating trip:", error)
      alert("Failed to create trip. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-balance">Create New Trip</DialogTitle>
          <DialogDescription className="text-pretty">Start a new trip to split expenses with friends</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Trip Name</Label>
            <Input
              id="name"
              placeholder="Weekend in Paris"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="A fun weekend getaway with friends"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Trip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
