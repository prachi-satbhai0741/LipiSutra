import { useState, useEffect } from "react";
import { getRecentDocuments } from "../services/firebase";

export default function ArchivesView() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getRecentDocuments(12);
      setDocs(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 animate-[fadeIn_0.6s_ease-out]">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-600 mb-6 tracking-tight">
          Global Archives
        </h2>
        <p className="text-slate-400 text-lg font-light max-w-2xl mx-auto leading-relaxed">
          A living repository of human history, digitized and deciphered through neural analysis. Explore the scripts and eras recovered by our global community.
        </p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-museum-800/20 border border-museum-700/50 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {docs.length === 0 ? (
             <div className="col-span-full py-20 text-center border border-dashed border-museum-700 rounded-3xl bg-museum-900/40">
                <span className="text-4xl mb-4 block">🏺</span>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No documents found in the vault</p>
             </div>
          ) : (
            docs.map(doc => (
              <div key={doc.id} className="group bg-museum-800/30 backdrop-blur-sm border border-museum-700/50 rounded-2xl p-8 hover:bg-museum-800/50 hover:border-gold-500/30 transition-all duration-500 shadow-xl hover:-translate-y-2 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black tracking-widest text-gold-500 uppercase border border-gold-500/20 px-3 py-1 rounded-full bg-gold-500/5">
                      {doc.script || "Ancient Script"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      {doc.timestamp?.toDate().toLocaleDateString() || "Recently Added"}
                    </span>
                  </div>
                  
                  <h3 className="text-2xl font-heading text-slate-200 mb-4 group-hover:text-gold-400 transition-colors">
                    {doc.era || "Unknown Era"} Artifact
                  </h3>
                  
                  <p className="text-slate-400 text-sm font-light leading-relaxed line-clamp-3 mb-6">
                    {doc.summary || "This artifact holds secrets of a forgotten era, pending further linguistic classification."}
                  </p>
                </div>

                <div className="pt-6 border-t border-museum-700/30 flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
                  <span className="text-slate-500 italic">Saved by {doc.savedByRole || "Public"}</span>
                  <button className="text-gold-500 hover:text-white transition-colors flex items-center gap-2">
                    View Record <span className="text-lg">→</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
