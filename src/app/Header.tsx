import { logOut, signInWithGoogle, auth } from "./lib/firebaseConfig";
import React from "react";

interface HeaderProps {
  user: {
    displayName?: string;
    email: string;
  } | null;
  userRole?: string | null;
}

const Header: React.FC<HeaderProps> = ({ user, userRole }) => {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-5 flex items-center justify-between">
        {/* App Name */}
        <div className="flex items-center">
          <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            Memory Guardian
          </span>
        </div>

        {/* User Info / Authentication */}
        <div>
          {user ? (
            <div className="flex items-center space-x-6">
              {/* User Details */}
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {user.displayName || user.email}
                </p>
                <p className="text-md text-gray-600 dark:text-gray-400">
                  {userRole ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}` : "Select Role"}
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => auth.signOut()}
                className="px-5 py-2 text-lg font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                Log Out
              </button>
            </div>
          ) : (
            /* Sign In Button */
            <button
              onClick={signInWithGoogle}
              className="px-6 py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
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
