import { useState } from "react";
import { analyzeDocument } from "../services/gemini";
import { saveDocument } from "../services/firebase";

const MOCK_STATS = {
  museum: "Raja Dinkar Kelkar Museum, Pune",
  total: 47, processed: 31, pending: 16,
  scripts: [
    { name: "Modi Script", count: 23, color: "bg-gold-500" },
    { name: "Devanagari", count: 18, color: "bg-emerald-400" },
    { name: "Persian", count: 6,  color: "bg-blue-400" }
  ],
  avgConfidence: 71,
  recentDocs: [
    { name: "Land Grant — Nashik 1782",  script: "Modi",       status: "✅ Done" },
    { name: "Temple Register — 1840",    script: "Devanagari", status: "✅ Done" },
    { name: "Peshwa Order — 1796",       script: "Modi",       status: "⏳ Pending" },
    { name: "Persian Firman — 1650",     script: "Persian",    status: "✅ Done" },
    { name: "Village Record — 1901",     script: "Devanagari", status: "⏳ Pending" }
  ]
};

export default function MuseumView() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState([]);

  function handleFiles(e) {
    setFiles(Array.from(e.target.files));
  }

  async function handleBulkProcess() {
    setProcessing(true);
    const results = [];
    for (const file of files) {
      const b64 = await new Promise(res => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.readAsDataURL(file);
      });
      try {
        const gemini = await analyzeDocument(b64);
        await saveDocument(gemini, "museum");
        results.push({ name: file.name, script: gemini.script, status: "✅ Done" });
      } catch {
        results.push({ name: file.name, script: "—", status: "❌ Failed" });
      }
    }
    setDone(results);
    setProcessing(false);
  }

  const s = MOCK_STATS;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Role Banner */}
      <div className="bg-museum-800/60 rounded-xl border border-museum-700 p-5 mb-8 border-l-4 border-l-amber-500 shadow-md flex items-center">
        <strong className="text-amber-400 text-lg">🏛️ Museum Admin Mode</strong>
        <span className="text-slate-400 text-sm ml-4 border-l border-museum-700 pl-4">
          {s.museum}
        </span>
      </div>

      {/* Analytics Dashboard */}
      <div className="bg-museum-800/40 rounded-xl border border-museum-700 shadow-xl p-8 mb-12">
        <h3 className="text-2xl font-heading text-gold-500 mb-8 border-b border-museum-700 pb-4">
          📊 Collection Analytics
        </h3>
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Docs", value: s.total, color: "text-gold-500" },
            { label: "Digitized",  value: s.processed, color: "text-emerald-400" },
            { label: "Pending",    value: s.pending, color: "text-red-400" },
            { label: "Avg Confidence", value: s.avgConfidence + "%", color: "text-blue-400" }
          ].map((stat, i) => (
            <div key={i} className="bg-museum-900/60 rounded-xl p-6 text-center border border-museum-700/50 shadow-inner">
              <div className={`text-4xl font-bold font-heading mb-2 ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Script Breakdown */}
        <div className="mb-12">
          <strong className="text-slate-200 text-sm tracking-widest uppercase font-semibold block mb-6">Scripts in Collection</strong>
          <div className="space-y-5">
            {s.scripts.map(sc => (
              <div key={sc.name}>
                <div className="flex justify-between text-sm text-slate-400 mb-2 font-medium">
                  <span>{sc.name}</span>
                  <span>{sc.count} docs</span>
                </div>
                <div className="bg-museum-900/80 rounded-full h-2.5 overflow-hidden shadow-inner flex">
                  <div className={`${sc.color} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${(sc.count / s.total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Docs Table */}
        <div className="mt-8">
          <strong className="text-slate-200 text-sm tracking-widest uppercase font-semibold block mb-6">Recent Documents</strong>
          <div className="overflow-x-auto border border-museum-700 rounded-lg">
            <table className="min-w-full text-left bg-museum-900/30">
              <thead className="bg-museum-900/80 border-b border-museum-700">
                <tr>
                  {["Document", "Script", "Status"].map(h => (
                    <th key={h} className="px-6 py-4 text-xs tracking-widest text-slate-400 uppercase font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-museum-700/50 text-sm">
                {[...s.recentDocs, ...done].map((doc, i) => (
                  <tr key={i} className="hover:bg-museum-800/50 transition-colors">
                    <td className="px-6 py-4 text-slate-200 font-medium">{doc.name}</td>
                    <td className="px-6 py-4 text-slate-400">{doc.script}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        doc.status.includes("Done") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                        doc.status.includes("Fail") ? "bg-red-500/10 text-red-400 border-red-500/20" : 
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bulk Upload Pipeline */}
      <div className="border border-dashed border-amber-500/40 bg-museum-800/30 rounded-2xl p-12 text-center transition-colors hover:bg-museum-800/50 hover:border-amber-500/60 shadow-md">
        <h3 className="text-2xl font-heading text-amber-500 mb-2">📁 Bulk Upload Pipeline</h3>
        <p className="text-slate-400 font-light mb-8 max-w-md mx-auto">
          Select multiple document images to be processed automatically and uploaded to the database entirely sequentially.
        </p>
        
        <input id="bulk-upload" type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        <label htmlFor="bulk-upload" className="cursor-pointer bg-transparent border border-amber-500 text-amber-500 px-8 py-3 rounded hover:bg-amber-500 hover:text-museum-900 transition-colors font-semibold tracking-wide shadow-sm">
          Select Multiple Files
        </label>
        
        {files.length > 0 && (
          <div className="mt-10 animate-[fadeIn_0.4s_ease-out]">
            <p className="text-amber-400 font-semibold mb-6 tracking-wide">{files.length} file(s) ready to process format</p>
            <button onClick={handleBulkProcess} disabled={processing} className="bg-gradient-to-r from-amber-500 to-amber-700 text-museum-900 px-8 py-3 rounded font-bold tracking-wide hover:-translate-y-0.5 transition-transform shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:transform-none">
              {processing ? `⏳ Processing ${files.length} files...` : "⚙️ Process All Documents Now"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}