"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Brain, Menu, X, LogIn, LogOut, User } from "lucide-react"
import { auth, signInWithGoogle, logOut } from "../lib/firebaseConfig"
import { onAuthStateChanged } from "firebase/auth"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
    })

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      unsubscribe()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <nav className={`navbar fixed w-full z-10 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Brain className="h-8 w-8 mr-2" />
          <Link href="/" className="text-2xl font-bold">
            MemoryVault
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="hover:text-accent-300 transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-accent-300 transition-colors">
            About
          </Link>
          <Link href="/how-it-works" className="hover:text-accent-300 transition-colors">
            How It Works
          </Link>
          <Link href="/resources" className="hover:text-accent-300 transition-colors">
            Resources
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span className="text-sm">{user.displayName?.split(" ")[0] || "User"}</span>
              </div>
              <button
                onClick={logOut}
                className="flex items-center px-4 py-2 rounded-md bg-secondary-500 hover:bg-secondary-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center px-4 py-2 rounded-md bg-accent-500 hover:bg-accent-600 transition-colors text-black"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </button>
          )}
        </div>

        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary-800 py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <Link
              href="/"
              className="py-2 hover:text-accent-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="py-2 hover:text-accent-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/how-it-works"
              className="py-2 hover:text-accent-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/resources"
              className="py-2 hover:text-accent-300 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Resources
            </Link>

            <div className="pt-4 border-t border-primary-600">
              {user ? (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    <span>{user.displayName || user.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      logOut()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center px-4 py-2 rounded-md bg-secondary-500 hover:bg-secondary-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    signInWithGoogle()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center px-4 py-2 rounded-md bg-accent-500 hover:bg-accent-600 transition-colors text-black"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

