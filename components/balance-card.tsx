import { Card } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, Check } from "lucide-react"

interface BalanceCardProps {
  person: {
    id: string
    name: string
    isCurrentUser: boolean
  }
  balance: number
}

export function BalanceCard({ person, balance }: BalanceCardProps) {
  const isPositive = balance > 0
  const isZero = Math.abs(balance) < 0.01

  const COLORS = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-teal-500"]
  const colorClass = COLORS[person.id.charCodeAt(0) % COLORS.length]

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center`}>
            <span className="text-white font-semibold">{person.name[0]}</span>
          </div>
          <div>
            <p className="font-semibold text-balance">
              {person.name}
              {person.isCurrentUser && <span className="text-muted-foreground text-sm ml-1">(You)</span>}
            </p>
            {isZero ? (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Check className="w-3 h-3" />
                Settled up
              </p>
            ) : (
              <p className="text-sm text-muted-foreground text-pretty">{isPositive ? "Gets back" : "Owes"}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          {!isZero && (
            <>
              <p
                className={`text-xl font-bold flex items-center gap-1 ${
                  isPositive ? "text-accent" : "text-destructive"
                }`}
              >
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}$
                {Math.abs(balance).toFixed(2)}
              </p>
            </>
          )}
          {isZero && (
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <Check className="w-4 h-4 text-accent" />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
