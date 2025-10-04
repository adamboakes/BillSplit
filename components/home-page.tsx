"use client"

import { useState } from "react"
import { Plus, Users, Receipt, DollarSign, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AddBillDialog } from "@/components/add-bill-dialog"
import { BillCard } from "@/components/bill-card"
import { BalanceCard } from "@/components/balance-card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

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

type HomePageProps = {
  user: User
  profile: Profile | null
  initialBills: BillData[]
}

export function HomePage({ user, profile, initialBills }: HomePageProps) {
  const [bills, setBills] = useState<BillData[]>(initialBills)
  const [isAddBillOpen, setIsAddBillOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const calculateBalances = () => {
    const balances: Record<string, number> = {}

    // Initialize current user's balance
    balances[user.id] = 0

    bills.forEach((bill) => {
      const participants = [bill.payer, ...bill.bill_participants.map((bp) => bp.user)]
      const splitAmount = Number(bill.amount) / participants.length

      participants.forEach((participant) => {
        if (!balances[participant.id]) {
          balances[participant.id] = 0
        }

        if (participant.id !== bill.paid_by) {
          balances[participant.id] -= splitAmount
          balances[bill.paid_by] += splitAmount
        }
      })
    })

    return balances
  }

  const balances = calculateBalances()
  const totalExpenses = bills.reduce((sum, bill) => sum + Number(bill.amount), 0)

  // Get unique users from all bills
  const allUsers = new Map<string, Profile>()
  bills.forEach((bill) => {
    allUsers.set(bill.payer.id, bill.payer)
    bill.bill_participants.forEach((bp) => {
      allUsers.set(bp.user.id, bp.user)
    })
  })

  const handleBillAdded = () => {
    setIsAddBillOpen(false)
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
                <Receipt className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance">SplitEasy</h1>
                <p className="text-xs text-muted-foreground">{profile?.display_name || user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="rounded-full" onClick={() => setIsAddBillOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Bill
              </Button>
              <Button size="sm" variant="ghost" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-4 bg-gradient-to-br from-primary to-accent border-0 text-primary-foreground">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium opacity-90">Total</span>
            </div>
            <p className="text-2xl font-bold text-balance">${totalExpenses.toFixed(2)}</p>
          </Card>
          <Card className="p-4 bg-card border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">People</span>
            </div>
            <p className="text-2xl font-bold text-balance">{allUsers.size}</p>
          </Card>
        </div>

        {/* Balances */}
        {allUsers.size > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-balance">Balances</h2>
            <div className="space-y-2">
              {Array.from(allUsers.values()).map((person) => (
                <BalanceCard
                  key={person.id}
                  person={{
                    id: person.id,
                    name: person.display_name || person.email,
                    isCurrentUser: person.id === user.id,
                  }}
                  balance={balances[person.id] || 0}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recent Bills */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-balance">Recent Bills</h2>
          </div>
          <div className="space-y-3">
            {bills.length === 0 ? (
              <Card className="p-8 text-center">
                <Receipt className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-4 text-balance">
                  No bills yet. Add your first bill to get started!
                </p>
                <Button onClick={() => setIsAddBillOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Bill
                </Button>
              </Card>
            ) : (
              bills.map((bill) => <BillCard key={bill.id} bill={bill} currentUserId={user.id} />)
            )}
          </div>
        </section>
      </main>

      <AddBillDialog
        open={isAddBillOpen}
        onOpenChange={setIsAddBillOpen}
        userId={user.id}
        onBillAdded={handleBillAdded}
      />
    </div>
  )
}
