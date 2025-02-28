import { logOut, signInWithGoogle, auth } from "./lib/firebaseConfig";
import React from "react";
import Link from "next/link";

interface HeaderProps {
  user: {
    displayName?: string;
    email: string;
  } | null;
  userRole?: string | null;
}

const Header: React.FC<HeaderProps> = ({ user, userRole }) => {
  return (
    <header className="bg-white shadow-lg rounded-b-xl border border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-4 flex items-center justify-between">
        {/* App Name */}
        <div className="flex items-center">
          <span className="text-2xl font-bold text-indigo-600 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Memory Guardian
          </span>
        </div>

        {/* User Info / Authentication */}
        <div className="flex items-center space-x-6">
          {userRole === "patient" && (
            <Link href="/charity/diary">
              <button className="px-5 py-2 text-sm font-semibold bg-indigo-100 text-indigo-600 hover:bg-indigo-200 rounded-lg transition-all shadow-sm hover:shadow-md">
                View Diary
              </button>
            </Link>
          )}

          {user ? (
            <div className="flex items-center space-x-6">
              {/* User Details */}
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-800">
                  {user.displayName || user.email}
                </p>
                <p className="text-sm text-gray-500">
                  {userRole
                    ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`
                    : "Select Role"}
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => auth.signOut()}
                className="px-5 py-2 text-sm font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg transition-all shadow-sm hover:shadow-md"
              >
                Log Out
              </button>
            </div>
          ) : (
            /* Sign In Button */
            <button
              onClick={signInWithGoogle}
              className="px-6 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;