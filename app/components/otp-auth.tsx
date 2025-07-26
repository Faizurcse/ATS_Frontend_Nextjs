"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle } from "lucide-react"
import BASE_API_URL from '../../BaseUrlApi';


console.log("faiz--",BASE_API_URL)

export default function OTPAuth() {
  const [step, setStep] = useState<"send" | "verify">("send")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [timer, setTimer] = useState(120) // 2 minutes
  const [otpExpired, setOtpExpired] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (step === "verify" && timer > 0 && !otpExpired) {
      timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000)
    } else if (timer === 0) {
      setOtpExpired(true)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [step, timer, otpExpired])

  const handleResendOtp = async () => {
    setTimer(120)
    setOtpExpired(false)
    setStep("send")
    setOtp("")
    setSuccess("")
    setError("")
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`${BASE_API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to send OTP")
      localStorage.setItem("auth_email", email) // Save email in localStorage
      setStep("verify")
      setSuccess("OTP sent to your email.")
      toast({ title: "OTP Sent", description: "Check your email for the OTP." })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpExpired) {
      setError("OTP expired. Please resend OTP.")
      return
    }
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const storedEmail = localStorage.getItem("auth_email") || email
      const res = await fetch(`${BASE_API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: storedEmail, otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Invalid OTP")
      setSuccess("OTP verified! Redirecting to dashboard...")
      localStorage.setItem("authenticated", "true")
      toast({ title: "Login Successful", description: "You are now logged in." })
      setTimeout(() => {
        window.location.href = "/"
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <Card className="w-full max-w-md shadow-2xl border-0 rounded-2xl bg-white/90">
        <CardHeader className="flex flex-col items-center">
          <CheckCircle className="w-12 h-12 text-blue-500 mb-2" />
          <CardTitle className="text-3xl font-extrabold text-center text-blue-700 mb-1">
            {step === "send" ? "Sign In with OTP" : "Verify OTP"}
          </CardTitle>
          <p className="text-gray-500 text-center text-sm font-medium">
            Welcome to Appit ATS! Please enter your email to receive a one-time password.
          </p>
        </CardHeader>
        <CardContent>
          {error && <Alert variant="destructive" className="mb-4">{error}</Alert>}
          {success && <Alert variant="default" className="mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" />{success}</Alert>}
          {step === "send" ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="mt-2"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-2" disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Enter the OTP sent to your email"
                  required
                  className="mt-2 tracking-widest text-lg text-center"
                  maxLength={6}
                  disabled={otpExpired}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${otpExpired ? "text-red-500" : "text-blue-600"}`}>
                  {otpExpired ? "OTP expired" : `Expires in ${Math.floor(timer/60)}:${(timer%60).toString().padStart(2,"0")}`}
                </span>
                <Button type="button" variant="ghost" className="text-blue-600 hover:underline px-0" onClick={handleResendOtp} disabled={!otpExpired}>
                  Resend OTP
                </Button>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-2" disabled={loading || otpExpired}>
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-blue-600 hover:underline"
                onClick={() => { setStep("send"); setOtp(""); setTimer(120); setOtpExpired(false); setError(""); setSuccess(""); }}
                disabled={loading}
              >
                Change Email
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 