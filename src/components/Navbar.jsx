const ROLES = ["Public / Student", "Historian", "Museum Admin"];

export default function Navbar({ currentRole, setCurrentRole }) {
  return (
    <nav className="bg-museum-800/80 backdrop-blur-md border-b border-museum-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Logo */}
        <div className="flex items-center gap-4">
          <span className="text-3xl">📜</span>
          <div>
            <div className="text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600 tracking-wider">
              LIPISUTRA
            </div>
            <div className="text-[10px] text-slate-400 tracking-[0.2em] font-semibold mt-0.5">
              HISTORICAL DOCUMENT AI
            </div>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold hidden sm:inline-block">Viewing as</span>
          <div className="flex bg-museum-900 p-1.5 rounded-full border border-museum-700/50 shadow-inner">
            {ROLES.map(role => {
              const active = currentRole === role;
              return (
                <button 
                  key={role}
                  onClick={() => setCurrentRole(role)}
                  className={`
                    px-5 py-2 rounded-full text-xs font-medium transition-all duration-300
                    ${active ? "bg-museum-700 text-gold-400 shadow-md border border-museum-600/30" : "text-slate-400 hover:text-slate-200 hover:bg-museum-800/50 border border-transparent"}
                  `}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </nav>
  );
}