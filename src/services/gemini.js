const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;

export async function analyzeDocument(base64Image) {
  const prompt = `You are a senior paleographer with 30 years of experience reading Modi script and old Marathi manuscripts from Maharashtra (1600-1900 AD).

Analyze this manuscript image carefully and return ONLY this JSON, absolutely no other text:

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
  "modernMarathi": "translation of only the clear parts"
}

STRICT RULES:
- NEVER write [अस्पष्ट] in transcript — simply skip unreadable words entirely
- ai_output must have EXACTLY the same words in EXACTLY the same order as transcript
- transcript.split(' ') length must EQUAL ai_output.length — no exceptions
- Only include a word if you are at least 50% sure of it
- 0.95 = 95%+ certain, 0.55 = 50-94% certain, 0.20 = below 50%
- Maximum 10% of words should be 0.55, maximum 3% should be 0.20
- In any manuscript at least 10% words must be 0.55 and 3% must be 0.20 — never return all words as 0.95
- If you cannot read the document at all, return transcript as empty string and ai_output as empty array
- Return ONLY the raw JSON object, no markdown, no backticks, no explanation`;

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

    // Safety parser — ensure ai_output matches transcript words exactly
    const transcriptWords = geminiResult.transcript.split(" ").filter(w => w.trim());
    if (!geminiResult.ai_output || geminiResult.ai_output.length !== transcriptWords.length) {
      geminiResult.ai_output = transcriptWords.map(word => ({ word, confidence: 0.95 }));
    }

    return geminiResult;

  } catch (err) {
    console.error("Gemini Error:", err);
    throw err;
  }
}