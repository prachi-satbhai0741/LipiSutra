const GEMINI_KEY = process.env.VITE_GEMINI_KEY;
const fs = require('fs');

async function run() {
  try {
    const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + GEMINI_KEY);
    const d = await r.json();
    fs.writeFileSync('all_models.json', JSON.stringify(d, null, 2));
    if (d.models) {
      console.log('Saved ' + d.models.length + ' models to all_models.json');
    } else {
      console.log('Error: ' + JSON.stringify(d));
    }
  } catch (e) {
    console.error(e);
  }
}

run();
