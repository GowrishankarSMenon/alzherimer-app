interface PendingRequest {
  uid: string;
  displayName?: string;
  email: string;
}

interface PendingRequestsProps {
  pendingRequests: PendingRequest[];
  acceptConnectionRequest: (uid: string) => void;
  rejectConnectionRequest: (uid: string) => void;
}

export default function PendingRequests({ pendingRequests, acceptConnectionRequest, rejectConnectionRequest }: PendingRequestsProps) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-[#ed6325] mb-4">Pending Requests</h2>
        {pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map((request) => (
              <div key={request.uid} className="bg-white rounded-lg shadow p-4">
                <h3 className="font-bold text-lg mb-1">{request.displayName || request.email}</h3>
                <p className="text-sm text-gray-500 mb-2">{request.email}</p>
                <button 
                  onClick={() => acceptConnectionRequest(request.uid)} 
                  className="px-3 py-1 text-sm bg-[#ed6325] text-white rounded hover:bg-[#d75c23] transition"
                >
                  Accept
                </button>
                <button 
                  onClick={() => rejectConnectionRequest(request.uid)} 
                  className="ml-2 px-3 py-1 text-sm bg-[#ed6325] text-white rounded hover:bg-[#d75c23] transition"
                >
                  Reject
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No pending requests</p>
        )}
      </div>
    );
  }