import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ClientToaster } from "../components/ui/client-toaster"
import Script from "next/script"

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
      <body suppressHydrationWarning={true}>
        {children}
        <ClientToaster />
        <Script
          id="hydration-fix"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Fix hydration mismatch caused by browser extensions
              if (typeof window !== 'undefined') {
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.target === document.body) {
                      // Suppress hydration warnings for extension attributes
                      const body = document.body;
                      if (body.getAttribute('data-testim-main-word-scripts-loaded')) {
                        body.setAttribute('data-testim-main-word-scripts-loaded', 'true');
                      }
                    }
                  });
                });
                
                observer.observe(document.body, {
                  attributes: true,
                  attributeFilter: ['data-testim-main-word-scripts-loaded']
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
