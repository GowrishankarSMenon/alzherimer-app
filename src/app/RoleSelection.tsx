interface RoleSelectionProps {
  handleRoleSelection: (role: string) => void;
}

export default function RoleSelection({ handleRoleSelection }: RoleSelectionProps) {
    return (
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-[#ed6325] mb-4 text-center">Welcome to Memory Guardian</h2>
        <p className=" mb-6 text-[#ed6325] text-center">Please select your role to continue</p>
        <div className="flex justify-center gap-6">
          <button 
            onClick={() => handleRoleSelection("patient")} 
            className="px-6 py-3 bg-[#ed6325] text-white rounded-lg shadow hover:bg-[#d75c23] transition flex flex-col items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Patient
            <p className="text-xs mt-1 text-[#ed6325]">Access your memories</p>
          </button>
          <button 
            onClick={() => handleRoleSelection("caretaker")} 
            className="px-6 py-3 bg-[#ed6325] text-white rounded-lg shadow hover:bg-[#d75c23] transition flex flex-col items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Caretaker
            <p className="text-xs mt-1 text-[#ed6325]">Help manage memories</p>
          </button>
        </div>
      </div>
    );
  }