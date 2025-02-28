interface ConnectedUser {
  uid: string;
  displayName?: string;
  email: string;
}

interface ConnectedCaretakersProps {
  connectedUsers: ConnectedUser[];
  removeConnection: (uid: string) => void;
  title: string;
}

export default function ConnectedCaretakers({ connectedUsers, removeConnection }: ConnectedCaretakersProps) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Connected Caretakers</h2>
        {connectedUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedUsers.map((connectedUser) => (
              <div key={connectedUser.uid} className="bg-white rounded-lg shadow p-4">
                <h3 className="font-bold text-lg mb-1 overflow-auto">{connectedUser.displayName || connectedUser.email}</h3>
                <p className="text-sm text-gray-500 mb-2 overflow-auto">{connectedUser.email}</p>
                <button 
                  onClick={() => removeConnection(connectedUser.uid)} 
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Remove Connection
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No connected caretakers</p>
        )}
      </div>
    );
  }