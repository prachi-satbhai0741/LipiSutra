import { useState, useEffect } from "react";
import { db } from "../services/firebase";
import { collection, query, onSnapshot, doc, writeBatch, serverTimestamp, orderBy } from "firebase/firestore";
import MapSection from "./MapSection";

export default function HistorianView() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const [editValues, setEditValues] = useState({});
  const [changedFields, setChangedFields] = useState({});
  const [activeTab, setActiveTab] = useState("Summary");
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "documents"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pending = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.editedOnce !== true) {
          pending.push({ id: docSnap.id, ...data });
        }
      });
      // Sort by accuracy ascending (lowest first) for review priority
      pending.sort((a, b) => {
        const accA = parseAccuracy(a);
        const accB = parseAccuracy(b);
        return accA - accB;
      });
      setDocuments(pending);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedDoc) return;
    const unsub = onSnapshot(doc(db, "documents", selectedDoc.id), (docSnap) => {
      if (docSnap.exists() && docSnap.data().editedOnce === true) {
        setSelectedDoc(prev => prev ? { ...prev, isLocked: true } : null);
      }
    });
    return () => unsub();
  }, [selectedDoc?.id]);

  const handleOpenDoc = (docItem) => {
    if (docItem.editedOnce === true) return;
    setSelectedDoc(docItem);
    // Strip XML tags from transcript for clean editing
    const cleanTranscript = (docItem.transcript || "").replace(/<[^>]*>/g, "");
    setEditValues({
      script: docItem.script || "",
      era: docItem.era || "",
      confidenceScore: parseAccuracy(docItem),
      summary: docItem.summary || "",
      transcript: cleanTranscript,
      modernMarathi: docItem.modernMarathi || "",
      locations: docItem.locations || [],
    });
    setChangedFields({});
    setActiveTab("Summary");
  };

  const handleFieldChange = (field, value) => {
    if (selectedDoc?.isLocked) return;
    setEditValues(prev => ({ ...prev, [field]: value }));
    const originalValue = selectedDoc[field];
    const isChanged = JSON.stringify(originalValue) !== JSON.stringify(value);

    setChangedFields(prev => {
      const next = { ...prev };
      if (isChanged) {
        next[field] = value;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const handleLocationChange = (index, val) => {
    if (selectedDoc?.isLocked) return;
    const newLocs = [...(editValues.locations || [])];
    newLocs[index] = val;
    handleFieldChange("locations", newLocs);
  };

  const addLocation = () => {
    if (selectedDoc?.isLocked) return;
    handleFieldChange("locations", [...(editValues.locations || []), ""]);
  };

  const removeLocation = (index) => {
    if (selectedDoc?.isLocked) return;
    const newLocs = editValues.locations.filter((_, i) => i !== index);
    handleFieldChange("locations", newLocs);
  };

  const handleSubmit = async () => {
    if (!selectedDoc || selectedDoc.isLocked) return;
    const ObjectKeys = Object.keys(changedFields);
    if (ObjectKeys.length === 0) return;

    try {
      const batch = writeBatch(db);
      const docRef = doc(db, "documents", selectedDoc.id);

      // Build the diff-tagged transcript
      const originalClean = (selectedDoc.transcript || "").replace(/<[^>]*>/g, "");
      const editedText = editValues.transcript || "";
      const diffTranscript = buildDiffTranscript(originalClean, editedText);

      batch.update(docRef, {
        historianEdits: changedFields,
        highlightedFields: ObjectKeys,
        transcript: diffTranscript,
        editedOnce: true,
        status: "verified",
        reviewedAt: serverTimestamp()
      });

      await batch.commit();

      setToastMsg("Document Verified Successfully");
      setSelectedDoc(null);
      setChangedFields({});
      setEditValues({});
      setTimeout(() => setToastMsg(null), 3000);
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to submit review.");
    }
  };

  // Vanilla JS Diff Engine: wraps historian changes in <verified> tags
  function buildDiffTranscript(originalClean, editedText) {
    const origWords = originalClean.split(/\s+/).filter(w => w);
    const editWords = editedText.split(/\s+/).filter(w => w);
    const result = [];
    const maxLen = Math.max(origWords.length, editWords.length);
    for (let i = 0; i < maxLen; i++) {
      const orig = origWords[i] || "";
      const edit = editWords[i] || "";
      if (!edit) continue;
      if (orig !== edit) {
        result.push(`<verified>${edit}</verified>`);
      } else {
        result.push(edit);
      }
    }
    return result.join(" ");
  }

  // Helper: extract numeric accuracy from overallAccuracy or confidenceScore
  function parseAccuracy(docItem) {
    if (docItem.overallAccuracy) {
      return parseInt(String(docItem.overallAccuracy).replace("%", ""), 10) || 0;
    }
    return docItem.confidenceScore ?? 0;
  }

  const renderInput = (key, label, type = "text", rows) => {
    const isChanged = !!changedFields[key];
    const colorStyle = isChanged ? { color: "#7C3AED" } : { color: "#e2e8f0" };
    return (
      <div className="w-full">
        <label className="block text-[10px] font-black tracking-widest text-slate-500 uppercase mb-2">{label}</label>
        {type === "textarea" ? (
          <textarea
            value={editValues[key]}
            onChange={e => handleFieldChange(key, e.target.value)}
            disabled={selectedDoc?.isLocked}
            rows={rows || 4}
            className="w-full bg-museum-900/60 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors resize-none mb-4"
            style={colorStyle}
          />
        ) : (
          <input
            type={type}
            value={editValues[key]}
            onChange={e => handleFieldChange(key, type === "number" ? Number(e.target.value) : e.target.value)}
            disabled={selectedDoc?.isLocked}
            className="w-full bg-museum-900/60 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-gold-500/50 transition-colors mb-4"
            style={colorStyle}
            min={type === "number" ? 0 : undefined}
            max={type === "number" ? 100 : undefined}
          />
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      {!selectedDoc && (
        <div className="mb-10 animate-[fadeIn_0.5s_ease-out] flex justify-between items-end">
          <div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-gold-400 mb-2">Historian Review Queue</h1>
            <p className="text-slate-500 tracking-[0.2em] uppercase text-xs">Documents pending scholarly verification</p>
          </div>
        </div>
      )}

      {!selectedDoc && documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-[fadeIn_0.5s_ease-out]">
          <div className="text-slate-400 text-lg font-light tracking-wide">
            All documents have been reviewed.
          </div>
        </div>
      ) : !selectedDoc ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-[fadeIn_0.5s_ease-out]">
          {documents.map(docItem => (
            <div
              key={docItem.id}
              className="bg-museum-800/40 p-5 rounded-3xl border border-white/5 shadow-xl hover:border-gold-500/50 transition-all cursor-pointer backdrop-blur-xl"
              onClick={() => handleOpenDoc(docItem)}
            >
              <img src={docItem.imageBase64?.startsWith('/') ? docItem.imageBase64 : `data:image/jpeg;base64,${docItem.imageBase64}`} alt="Thumbnail" className="w-full h-48 object-cover rounded-2xl mb-4 bg-black/50" />
              <div className="flex justify-between items-start mb-4">
                <div className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full">
                  Pending Review
                </div>
                <div className="text-gold-400 font-heading text-lg">{parseAccuracy(docItem)}%</div>
              </div>
              <div className="text-slate-200 font-black tracking-widest uppercase text-sm mb-1">{docItem.script || "Unknown Script"}</div>
              <div className="text-slate-500 text-xs tracking-[0.2em] uppercase mb-1">{docItem.era || "Unknown Era"}</div>
              <div className="text-slate-600 text-[10px] tracking-widest uppercase">Searched: {docItem.searchCount || 0} times</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-2 animate-[fadeIn_0.5s_ease-out]">
          {/* Left Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <button
              onClick={() => { setSelectedDoc(null); setChangedFields({}); setEditValues({}); }}
              className="self-start text-slate-500 hover:text-white transition-colors text-sm font-black tracking-widest uppercase mb-2"
            >
              &larr; Back to Queue
            </button>
            <div className="bg-museum-900/40 p-5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl">
              <div className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase mb-4 pl-1">Document Specimen</div>
              <img src={selectedDoc.imageBase64?.startsWith('/') ? selectedDoc.imageBase64 : `data:image/jpeg;base64,${selectedDoc.imageBase64}`} alt="Artifact" className="w-full h-auto rounded-xl object-contain max-h-[600px] shadow-inner bg-black/50" />
              {selectedDoc.isLocked && (
                <div className="mt-6 bg-purple-500/10 border border-purple-500/30 text-purple-400 p-4 rounded-2xl text-center font-black tracking-widest text-sm">
                  This document has already been reviewed.
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 flex flex-col h-full">
            {/* Tabs */}
            <div className="flex border-b border-white/10 mb-6 gap-8 pb-1 overflow-x-auto no-scrollbar">
              {['Summary', 'Linguistic Analysis'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-[10px] font-black tracking-[0.2em] uppercase transition-all whitespace-nowrap ${activeTab === tab ? 'text-gold-400 border-b-2 border-gold-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab}
                  {tab === 'Linguistic Analysis' && (
                    <span className="text-gold-400 text-xs font-black ml-2">{parseAccuracy(selectedDoc)}%</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-museum-900/60 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl flex-1 flex flex-col min-h-[500px] mb-8">
              {activeTab === 'Summary' && (
                <div className="animate-[fadeIn_0.3s]">
                  <div className="flex flex-col md:flex-row gap-6 mb-8 pb-8 border-b border-white/5">
                    <div className="flex-1 space-y-2">
                      {renderInput('script', 'Script Type')}
                    </div>
                    <div className="flex-1 space-y-2">
                      {renderInput('era', 'Chronological Era')}
                    </div>
                  </div>
                  <div>
                    {renderInput('summary', 'Abstract / Summary', 'textarea', 3)}
                  </div>
                </div>
              )}
              {activeTab === 'Linguistic Analysis' && (
                <div className="animate-[fadeIn_0.3s]">
                  <div className="mb-8">
                    {renderInput('transcript', 'Edit Transcript — changes turn purple', 'textarea', 8)}
                  </div>
                  
                  <div className="mb-8">
                    <div className="text-xs font-bold tracking-[0.3em] text-slate-500 uppercase mb-6">Original Paleographic Transcript</div>
                    <div className="bg-museum-900/60 backdrop-blur-2xl p-10 md:p-16 rounded-3xl border border-white/5 shadow-2xl leading-[2.5] text-xl font-heading mb-6">
                      {(() => {
                        const rawTranscript = selectedDoc.transcript || "";
                        const parts = rawTranscript.split(/(<predict[^>]*>.*?<\/predict>|<reconstruct>.*?<\/reconstruct>|<verified>.*?<\/verified>)/g);
                        return parts.map((part, idx) => {
                          if (!part) return null;
                          const predictMatch = part.match(/<predict[^>]*>([^<]+)<\/predict>/);
                          if (predictMatch) return <span key={idx} className="inline-block bg-gold-500/20 border border-gold-500 text-gold-300 px-2 py-0.5 rounded-md mx-0.5 text-sm">{predictMatch[1]}</span>;
                          const reconstructMatch = part.match(/<reconstruct>([^<]+)<\/reconstruct>/);
                          if (reconstructMatch) return <span key={idx} className="inline-block bg-red-500/20 border border-red-500 text-red-300 px-2 py-0.5 rounded-md mx-0.5 text-sm">{reconstructMatch[1]}</span>;
                          const verifiedMatch = part.match(/<verified>([^<]+)<\/verified>/);
                          if (verifiedMatch) return <span key={idx} className="inline-block bg-purple-500/20 border border-purple-500 text-purple-300 px-2 py-0.5 rounded-md mx-0.5 text-sm">{verifiedMatch[1]}</span>;
                          return <span key={idx} className="text-slate-200">{part}</span>;
                        });
                      })()}
                    </div>
                    <div className="flex flex-row gap-6 text-[10px] uppercase tracking-widest text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full inline-block bg-[#7C3AED]"></span>
                        Historian Verified
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full inline-block bg-gold-500"></span>
                        AI Prediction
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full inline-block bg-red-500"></span>
                        Reconstruction Needed
                      </div>
                    </div>
                  </div>

                  {renderInput('modernMarathi', 'Modern Translation', 'textarea', 5)}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-auto pt-4">
              <button
                onClick={handleSubmit}
                disabled={selectedDoc?.isLocked || Object.keys(changedFields).length === 0}
                className="w-full bg-[#7C3AED] text-white px-8 py-4 rounded-xl font-black tracking-widest uppercase hover:bg-purple-600 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify & Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-museum-900 border border-purple-500/30 px-6 py-4 rounded-2xl shadow-2xl animate-[fadeIn_0.3s_ease-out]">
          <span className="text-sm font-black tracking-widest uppercase" style={{ color: "#7C3AED" }}>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}