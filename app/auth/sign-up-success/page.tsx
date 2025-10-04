import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, Mail } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Receipt className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-balance">SplitEasy</h1>
          </div>
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl text-center text-balance">Check your email</CardTitle>
              <CardDescription className="text-center text-pretty">We've sent you a confirmation link</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6 text-pretty">
                Please check your email and click the confirmation link to activate your account before signing in.
              </p>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
