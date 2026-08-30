// stt.jsx — fully local speech-to-text for the KindCue Assistant's
// microphone input, via a small Whisper model run in-browser
// (transformers.js, WASM). Lazy-loaded on first mic use, cached as one
// singleton pipeline for the rest of the session. Audio never leaves the
// device — everything happens in-page.

const WHISPER_CDN = 'https://esm.run/@huggingface/transformers@3.0.2';
const WHISPER_MODEL = 'onnx-community/whisper-tiny.en';

let sttPipelinePromise = null;
async function getSTT(onProgress) {
  if (!sttPipelinePromise) {
    sttPipelinePromise = (async () => {
      const { pipeline } = await import(WHISPER_CDN);
      return pipeline('automatic-speech-recognition', WHISPER_MODEL, {
        dtype: 'q8', device: 'wasm', progress_callback: onProgress,
      });
    })();
  }
  return sttPipelinePromise;
}

function mixDown(buf) {
  const out = new Float32Array(buf.length);
  const n = buf.numberOfChannels;
  for (let c = 0; c < n; c++) {
    const d = buf.getChannelData(c);
    for (let i = 0; i < d.length; i++) out[i] += d[i] / n;
  }
  return out;
}

async function resampleTo16k(audioBuffer) {
  if (audioBuffer.sampleRate === 16000) {
    return audioBuffer.numberOfChannels > 1 ? mixDown(audioBuffer) : audioBuffer.getChannelData(0);
  }
  const length = Math.max(1, Math.ceil(audioBuffer.duration * 16000));
  const offline = new OfflineAudioContext(1, length, 16000);
  const src = offline.createBufferSource();
  src.buffer = audioBuffer;
  src.connect(offline.destination);
  src.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

// Blob (whatever MediaRecorder produced — webm/opus, etc.) → transcript.
async function transcribeBlob(blob, onProgress) {
  const arrBuf = await blob.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const decoded = await ctx.decodeAudioData(arrBuf);
  await ctx.close();
  const audio = await resampleTo16k(decoded);
  const stt = await getSTT(onProgress);
  const out = await stt(audio);
  return (out.text || '').trim();
}

function voiceSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia &&
    window.MediaRecorder && (window.AudioContext || window.webkitAudioContext));
}

window.KindCueSTT = { getSTT, transcribeBlob, voiceSupported };
