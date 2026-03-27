import { useState, useEffect } from "react";
import { analyzeDocument } from "../services/gemini";
import { saveDocument, checkExistingHash, db } from "../services/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

async function generateHash(message) {
  console.log('>>> [HASH] generateHash Initiated');
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  console.log('>>> [HASH] Generated Strict Hash String:', hashHex);
  return hashHex;
}

export default function UploadSection({ image, setImage, base64, setBase64, loading, setLoading, onResult, theme }) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Scanning document...",
    "Detecting script...",
    "Transcribing text...",
    "Analyzing historical context...",
    "Generating summary..."
  ];

  useEffect(() => {
    let interval;
    let messageInterval;
    if (loading) {
      const startTime = Date.now();
      const duration = 8000; // 8 seconds
      interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 90, 90);
        setProgress(newProgress);
        if (elapsed >= duration) {
          clearInterval(interval);
        }
      }, 100);

      messageInterval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % messages.length);
      }, 1500);
    }

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, [loading, messages.length]);

  function handleFileDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = () => setBase64(reader.result.split(",")[1]);
    reader.readAsDataURL(file);
    // Reset states for a new document
    onResult(null);
  }

  async function handleAnalyze() {
    if (!base64) return;
    
    setLoading(true);
    setProgress(0);
    setMessageIndex(0);

    console.log(">>> [PIPELINE] Starting Analysis...");
    const hash = await generateHash(base64);
    const cachedData = await checkExistingHash(hash);
    
    if (cachedData) {
      console.log('>>> [PIPELINE] Intercepted! Bypassing Gemini and rendering cache immediately.');
      onResult(cachedData);
      setProgress(100);
      setLoading(false);
      // Increment search popularity counter
      updateDoc(doc(db, "documents", hash), { searchCount: increment(1) }).catch(e => console.warn("searchCount increment failed", e));
      return;
    }

    console.log(">>> [PIPELINE] No Cache Found. Calling Gemini API.");
    try {
      const geminiResult = await analyzeDocument(base64);
      onResult(geminiResult);
      setProgress(100);
      setLoading(false);
      saveDocument(geminiResult, "public", hash).catch(e => console.warn("Firebase intercept failed", e));
    } catch (err) {
      alert("Error analyzing document: " + err.message);
      setProgress(100);
      setLoading(false);
    }
  }

  return (
    <div className="lg:col-span-5 flex flex-col items-center">
      <div className="w-full mb-6">
        <h3 className="text-sm font-semibold tracking-widest uppercase border-b pb-3" style={{ color: theme.subtext, borderColor: theme.border }}>Original Artifact</h3>
      </div>

      {!image ? (
        <div
          className="w-full max-w-3xl border-dashed backdrop-blur-sm rounded-3xl p-16 md:p-24 flex flex-col items-center justify-center transition-all cursor-pointer group relative overflow-hidden"
          style={{ backgroundColor: theme.headerBg, borderColor: theme.accent, borderWidth: '2px', boxShadow: theme.cardShadow }}
          onDragOver={e => e.preventDefault()}
          onDrop={handleFileDrop}
          onClick={() => document.getElementById("file-input").click()}
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner transition-transform duration-500 group-hover:scale-110" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
            <span className="text-4xl">📜</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-heading mb-3 font-semibold tracking-wide" style={{ color: theme.accent }}>Upload Artifact Image</h2>
          <p className="font-light text-center text-sm md:text-base" style={{ color: theme.subtext }}>
            Drag and drop a high-resolution image of your historical document, or <span className="underline underline-offset-4" style={{ color: theme.accent, textDecorationColor: theme.accent }}>browse files</span>.
          </p>
          <input type="file" id="file-input" accept="image/*" onChange={handleFileDrop} className="hidden" />
        </div>
      ) : (
        <div className="bg-museum-800/40 p-4 rounded-2xl border border-museum-700/50 shadow-2xl w-full flex justify-center backdrop-blur-sm overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-t from-museum-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
          <img src={image} alt="Historical Document" className="w-full h-auto rounded-xl object-contain max-h-[600px] shadow-lg relative z-0" />
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
                backgroundColor: `${theme.bg}D9`,
                backdropFilter: 'blur(4px)',
                borderRadius: '0.75rem' // tailwind rounded-xl is 0.75rem
              }}
            >
              <style>
                {`
                  @keyframes pulse-spin {
                    0% { transform: rotate(0deg) scale(0.9); box-shadow: 0 0 0 0 ${theme.accent}66; }
                    50% { transform: rotate(180deg) scale(1.1); box-shadow: 0 0 0 20px ${theme.accent}00; }
                    100% { transform: rotate(360deg) scale(0.9); box-shadow: 0 0 0 0 ${theme.accent}00; }
                  }
                `}
              </style>
              
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  border: `4px solid ${theme.accent}33`,
                  borderTopColor: theme.accent,
                  borderRadius: '50%',
                  marginBottom: '2rem',
                  animation: 'pulse-spin 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite'
                }}
              ></div>

              <div 
                style={{ 
                  color: theme.accent, 
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1.5rem',
                  letterSpacing: '0.05em',
                  textShadow: `0 2px 10px ${theme.accent}66`,
                  textAlign: 'center'
                }}
              >
                {messages[messageIndex]}
              </div>
              
              <div 
                style={{
                  width: '75%',
                  maxWidth: '320px',
                  backgroundColor: theme.surface,
                  borderRadius: '9999px',
                  height: '8px',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)'
                }}
              >
                <div
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${progress}%`, 
                    backgroundColor: theme.accent,
                    height: '100%',
                    transition: 'width 0.3s ease-out',
                    boxShadow: `0 0 10px ${theme.accent}99`,
                    borderRadius: '9999px'
                  }}
                ></div>
              </div>
              <div style={{ color: `${theme.accent}CC`, fontSize: '0.875rem', marginTop: '0.75rem', fontWeight: '500' }}>
                {Math.round(progress)}%
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA Analysis Button */}
      {image && !loading && (
        <button onClick={handleAnalyze} className="mt-8 w-full px-8 py-4 rounded-xl font-black text-lg tracking-widest uppercase hover:-translate-y-1 transition-transform" style={{ backgroundColor: theme.accentGlow, color: theme.buttonText, boxShadow: theme.cardShadow }}>
          ✨ Decode & Analyze Artifact
        </button>
      )}

      <button onClick={() => { onResult(null); setImage(null); setBase64(null); setLoading(false); }} className="mt-6 transition-colors uppercase tracking-widest text-xs font-semibold underline underline-offset-8" style={{ color: theme.subtext, textDecorationColor: theme.border }}>
        Upload a different document
      </button>
    </div>
  );
}