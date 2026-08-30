// tts.jsx — Kokoro-82M in-browser text-to-speech for Child View's
// "Read to me", with automatic fallback to the browser's built-in
// speechSynthesis if Kokoro can't load or fails for any reason.
//
// Loaded lazily: the kokoro-js module and ONNX model are only fetched on
// the first speakStep() call, then kept as a page-lifetime singleton.
// No offline caching yet — this needs network on first use per session.

const KOKORO_CDN = 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.0/+esm';
const KOKORO_MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const KOKORO_VOICE = 'af_heart';

let kokoroInstance = null;
let kokoroLoadPromise = null;
let kokoroFailed = false;

let lastCacheKey = null;
let lastAudioBlob = null;
let currentAudioEl = null;

function wavFromFloat32(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (off, str) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
  writeStr(0, 'RIFF'); view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, 'WAVE'); writeStr(12, 'fmt '); view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  writeStr(36, 'data'); view.setUint32(40, samples.length * 2, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([view], { type: 'audio/wav' });
}

async function loadKokoro() {
  if (kokoroInstance) return kokoroInstance;
  if (!kokoroLoadPromise) {
    kokoroLoadPromise = (async () => {
      const mod = await import(KOKORO_CDN);
      const KokoroTTS = mod.KokoroTTS || mod.default;
      const tts = await KokoroTTS.from_pretrained(KOKORO_MODEL, { dtype: 'q8', device: 'wasm' });
      kokoroInstance = tts;
      return tts;
    })();
  }
  return kokoroLoadPromise;
}

function speakWithBrowser(text, { onStart, onEnd } = {}) {
  if (!('speechSynthesis' in window)) { onEnd && onEnd(); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95; u.pitch = 1.05;
  u.onstart = () => onStart && onStart();
  u.onend = () => onEnd && onEnd();
  u.onerror = () => onEnd && onEnd();
  window.speechSynthesis.speak(u);
}

function stopSpeaking() {
  if (currentAudioEl) { try { currentAudioEl.pause(); } catch (e) {} currentAudioEl = null; }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// Fire-and-forget. onStart fires once audio actually begins (i.e. once
// loading/generation is done) — callers use that to clear a "loading" state.
async function speakStep(text, { onStart, onEnd } = {}) {
  stopSpeaking();
  if (!text) return;

  if (kokoroFailed) { speakWithBrowser(text, { onStart, onEnd }); return; }

  try {
    let blob;
    if (lastCacheKey === text && lastAudioBlob) {
      blob = lastAudioBlob;
    } else {
      const tts = await loadKokoro();
      const audio = await tts.generate(text, { voice: KOKORO_VOICE });
      blob = wavFromFloat32(audio.audio, audio.sampling_rate);
      lastCacheKey = text; lastAudioBlob = blob;
    }
    const url = URL.createObjectURL(blob);
    const el = new Audio(url);
    currentAudioEl = el;
    el.onplay = () => onStart && onStart();
    el.onended = () => { if (currentAudioEl === el) currentAudioEl = null; URL.revokeObjectURL(url); onEnd && onEnd(); };
    el.onerror = () => { if (currentAudioEl === el) currentAudioEl = null; URL.revokeObjectURL(url); onEnd && onEnd(); };
    await el.play();
  } catch (e) {
    console.error('KindCue: Kokoro TTS unavailable, falling back to browser speech.', e);
    kokoroFailed = true;
    speakWithBrowser(text, { onStart, onEnd });
  }
}

window.KindCueTTS = { speakStep, stopSpeaking };
