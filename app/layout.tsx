import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "APPIT Software - AI Powered ATS | Intelligent Recruitment Platform",
  description:
    "Transform your hiring process with APPIT Software's AI-powered Applicant Tracking System. Advanced candidate matching, automated screening, interview scheduling, and recruitment analytics. Streamline talent acquisition with cutting-edge AI technology.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
