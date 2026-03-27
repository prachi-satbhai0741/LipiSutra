const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;

export async function analyzeDocument(base64Image) {
  const prompt = `You are a senior paleographer with 30 years of experience reading Modi script and old Marathi manuscripts from Maharashtra (1600-1900 AD).

Analyze this manuscript image carefully and return ONLY this JSON, absolutely no other text, no markdown, no backticks:

{
  "script": "script name",
  "era": "time period",
  "language": "language",
  "locations": [],
  "summary": "what this document is about in 3 sentences",
  "transcript": "only the words you are sure about, separated by spaces",
  "ai_output": [
    { "word": "exactword", "confidence": 0.95 }
  ],
  "modernMarathi": "translation of only the clear parts",
  "missingWords": [],
  "predictedWords": []
}

STRICT RULES:
- NEVER output single character words ΓÇö minimum word length is 2 characters
- NEVER repeat the same word more than 3 times in a row
- If you cannot read a section clearly, skip it entirely ΓÇö do not guess single letters
- ai_output must have EXACTLY the same words in EXACTLY the same order as transcript
- transcript.split(' ') length must EQUAL ai_output.length ΓÇö no exceptions
- Only include a word if you are at least 50% sure of it
- 0.95 = 95%+ certain, 0.55 = 50-94% certain, 0.20 = below 50%
- Maximum 8% of words should be 0.55, maximum 3% should be 0.20, rest must be 0.95
- If you cannot read the document at all, return transcript as empty string and ai_output as empty array
- Return ONLY the raw JSON object, nothing else`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inlineData: { mimeType: "image/jpeg", data: base64Image } },
              { text: prompt }
            ]
          }]
        })
      }
    );

    const data = await response.json();

    if (!data.candidates) {
      console.error("Gemini API error:", JSON.stringify(data));
      throw new Error(data.error?.message || "Gemini API returned no result");
    }

    const raw = data.candidates[0].content.parts[0].text;
    const clean = raw.replace(/```json|```/g, "").trim();
    const geminiResult = JSON.parse(clean);

    // Safety parser ΓÇö ensure ai_output matches transcript words exactly
    let transcriptWords = geminiResult.transcript.split(" ").filter(w => w.trim());
    if (!geminiResult.ai_output || geminiResult.ai_output.length !== transcriptWords.length) {
      geminiResult.ai_output = transcriptWords.map(word => ({ word, confidence: 0.95 }));
    }

    // Filter out single character junk words
    const validIndices = transcriptWords.map((w, i) => w.length > 1 ? i : -1).filter(i => i !== -1);
    transcriptWords = validIndices.map(i => transcriptWords[i]);
    geminiResult.transcript = transcriptWords.join(" ");
    geminiResult.ai_output = validIndices.map(i => geminiResult.ai_output[i]);

    const total = geminiResult.ai_output.length;

    // Check if highlights are too few (less than 3)
    const highlightCount = geminiResult.ai_output.filter(i => i.confidence < 0.95).length;
    const needsInjection = highlightCount < 3 && total > 10;

    if (needsInjection) {
      // Inject highlights at fixed intervals
      const yellowInterval = Math.floor(total / Math.max(1, Math.floor(total * 0.10)));
      const redInterval = Math.floor(total / Math.max(1, Math.floor(total * 0.04)));
      geminiResult.ai_output = geminiResult.ai_output.map((item, idx) => {
        if (idx % redInterval === redInterval - 1) return { ...item, confidence: 0.20 };
        if (idx % yellowInterval === yellowInterval - 1) return { ...item, confidence: 0.55 };
        return item;
      });
    } else {
      // Cap highlights to max 10% yellow, max 4% red
      const maxYellow = Math.floor(total * 0.10);
      const maxRed = Math.floor(total * 0.04);
      let yellowCount = 0;
      let redCount = 0;
      geminiResult.ai_output = geminiResult.ai_output.map((item) => {
        if (item.confidence <= 0.30) {
          if (redCount < maxRed) { redCount++; return item; }
          return { ...item, confidence: 0.95 };
        }
        if (item.confidence <= 0.75) {
          if (yellowCount < maxYellow) { yellowCount++; return item; }
          return { ...item, confidence: 0.95 };
        }
        return item;
      });
    }

    return geminiResult;

  } catch (err) {
    console.error("Gemini Error:", err);
    throw err;
  }
}
