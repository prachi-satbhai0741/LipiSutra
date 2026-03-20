import { useState } from "react";
import { analyzeDocument } from "../services/gemini";
import { saveDocument } from "../services/firebase";
import { translateText } from "../services/translate";
import { speakText } from "../services/tts";
import MapSection from "./MapSection";

const langCodes = { hi: "hi-IN", gu: "gu-IN", te: "te-IN", en: "en-US" };

export default function PublicView() {
  const [image, setImage] = useState(null);
  const [base64, setBase64] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("hi");
  const [translation, setTranslation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("summary"); // "summary", "transcript", "translation", "origin"
  const [isTranslating, setIsTranslating] = useState(false);

  function handleFileDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => setBase64(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
    // Reset states for a new document
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
      await saveDocument(geminiResult, "public");
    } catch (err) { alert("Error analyzing document: " + err.message); }
    setLoading(false);
  }

  function handleSearch(e) {
    if (e.key === "Enter") {
      alert(`Search feature hooked to Firebase query for: ${searchQuery}`);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen outline-none">

      {/* LANDING PAGE (No Image, No Result) */}
      {!image && !result && (
        <div className="flex flex-col items-center animate-[fadeIn_0.6s_ease-out]">

          {/* Hero Section */}
          <div className="text-center mt-12 mb-20 max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-500 to-amber-600 mb-8 drop-shadow-md tracking-tight leading-tight">
              Decode the Past <br /><span className="text-slate-200">Preserve the Future.</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed">
              Upload ancient manuscripts, engraved decrees, or faded scrolls. Our AI neural engine instantly translates lost scripts and traces them back to their exact geographical origins.
            </p>

            {/* Search Bar placed functionally below Hero text */}
            <div className="relative group max-w-2xl mx-auto hidden sm:block">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gold-500 text-lg">🔍</span>
              <input
                className="w-full bg-museum-900/60 border border-museum-700 text-slate-200 rounded-full pl-14 pr-6 py-4 outline-none focus:border-gold-500/50 shadow-inner hover:bg-museum-900 transition-colors backdrop-blur-sm"
                placeholder="Search the global archives for eras, scripts, or regions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            className="w-full max-w-3xl border-2 border-dashed border-gold-500/40 bg-museum-800/20 backdrop-blur-sm rounded-3xl p-16 md:p-24 flex flex-col items-center justify-center transition-all hover:bg-museum-800/40 hover:border-gold-500/80 cursor-pointer shadow-xl group hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] relative overflow-hidden"
            onDragOver={e => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => document.getElementById("file-input").click()}
          >
            <div className="w-20 h-20 bg-museum-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-museum-700/50 group-hover:scale-110 transition-transform duration-500">
              <span className="text-4xl">📜</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-heading text-gold-500 mb-3 font-semibold tracking-wide">Upload Artifact Image</h2>
            <p className="text-slate-400 font-light text-center text-sm md:text-base">
              Drag and drop a high-resolution image of your historical document, or <span className="text-gold-400 underline decoration-gold-500/30 underline-offset-4">browse files</span>.
            </p>
            <input type="file" id="file-input" accept="image/*" onChange={handleFileDrop} className="hidden" />
          </div>

        </div>
      )}


      {/* ANALYSIS PIPELINE & RESULTS (Image Selected) */}
      {(image) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8 animate-[fadeIn_0.5s_ease-out]">

          {/* Left Column: Artifact Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full mb-6">
              <h3 className="text-sm font-semibold tracking-widest text-slate-500 uppercase border-b border-museum-800 pb-3">Original Artifact</h3>
            </div>

            <div className="bg-museum-800/40 p-4 rounded-2xl border border-museum-700/50 shadow-2xl w-full flex justify-center backdrop-blur-sm overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-museum-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
              <img src={image} alt="Historical Document" className="w-full h-auto rounded-xl object-contain max-h-[600px] shadow-lg relative z-0" />
            </div>

            {/* CTA Analysis Button */}
            {!loading && !result && (
              <button onClick={handleAnalyze} className="mt-8 w-full bg-gradient-to-r from-gold-600 to-amber-700 text-museum-900 px-8 py-4 rounded-xl font-black text-lg tracking-widest uppercase hover:-translate-y-1 transition-transform shadow-[0_10px_30px_rgba(212,175,55,0.2)]">
                ✨ Decode & Analyze Artifact
              </button>
            )}
            {loading && (
              <button disabled className="mt-8 w-full bg-museum-800 text-gold-500/50 px-8 py-4 rounded-xl font-bold text-lg tracking-widest uppercase border border-museum-700 cursor-wait">
                <span className="animate-pulse">⏳ Neural Engine Scanning...</span>
              </button>
            )}

            <button onClick={() => { setResult(null); setImage(null); setBase64(null) }} className="mt-6 text-slate-500 hover:text-gold-400 transition-colors uppercase tracking-widest text-xs font-semibold underline underline-offset-8 decoration-museum-700 hover:decoration-gold-500/50">
              Upload a different document
            </button>
          </div>


          {/* Right Column: Loading Skeleton or Tabbed Results */}
          <div className="lg:col-span-7">

            {/* SKELETON LOADER */}
            {loading && (
              <div className="w-full h-full animate-[fadeIn_0.5s_ease-out]">
                <div className="w-full mb-6 flex gap-4 border-b border-museum-800 pb-3">
                  <div className="h-4 bg-museum-800/50 w-24 rounded animate-pulse"></div>
                  <div className="h-4 bg-museum-800/50 w-24 rounded animate-pulse"></div>
                  <div className="h-4 bg-museum-800/50 w-24 rounded animate-pulse"></div>
                </div>
                <div className="bg-museum-800/30 p-8 rounded-2xl border border-museum-700/50 shadow-xl w-full h-[550px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-museum-700/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                  <div className="grid grid-cols-2 gap-8 mb-12">
                    <div>
                      <div className="h-3 bg-museum-800 w-20 rounded mb-4"></div>
                      <div className="h-10 bg-museum-700/50 w-48 rounded"></div>
                    </div>
                    <div>
                      <div className="h-3 bg-museum-800 w-20 rounded mb-4"></div>
                      <div className="h-10 bg-museum-700/50 w-32 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 bg-museum-700/50 w-full rounded"></div>
                    <div className="h-4 bg-museum-700/50 w-[90%] rounded"></div>
                    <div className="h-4 bg-museum-700/50 w-[95%] rounded"></div>
                    <div className="h-4 bg-museum-700/50 w-[80%] rounded"></div>
                    <div className="h-4 bg-museum-700/50 w-[85%] rounded"></div>
                  </div>
                </div>
              </div>
            )}
            {/* ACTUAL RESULTS (TABBED UI) */}
            {result && !loading && (
              <div className="w-full flex flex-col gap-12 animate-[fadeIn_0.5s_ease-out]">

                {/* Top Row: Artifact vs Analysis (Split Layout) */}
                <div className="grid grid-cols-1 gap-10 items-start">

                  {/* Analysis Tabs - Full Width */}
                  <div className="w-full flex flex-col h-full">
                    {/* Tabs */}
                    <div className="flex border-b border-white/10 mb-6 overflow-x-auto no-scrollbar gap-8 pb-1">
                      {[
                        { id: 'summary', label: 'Summary' },
                        { id: 'translation', label: 'Linguistic Analysis' },
                        { id: 'origin', label: 'Geographic Provenience' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`pb-3 shrink-0 text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-300 border-b-2 relative top-[2px] ${activeTab === tab.id ? 'text-gold-400 border-gold-400' : 'text-slate-500 border-transparent hover:text-slate-200'}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Panes */}
                    <div className="bg-museum-900/60 backdrop-blur-xl p-8 md:p-12 rounded-2xl border border-white/5 shadow-2xl flex-1 min-h-[450px]">
                      {activeTab === 'summary' && (
                        <div className="animate-[fadeIn_0.4s_ease-out]">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12 pb-8 border-b border-white/5">
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Palaeographic Script</div>
                              <div className="text-3xl font-heading font-black text-[#C9A84C] drop-shadow-lg">{result.script || result.inferredScript}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Chronological Era</div>
                              <div className="text-3xl font-heading font-black text-[#C9A84C]">{result.era || "Unknown"}</div>
                            </div>
                          </div>
                          <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-6">Scientific Abstract</h4>
                          <p className="text-xl font-light text-slate-200 leading-relaxed italic border-l-2 border-gold-500/30 pl-8 py-2">
                            "{result.summary || "No summary available."}"
                          </p>
                        </div>
                      )}

                      {activeTab === 'translation' && (
                        <div className="animate-[fadeIn_0.4s_ease-out]">
                          <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-8">Decryption & Translation Layer</h4>
                          <div className="flex flex-col sm:flex-row gap-4 mb-10 bg-black/20 p-6 rounded-xl border border-white/5">
                            <select value={lang} onChange={e => setLang(e.target.value)} className="flex-1 bg-museum-900 border border-white/10 text-gold-400 px-6 py-4 rounded-xl focus:outline-none focus:border-gold-400 font-bold text-xs tracking-widest uppercase">
                              <option value="en">English (Universal)</option>
                              <option value="hi">हिन्दी (Hindi)</option>
                              <option value="gu">ગુજરાતી (Gujarati)</option>
                              <option value="te">తెలుగు (Telugu)</option>
                            </select>
                            <button
                              onClick={async () => {
                                setIsTranslating(true);
                                const t = await translateText(result.modernMarathi || result.transcript, lang);
                                setTranslation(t);
                                setIsTranslating(false);
                              }}
                              disabled={isTranslating}
                              className="bg-gold-600/10 border border-gold-600/30 text-gold-500 hover:bg-gold-500 hover:text-museum-900 px-10 py-4 rounded-xl transition-all font-black text-[10px] tracking-[0.2em] uppercase disabled:opacity-50"
                            >
                              {isTranslating ? "Processing..." : "Decrypt Metadata"}
                            </button>
                          </div>

                          {translation && (
                            <div className="bg-black/20 p-8 rounded-xl border-t-2 border-gold-500/50 shadow-inner">
                              <p className="text-slate-200 text-lg leading-relaxed mb-10 font-light">{translation}</p>
                              <button onClick={() => speakText(translation, langCodes[lang])} className="bg-[#C9A84C] text-museum-900 hover:bg-gold-400 px-10 py-4 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase transition-all hover:-translate-y-1 shadow-2xl flex items-center justify-center gap-3 w-full sm:w-auto">
                                🔊 Execute Audio Reproduction
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'origin' && (
                        <div className="w-full h-full flex flex-col">
                          <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-6">Geographical Provenience</h4>
                          <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 shadow-inner relative z-0">
                            <MapSection documentLocation={result?.locations ? result.locations[0] : null} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full Width Transcript Section (Fixes left gap & width) */}
                <div className="w-full mt-4 animate-[fadeIn_0.6s_ease-out]">
                  <h3 className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase mb-6 pl-1 text-center lg:text-left">Original Paleographic Transcript</h3>
                  <div className="bg-museum-900/60 backdrop-blur-2xl p-10 md:p-16 rounded-3xl border border-white/5 shadow-2xl">
                    <div className="text-base md:text-lg text-slate-200 font-heading leading-[1.8] tracking-loose text-center lg:text-left drop-shadow-sm">
                      {result.transcript || "No transcript could be extracted."}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
