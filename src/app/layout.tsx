import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Navbar from "./components/navbar"

export const metadata: Metadata = {
  title: "MemoryVault - Alzheimer's Care App",
  description: "Blockchain storage solution for people with Alzheimer's and memory-related issues",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}

