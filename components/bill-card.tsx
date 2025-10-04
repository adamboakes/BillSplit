"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Receipt } from "lucide-react"
import { BillDetailsDialog } from "@/components/bill-details-dialog"

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

interface BillCardProps {
  bill: BillData
  currentUserId: string
}

const COLORS = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-teal-500"]

export function BillCard({ bill, currentUserId }: BillCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const participants = [bill.payer, ...bill.bill_participants.map((bp) => bp.user)]
  const splitAmount = Number(bill.amount) / participants.length
  const date = new Date(bill.created_at)
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

  const payerName = bill.payer.id === currentUserId ? "You" : bill.payer.display_name || bill.payer.email

  return (
    <>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDetails(true)}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Receipt className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-balance">{bill.title}</h3>
              <span className="font-bold text-lg whitespace-nowrap">${Number(bill.amount).toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2 text-pretty">
              Paid by {payerName} • {formattedDate}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Split between:</span>
              <div className="flex -space-x-2">
                {participants.map((person, index) => {
                  const initial = (person.display_name || person.email)[0].toUpperCase()
                  const colorClass = COLORS[index % COLORS.length]
                  return (
                    <div
                      key={person.id}
                      className={`w-6 h-6 rounded-full ${colorClass} border-2 border-card flex items-center justify-center`}
                      title={person.display_name || person.email}
                    >
                      <span className="text-xs font-medium text-white">{initial}</span>
                    </div>
                  )
                })}
              </div>
              <span className="text-xs font-medium text-muted-foreground">${splitAmount.toFixed(2)} each</span>
            </div>
          </div>
        </div>
      </Card>

      <BillDetailsDialog open={showDetails} onOpenChange={setShowDetails} bill={bill} currentUserId={currentUserId} />
    </>
  )
}
