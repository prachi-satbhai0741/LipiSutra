import { useState } from "react";
import { analyzeDocument } from "../services/gemini";
import { saveDocument } from "../services/firebase";
import { translateText } from "../services/translate";
import { speakText } from "../services/tts";
import MapSection from "./MapSection";

const langCodes = { en: "en-US", hi: "hi-IN", gu: "gu-IN", te: "te-IN" };

export default function HistorianView() {
  const [image, setImage] = useState(null);
  const [base64, setBase64] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("hi");
  const [translation, setTranslation] = useState("");
  const [activeTab, setActiveTab] = useState("summary");
  const [isTranslating, setIsTranslating] = useState(false);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => setBase64(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
    setResult(null);
    setTranslation("");
    setActiveTab("summary");
  }

  async function handleAnalyze() {
    if (!base64) return;
    setLoading(true);
    setResult(null);
    try {
      const geminiResult = await analyzeDocument(base64);
      setResult(geminiResult);
      await saveDocument(geminiResult, "historian");
    } catch (err) { alert("Analysis failed: " + err.message); }
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      
      {/* Hero Section for Historian */}
      {!image && !result && (
        <div className="flex flex-col items-center animate-[fadeIn_0.6s_ease-out] text-center mt-12">
          <h1 className="text-5xl md:text-6xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 mb-8 tracking-tight leading-tight">
            Expert Analysis Suite <br/><span className="text-slate-200 text-3xl font-light">Historical Cryptography.</span>
          </h1>
          <p className="text-slate-400 text-lg mb-12 max-w-2xl font-light leading-relaxed">
            Advanced toolset for historians and linguists to decipher, categorize, and archive ancient texts with high-precision neural models.
          </p>
          
          <div 
            onClick={() => document.getElementById("historian-upload").click()}
            className="w-full max-w-2xl border-2 border-dashed border-gold-500/30 bg-museum-900/40 backdrop-blur-xl rounded-3xl p-16 flex flex-col items-center justify-center hover:bg-museum-900/60 hover:border-gold-500 transition-all cursor-pointer shadow-2xl group"
          >
            <div className="w-20 h-20 bg-museum-950 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-white/5 shadow-inner">
              <span className="text-4xl">🔍</span>
            </div>
            <h2 className="text-2xl font-heading text-gold-500 mb-2">Ingest New Archive</h2>
            <p className="text-slate-500">Secure entry for professional documentation</p>
            <input type="file" id="historian-upload" className="hidden" accept="image/*" onChange={handleFile} />
          </div>
        </div>
      )}

      {/* Main Analysis Layout */}
      {(image) && (
        <div className="mt-8 animate-[fadeIn_0.5s_ease-out]">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Specimen */}
            <div className="lg:col-span-5">
               <div className="bg-museum-900/40 p-5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl sticky top-28">
                 <div className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase mb-4 pl-1">Scientific Specimen</div>
                 <img src={image} alt="doc" className="w-full h-auto rounded-xl object-contain max-h-[600px] shadow-inner mb-6 grayscale-[0.1] hover:grayscale-0 transition-all" />
                 
                 {!loading && !result && (
                   <button onClick={handleAnalyze} className="w-full bg-[#C9A84C] text-museum-950 py-4 rounded-xl font-black text-xs tracking-[0.2em] uppercase hover:bg-gold-400 transition-all shadow-xl active:scale-95">
                     Execute Advanced Scansion
                   </button>
                 )}
                 {loading && (
                   <div className="w-full bg-museum-950 text-gold-500/50 py-4 rounded-xl text-center border border-white/5 animate-pulse font-black text-xs tracking-[0.2em]">
                     EXTRACTING SEMANTICS...
                   </div>
                 )}
                 <button onClick={() => {setImage(null); setResult(null)}} className="w-full mt-4 text-slate-500 hover:text-gold-400 text-[10px] font-black tracking-widest uppercase transition-colors">
                   Discard Specimen
                 </button>
               </div>
            </div>

            {/* Right Column: Tabbed Analysis */}
            <div className="lg:col-span-7">
               {loading && (
                 <div className="animate-pulse space-y-8">
                    <div className="flex gap-8 border-b border-white/5 pb-4">
                      <div className="h-4 bg-museum-900 w-24 rounded"></div>
                      <div className="h-4 bg-museum-900 w-24 rounded"></div>
                      <div className="h-4 bg-museum-900 w-24 rounded"></div>
                    </div>
                    <div className="h-[500px] bg-museum-900/30 rounded-2xl border border-white/5"></div>
                 </div>
               )}

               {result && !loading && (
                 <div className="flex flex-col h-full">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10 mb-6 gap-8 pb-1 overflow-x-auto no-scrollbar">
                      {['summary', 'translation', 'origin'].map(tab => (
                        <button 
                          key={tab} 
                          onClick={() => setActiveTab(tab)}
                          className={`pb-3 text-[10px] font-black tracking-[0.2em] uppercase transition-all ${activeTab === tab ? 'text-gold-400 border-b-2 border-gold-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          {tab === 'translation' ? 'Linguistic' : tab}
                        </button>
                      ))}
                    </div>

                    {/* Tab Panes */}
                    <div className="bg-museum-900/60 backdrop-blur-xl p-8 md:p-12 rounded-2xl border border-white/5 shadow-2xl flex-1 min-h-[500px]">
                      {activeTab === 'summary' && (
                        <div className="animate-[fadeIn_0.3s]">
                          <div className="flex justify-between items-start mb-12 pb-8 border-b border-white/5">
                             <div className="space-y-1">
                               <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Scientific ID</div>
                               <div className="text-3xl font-heading text-[#C9A84C] font-black">{result.script}</div>
                             </div>
                             <div className="space-y-1 text-right">
                               <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Chronology</div>
                               <div className="text-3xl font-heading text-[#C9A84C] font-black">{result.era}</div>
                             </div>
                          </div>
                          <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-6">Analytical Abstract</h4>
                          <p className="text-2xl font-light text-slate-200 leading-relaxed italic border-l-2 border-gold-500/30 pl-8 py-2">
                            "{result.summary}"
                          </p>
                        </div>
                      )}

                      {activeTab === 'translation' && (
                        <div className="animate-[fadeIn_0.3s]">
                           <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-8">Modern Translation Layer</h4>
                           <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-black/20 p-6 rounded-xl border border-white/5">
                             <select value={lang} onChange={e => setLang(e.target.value)} className="bg-museum-950 border border-white/10 text-gold-400 px-6 py-4 rounded-xl focus:outline-none font-black text-xs tracking-widest uppercase">
                               <option value="en">English (Master)</option>
                               <option value="hi">Hindi (हिन्दी)</option>
                               <option value="gu">Gujarati (ગુજરાતી)</option>
                               <option value="te">Telugu (తెలుగు)</option>
                             </select>
                             <button 
                               onClick={async () => {
                                 setIsTranslating(true);
                                 const t = await translateText(result.transcript, lang);
                                 setTranslation(t);
                                 setIsTranslating(false);
                               }}
                               className="bg-gold-600/10 border border-gold-600/30 text-gold-500 px-8 py-4 rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-gold-600 hover:text-museum-900 transition-all flex-1"
                             >
                               {isTranslating ? "DECRYPTING..." : "Proceed to Translation"}
                             </button>
                           </div>
                           {translation && (
                             <div className="bg-black/20 p-8 rounded-xl border-t-2 border-gold-500 shadow-inner">
                               <p className="text-slate-200 text-xl leading-relaxed mb-10 font-light">{translation}</p>
                               <button onClick={() => speakText(translation, langCodes[lang])} className="bg-[#C9A84C] text-museum-950 px-10 py-4 rounded-xl font-black tracking-widest uppercase text-[10px] shadow-lg hover:bg-gold-400 transition-all active:translate-y-1">
                                 🔊 Dispatch Audio Signal
                               </button>
                             </div>
                           )}
                        </div>
                      )}

                      {activeTab === 'origin' && (
                        <div className="h-full flex flex-col animate-[fadeIn_0.3s]">
                          <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-6">Provenance Mapping</h4>
                          <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 shadow-inner relative z-0 min-h-[350px]">
                            <MapSection documentLocation={result?.locations ? result.locations[0] : null} />
                          </div>
                        </div>
                      )}
                    </div>
                 </div>
               )}
            </div>
          </div>

          {/* Full Width Transcript Section (Fixes left gap & width) */}
          {result && !loading && (
            <div className="w-full mt-10 animate-[fadeIn_0.6s_ease-out]">
               <h3 className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase mb-6 pl-1 text-center lg:text-left">Full Specimen Transcript</h3>
               <div className="bg-museum-900/60 backdrop-blur-3xl p-10 md:p-20 rounded-[2.5rem] border border-white/5 shadow-2xll">
                  <div className="text-2xl md:text-5xl text-slate-200 font-heading leading-[1.6] tracking-tight text-center lg:text-left">
                    {result.transcript || "No transcript could be extracted."}
                  </div>
               </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}