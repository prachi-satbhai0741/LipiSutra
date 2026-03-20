import logo from "../assets/lslogo.png";

export default function Navbar({ currentView, onViewChange, currentPage, onPageChange }) {
  const roles = [
    { id: "public", label: "Public / Student" },
    { id: "historian", label: "Historian" },
    { id: "museum", label: "Museum Admin" }
  ];

  return (
    <nav className="sticky top-0 z-50 bg-museum-900/60 backdrop-blur-lg border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-center py-3 gap-4">

          {/* Logo & Main Nav container */}
          <div className="flex items-center gap-12">
            <div className="flex items-center cursor-pointer group" onClick={() => onPageChange("home")}>
              <div className="relative">
                <img
                  src={logo}
                  alt="LipiSutra"
                  className="h-40 w-auto object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
                  style={{ mixBlendMode: 'screen' }}
                />
              </div>
            </div>

            {/* Page Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 border-l border-museum-700 pl-8">
              <button
                onClick={() => onPageChange("home")}
                className={`text-sm font-semibold tracking-widest uppercase transition-colors hover:text-gold-400 ${currentPage === 'home' ? 'text-gold-400 border-b-2 border-gold-500 py-1' : 'text-slate-400'}`}
              >
                AI Scanner
              </button>
              <button
                onClick={() => onPageChange("archives")}
                className={`text-sm font-semibold tracking-widest uppercase transition-colors hover:text-gold-400 ${currentPage === 'archives' ? 'text-gold-400 border-b-2 border-gold-500 py-1' : 'text-slate-400'}`}
              >
                Global Archives
              </button>
            </div>
          </div>

          <div className="flex items-center bg-museum-900 rounded-full border border-museum-700/50 p-1 shadow-inner">
            <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold px-4 hidden md:block">Role</span>
            <div className="flex">
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => onViewChange(r.id)}
                  className={`px-5 py-2 text-xs font-semibold tracking-wide rounded-full transition-all duration-300 ${currentView === r.id
                    ? "bg-transparent border border-gold-500 text-gold-400 shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                    : "text-slate-500 hover:text-slate-300"
                    }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}