import { useState } from "react";
import { analyzeDocument } from "../services/gemini";
import { getConfidenceScores } from "../services/vision";
import { saveDocument, saveCorrection } from "../services/firebase";
import ResultCard from "./ResultCard";

export default function HistorianView() {
  const [image, setImage] = useState(null);
  const [base64, setBase64] = useState(null);
  const [result, setResult] = useState(null);
  const [words, setWords] = useState([]);
  const [corrections, setCorrections] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

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
    setSaved(false);
    try {
      const [gemini, visionWords] = await Promise.all([
        analyzeDocument(base64),
        getConfidenceScores(base64)
      ]);
      setResult(gemini);
      setWords(visionWords);
      await saveDocument(gemini, "historian");
    } catch (err) { alert("Error: " + err.message); }
    setLoading(false);
  }

  async function handleSaveCorrections() {
    await saveCorrection({ corrections, script: result?.script, era: result?.era });
    setSaved(true);
  }

  function Heatmap() {
    if (!words.length) return null;
    return (
      <div className="leading-loose text-lg mt-6">
        <div className="flex flex-wrap gap-x-1.5 gap-y-2">
          {words.map((w, i) => {
            const c = w.confidence;
            let theme = "bg-museum-900/50 text-slate-200 border-transparent";
            
            if (c <= 0.85 && c > 0.6) {
              theme = "bg-amber-500/10 text-amber-400 border-amber-500/30";
            } else if (c <= 0.6) {
              theme = "bg-red-500/10 text-red-400 border-red-500/40 border-dashed cursor-pointer hover:bg-red-500/20";
            }

            return (
              <span key={i} title={`${Math.round(c * 100)}% confidence`}
                className={`px-2 py-0.5 rounded border font-heading transition-colors ${theme}`}>
                {w.word}
              </span>
            );
          })}
        </div>
        
        <div className="mt-8 flex gap-6 text-sm text-slate-400 font-medium">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/40"></span> 
            Uncertain (60–85%)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-red-500/20 border border-dashed border-red-500/50"></span> 
            AI Predicted (&lt;60%)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Role Banner */}
      <div className="bg-museum-800/60 rounded-xl border border-museum-700 p-5 mb-8 border-l-4 border-l-emerald-500 shadow-md flex items-center">
        <strong className="text-emerald-400 text-lg">🏛️ Historian Mode</strong>
        <span className="text-slate-400 text-sm ml-4 border-l border-museum-700 pl-4">
          Expert review & RLHF correction loop — your edits continuously train the AI.
        </span>
      </div>

      {/* Upload Section */}
      <div className="flex flex-col items-center justify-center border border-dashed border-emerald-500/30 bg-museum-800/30 rounded-2xl p-12 md:p-16 mb-12 hover:bg-museum-800/50 hover:border-emerald-500/50 transition-all group">
        <h2 className="text-2xl font-heading text-emerald-400 mb-2">Upload Document for Expert Review</h2>
        <p className="text-slate-400 font-light text-center mb-8">
          Analyze document content alongside AI confidence metrics.
        </p>

        <input type="file" id="hist-file" accept="image/*" onChange={handleFile} className="hidden" />
        <label htmlFor="hist-file" className="cursor-pointer bg-transparent border border-emerald-500 text-emerald-400 px-8 py-3 rounded hover:bg-emerald-500 hover:text-museum-900 transition-colors font-semibold tracking-wide shadow-sm">
          Select File
        </label>

        {image && (
          <div className="mt-10 animate-[fadeIn_0.4s_ease-out] w-full flex flex-col items-center">
            <img src={image} alt="doc" className="max-h-[350px] object-contain rounded-lg border border-emerald-500/30 shadow-xl" />
            <div className="mt-8">
              <button onClick={handleAnalyze} disabled={loading} className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-3 rounded font-bold tracking-wide hover:-translate-y-0.5 transition-transform shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:transform-none">
                {loading ? "⏳ Analyzing & Scanning..." : "🔬 Analyze + Confidence Scan"}
              </button>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-12 animate-[fadeIn_0.5s_ease-out]">
          <ResultCard result={result} />

          {/* Heatmap Section */}
          <div className="bg-museum-800/40 rounded-xl border border-museum-700 shadow-lg p-8 border-t-[3px] border-t-emerald-600">
            <h3 className="text-2xl font-heading text-emerald-400 border-b border-museum-700 pb-4">
              🔍 Confidence Heatmap
            </h3>
            <Heatmap />
          </div>

          {/* Correction Loop Section */}
          {result.predictedWords?.length > 0 && (
            <div className="bg-red-900/10 rounded-xl border border-red-900/30 shadow-lg p-8 border-t-[3px] border-t-red-600">
              <h3 className="text-2xl font-heading text-red-400 mb-2">✏️ Correction Mode</h3>
              <p className="text-slate-400 font-light mb-8 text-sm">
                AI is highly uncertain about the following words. Provide correct transcriptions to update the training dataset.
              </p>
              
              <div className="space-y-6">
                {result.predictedWords.map((pw, i) => (
                  <div key={i} className="bg-museum-900/60 p-5 rounded-lg border border-museum-700 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-xs uppercase tracking-widest mb-1">Prediction</span>
                      <div className="flex items-center gap-3">
                        <strong className="text-red-400 text-xl font-heading tracking-wide">{pw.predicted}</strong>
                        <span className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/20">
                          {Math.round(pw.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2">
                      <input
                        className="w-full bg-museum-900 border border-red-900/50 text-slate-200 px-4 py-3 rounded focus:outline-none focus:border-red-500 transition-colors shadow-inner"
                        placeholder="Type correct word (leave blank if correct)"
                        value={corrections[pw.predicted] || ""}
                        onChange={e => setCorrections(prev => ({ ...prev, [pw.predicted]: e.target.value }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-red-900/30 flex justify-end">
                {saved ? (
                  <p className="text-emerald-400 font-semibold px-6 py-3 border border-emerald-500/30 bg-emerald-500/10 rounded">
                    ✅ Successfully saved to training database!
                  </p>
                ) : (
                  <button onClick={handleSaveCorrections} className="bg-gradient-to-r from-red-600 to-red-800 text-white px-8 py-3 rounded font-bold tracking-wide hover:-translate-y-0.5 transition-transform shadow-lg shadow-red-500/20">
                    Submit Corrections to Database
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}