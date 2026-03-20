import { useState } from "react";
import { analyzeDocument } from "../services/gemini";
import { getConfidenceScores } from "../services/vision";
import { translateText } from "../services/translate";
import { speakText } from "../services/tts";
import { saveDocument } from "../services/firebase";
import ResultCard from "./ResultCard";
import MapSection from "./MapSection";

export default function PublicView() {
  const [image, setImage] = useState(null);
  const [base64, setBase64] = useState(null);
  const [result, setResult] = useState(null);
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => setBase64(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
  }

  async function handleAnalyze() {
    if (!base64) return;
    setLoading(true);
    try {
      const [gemini] = await Promise.all([
        analyzeDocument(base64),
        getConfidenceScores(base64)
      ]);
      setResult(gemini);
      await saveDocument(gemini, "public");
    } catch (err) { alert("Error: " + err.message); }
    setLoading(false);
  }

  const langCodes = { en: "en-US", hi: "hi-IN", gu: "gu-IN", te: "te-IN" };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Search & Intro */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-5">
        <h1 className="text-4xl md:text-5xl font-heading text-gold-500 font-semibold tracking-wide">
          Historical Document AI
        </h1>
        <p className="text-slate-400 text-lg font-light leading-relaxed">
          Upload ancient scripts, scrolls, or decrees. Our AI will decode, transcribe, and trace their origins.
        </p>
        <div className="pt-6">
          <input 
            type="text" 
            placeholder="Search the archives..." 
            className="w-full bg-museum-800 border-b border-museum-700 text-slate-200 px-6 py-4 rounded focus:outline-none focus:border-gold-500 transition-colors shadow-inner"
          />
        </div>
      </div>

      {!result ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-museum-700 bg-museum-800/40 rounded-2xl p-16 md:p-24 transition-all hover:bg-museum-800/60 hover:border-gold-500/50 group">
          <div className="w-16 h-16 rounded-full bg-gold-900/40 flex items-center justify-center mb-6 text-gold-500 group-hover:scale-110 transition-transform shadow-lg">
            <span className="text-2xl">📜</span>
          </div>
          <h2 className="text-2xl font-heading text-slate-200 mb-2">Upload Artifact</h2>
          <p className="text-slate-400 font-light text-center mb-8 max-w-md">
            Drag and drop a high-resolution image of your historical document.
          </p>
          <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFile} />
          <label htmlFor="file-upload" className="cursor-pointer bg-transparent border border-gold-500 text-gold-500 px-8 py-3 rounded hover:bg-gold-500 hover:text-museum-900 transition-colors font-semibold tracking-wide shadow-md">
            Select File
          </label>
          
          {image && (
            <div className="mt-12 animate-[fadeIn_0.4s_ease-out]">
              <img src={image} alt="doc" className="max-h-[300px] object-contain rounded-lg border border-museum-700 shadow-2xl" />
              <div className="mt-8 flex justify-center">
                 <button onClick={handleAnalyze} disabled={loading} className="bg-gradient-to-r from-gold-500 to-gold-600 text-museum-900 px-8 py-3 rounded font-bold tracking-wide hover:-translate-y-0.5 transition-transform shadow-lg shadow-gold-500/20 disabled:opacity-50 disabled:transform-none">
                    {loading ? "⏳ Decoding Script..." : "✨ Decode Artifact"}
                 </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8 animate-[fadeIn_0.5s_ease-out]">
          
          {/* Left: Original Artifact */}
          <div className="lg:col-span-5 lg:col-start-1 flex flex-col items-center">
             <div className="w-full text-left mb-4">
               <h3 className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Original Artifact</h3>
             </div>
             <div className="bg-museum-800 p-4 rounded-xl border border-museum-700 shadow-2xl w-full flex justify-center">
               <img src={image} alt="Historical Document" className="w-full h-auto rounded-lg object-contain max-h-[700px]" />
             </div>
             
             <button onClick={() => {setResult(null); setImage(null); setBase64(null)}} className="mt-8 border border-museum-700 text-slate-400 px-6 py-3 rounded hover:bg-museum-800 hover:text-white transition-colors uppercase tracking-widest text-xs font-semibold">
               Assess Another Artifact
             </button>
          </div>
          
          {/* Right: AI Analysis Data */}
          <div className="lg:col-span-7 space-y-10">
             <ResultCard result={result} />
             
             {/* Accessibility Panel inside right column */}
             <div className="bg-museum-800/40 rounded-xl border-l-[3px] border-gold-500 p-8 shadow-md">
               <h3 className="text-xl font-heading text-gold-500 mb-2">🔊 Listen in Your Language</h3>
               <p className="text-slate-400 text-sm mb-6">Read the native translation and hear the document aloud.</p>
               
               <div className="flex flex-wrap gap-4 items-center">
                 <select value={lang} onChange={e => setLang(e.target.value)} className="bg-museum-900 border border-museum-700 text-slate-200 px-4 py-2.5 rounded focus:outline-none focus:border-gold-500 shadow-inner">
                   <option value="en">English (Translation)</option>
                   <option value="hi">हिन्दी (Hindi)</option>
                   <option value="gu">ગુજરાતી (Gujarati)</option>
                   <option value="te">తెలుగు (Telugu)</option>
                 </select>
                 <button onClick={async () => {
                   const t = await translateText(result.modernMarathi || result.transcript, lang);
                   setTranslation(t);
                 }} className="border border-gold-600 text-gold-500 hover:bg-gold-500 hover:text-museum-900 px-8 py-2.5 rounded transition-colors text-sm font-semibold tracking-wide">
                   🌍 Translate
                 </button>
               </div>
               
               {translation && (
                 <div className="mt-8 bg-museum-900/60 p-6 rounded-lg border border-museum-700/50">
                   <p className="text-slate-200 text-lg leading-relaxed mb-6 font-light">{translation}</p>
                   <button onClick={() => speakText(translation, langCodes[lang])} className="bg-gold-500/10 text-gold-500 hover:bg-gold-500 hover:text-museum-900 border border-gold-500/30 px-6 py-2.5 rounded text-sm font-medium transition-colors flex items-center gap-2">
                     <span className="text-lg">▶</span>
                     Read Aloud
                   </button>
                 </div>
               )}
             </div>
             
             {/* Map Integration */}
             <div className="mt-12 border-t border-museum-800 pt-10">
               <h3 className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-4">Geographical Origin</h3>
               <MapSection documentLocation={result?.locations ? result.locations[0] : null} />
             </div>
          </div>
        </div>
      )}

      {/* Global Map if no result */}
      {!result && (
        <div className="mt-32 border-t border-museum-800 pt-16">
          <h3 className="text-center font-heading text-3xl text-gold-500 mb-4">Atlas of Origins</h3>
          <p className="text-center text-slate-500 mb-10 font-light max-w-lg mx-auto">
            Discover the origins of our digitized archives on the global map.
          </p>
          <MapSection />
        </div>
      )}
    </div>
  );
}