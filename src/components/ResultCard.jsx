export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <h3 className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-4 text-center lg:text-left">Analysis Results</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-museum-800/50 p-6 md:p-8 rounded-xl border border-museum-700 shadow-md hover:border-gold-500/30 hover:shadow-gold-500/10 transition-all duration-300">
        <div className="text-center lg:text-left">
          <div className="text-xs tracking-widest text-slate-500 uppercase mb-2">Detected Script</div>
          <div className="text-2xl font-heading text-gold-500">{result.script || result.inferredScript}</div>
        </div>
        <div className="text-center lg:text-left">
          <div className="text-xs tracking-widest text-slate-500 uppercase mb-2">Historical Era</div>
          <div className="text-2xl md:text-3xl font-heading text-gold-500">{result.era || "Unknown"}</div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-semibold tracking-widest text-slate-500 uppercase mb-3">Summary Overview</h3>
        <p className="text-slate-300 leading-relaxed font-light text-lg border-l-[3px] border-gold-500 pl-5 bg-gradient-to-r from-museum-800/80 to-transparent py-4 text-left shadow-sm">
          {result.summary || "No summary available."}
        </p>
      </div>
    </div>
  );
}