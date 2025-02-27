import { logOut, signInWithGoogle, auth } from "./lib/firebaseConfig";
import React from 'react';
interface HeaderProps {
  user: {
    displayName?: string;
    email: string;
  } | null;
  userRole?: string | null;
}

const Header: React.FC<HeaderProps> = ({ user, userRole }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-indigo-600">Memory Guardian</span>
        </div>
        <div>
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.displayName || user.email}</p>
                <p className="text-xs text-gray-500">{userRole ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)}` : "Select Role"}</p>
              </div>
              <button 
                onClick={() => auth.signOut()} 
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle} 
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
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