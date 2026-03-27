export function speakText(text, langCode = "hi-IN") {
  // Strip all XML prediction/reconstruction tags before speaking
  const cleanText = (text || "")
    .replace(/<predict[^>]*>/g, "")
    .replace(/<\/predict>/g, "")
    .replace(/<reconstruct>/g, "")
    .replace(/<\/reconstruct>/g, "");

  if (!window.speechSynthesis) {
    console.error("Web Speech API not supported in this browser.");
    return;
  }

  // Cancel any stuck silent queues
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "hi-IN";
  utterance.volume = 1;
  utterance.rate = 0.9;
  utterance.pitch = 1;

  function assignVoiceAndSpeak() {
    const voices = window.speechSynthesis.getVoices();
    const indicVoice = voices.find(v =>
      v.name.includes("Google हिन्दी") ||
      v.lang.includes("hi") ||
      v.lang.includes("mr")
    );
    if (indicVoice) {
      utterance.voice = indicVoice;
    }
    window.speechSynthesis.speak(utterance);
  }

  // Chrome async bug: getVoices() is empty on first call — wait for onvoiceschanged
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    assignVoiceAndSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null; // prevent repeated firing
      assignVoiceAndSpeak();
    };
  }
}