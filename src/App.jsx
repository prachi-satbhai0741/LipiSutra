import { useState } from "react";
import Navbar from "./components/Navbar";
import PublicView from "./components/PublicView";
import HistorianView from "./components/HistorianView";
import MuseumView from "./components/MuseumView";
import ArchivesView from "./components/ArchivesView";

export default function App() {
  const [view, setView] = useState("public"); // "public", "historian", "museum"
  const [page, setPage] = useState("home"); // "home", "archives"

  return (
    <div className="min-h-screen relative flex flex-col font-sans">
      <Navbar currentView={view} onViewChange={setView} currentPage={page} onPageChange={setPage} />
      <main className="flex-1 overflow-x-hidden relative z-10 w-full animate-[fadeIn_0.5s_ease-out]">
         {page === "archives" ? (
            <ArchivesView />
         ) : (
            <>
               {view === "public" && <PublicView />}
               {view === "historian" && <HistorianView />}
               {view === "museum" && <MuseumView />}
            </>
         )}
      </main>
    </div>
  );
}