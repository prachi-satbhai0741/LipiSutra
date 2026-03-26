
const GEMINI_KEY = process.env.VITE_GEMINI_KEY;
async function run() {
  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + GEMINI_KEY);
    const d = await r.json();
    if (d.models) {
      console.log(d.models.map(m => m.name).join('\n'));
    } else {
      console.log(JSON.stringify(d, null, 2));
    }
  } catch (e) {
    console.error(e);
  }
}

run();
