// Ambient music — layered, mixable, generated in the browser (no audio files).
// Kept outside React: audio nodes are long-lived imperative objects, not UI state.

let ctx = null, master = null, reverb = null;
let volume = 0.6, faded = false;
const layers = {};

function createImpulseResponse(c, duration, decay) {
  const length = Math.floor(c.sampleRate * duration);
  const impulse = c.createBuffer(2, length, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
  }
  return impulse;
}

function ensureCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    reverb = ctx.createConvolver();
    reverb.buffer = createImpulseResponse(ctx, 2.6, 2.8);
    reverb.connect(master);
  }
  return ctx;
}

// Sends a portion of a layer's signal into the shared reverb bus for spaciousness.
function sendToReverb(layerGain, amount) {
  const send = ctx.createGain();
  send.gain.value = amount;
  layerGain.connect(send);
  send.connect(reverb);
  return send;
}

function makeNoiseBuffer(shape) {
  const size = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < size; i++) {
    const white = Math.random() * 2 - 1;
    if (shape === 'brown') { last = (last + 0.02 * white) / 1.02; data[i] = last * 3.5; }
    else if (shape === 'rain') { last = 0.98 * last + 0.02 * white; data[i] = last * 2.2; }
    else data[i] = white * 0.5;
  }
  return buffer;
}

function loopSource(shape) {
  const src = ctx.createBufferSource();
  src.buffer = makeNoiseBuffer(shape);
  src.loop = true;
  return src;
}

function startLayer(type) {
  if (layers[type]) return;
  ensureCtx();
  const gain = ctx.createGain();
  gain.connect(master);
  const handle = { gain, nodes: [], timers: [] };

  if (type === 'pad') {
    // A slow-evolving chord drone: detuned triangle pairs per note, a gently
    // modulated low-pass filter, and a healthy reverb send.
    const notesHz = [110, 164.81, 220, 277.18, 329.63];
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 900; filter.Q.value = 0.2;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.035;
    const lfoDepth = ctx.createGain(); lfoDepth.gain.value = 350;
    lfo.connect(lfoDepth); lfoDepth.connect(filter.frequency); lfo.start();
    handle.nodes.push(filter, lfo, lfoDepth);
    notesHz.forEach((freq, i) => {
      [0.997, 1.003].forEach(detune => {
        const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq * detune;
        const og = ctx.createGain(); og.gain.value = i === 0 ? 0.16 : 0.07;
        o.connect(og); og.connect(filter); o.start();
        handle.nodes.push(o, og);
      });
    });
    filter.connect(gain);
    gain.gain.value = 0.5;
    handle.nodes.push(sendToReverb(gain, 0.55));
  } else if (type === 'white' || type === 'brown' || type === 'rain') {
    const src = loopSource(type);
    src.connect(gain);
    gain.gain.value = type === 'brown' ? 0.5 : type === 'rain' ? 0.45 : 0.3;
    src.start();
    handle.nodes.push(src, sendToReverb(gain, 0.12));
  } else if (type === 'ocean') {
    const src = loopSource('brown');
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 350;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.08;
    const lfoDepth = ctx.createGain(); lfoDepth.gain.value = 0.25;
    gain.gain.value = 0.55;
    lfo.connect(lfoDepth); lfoDepth.connect(gain.gain);
    src.connect(filter); filter.connect(gain);
    src.start(); lfo.start();
    handle.nodes.push(src, filter, lfo, lfoDepth, sendToReverb(gain, 0.3));
  } else if (type === 'wind') {
    const src = loopSource('white');
    const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 500; filter.Q.value = 0.7;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
    const lfoDepth = ctx.createGain(); lfoDepth.gain.value = 150;
    gain.gain.value = 0.4;
    lfo.connect(lfoDepth); lfoDepth.connect(filter.frequency);
    src.connect(filter); filter.connect(gain);
    src.start(); lfo.start();
    handle.nodes.push(src, filter, lfo, lfoDepth, sendToReverb(gain, 0.18));
  } else if (type === 'cafe') {
    const src = loopSource('white');
    const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 900; filter.Q.value = 0.9;
    gain.gain.value = 0.35;
    src.connect(filter); filter.connect(gain);
    src.start();
    handle.nodes.push(src, filter, sendToReverb(gain, 0.22));
  } else if (type === 'fire') {
    const src = loopSource('brown');
    src.connect(gain); gain.gain.value = 0.22;
    src.start();
    handle.nodes.push(src, sendToReverb(gain, 0.15));
    // One short noise buffer reused for every crackle.
    const crackleBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate);
    const cd = crackleBuf.getChannelData(0);
    for (let i = 0; i < cd.length; i++) cd[i] = Math.random() * 2 - 1;
    const scheduleCrackle = () => {
      const t = ctx.currentTime;
      const burst = ctx.createBufferSource();
      burst.buffer = crackleBuf;
      const burstGain = ctx.createGain();
      const dur = 0.02 + Math.random() * 0.03;
      burstGain.gain.setValueAtTime(0, t);
      burstGain.gain.linearRampToValueAtTime(0.3 + Math.random() * 0.3, t + dur * 0.3);
      burstGain.gain.linearRampToValueAtTime(0, t + dur);
      burst.connect(burstGain); burstGain.connect(gain);
      burst.start(t); burst.stop(t + dur + 0.02);
      handle.timers = [setTimeout(scheduleCrackle, 150 + Math.random() * 500)];
    };
    scheduleCrackle();
  }
  layers[type] = handle;
}

function stopLayer(type) {
  const h = layers[type];
  if (!h) return;
  h.timers.forEach(id => clearTimeout(id));
  h.nodes.forEach(n => {
    try { if (n.stop) n.stop(); } catch { /* already stopped */ }
    try { n.disconnect(); } catch { /* already disconnected */ }
  });
  try { h.gain.disconnect(); } catch { /* already disconnected */ }
  delete layers[type];
}

/** Turns a sound on or off and returns the keys of the sounds now playing. */
export function toggleLayer(type) {
  if (layers[type]) stopLayer(type); else startLayer(type);
  return Object.keys(layers);
}

/** Starts saved sounds on load. Browsers keep audio muted until the first click, so resume then. */
export function restoreLayers(types) {
  if (!types.length) return;
  types.forEach(startLayer);
  document.addEventListener('click', () => { if (ctx && ctx.state === 'suspended') ctx.resume(); }, { once: true });
}

export function setVolume(v) {
  volume = v;
  if (master) master.gain.value = v;
}

// Fades the whole mix to silence over the last ~12s of a countdown/Pomodoro session.
export function maybeFade(remainingSec, mode) {
  if (faded || mode === 'stopwatch' || !master) return;
  if (remainingSec <= 0 || remainingSec > 12) return;
  if (!Object.keys(layers).length) return;
  faded = true;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + remainingSec);
}

/** Clears any fade so the next session starts at full volume. */
export function resetFade() {
  faded = false;
  if (!master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(volume, now);
}

// A softer two-note chime marking the end of a session; one shared context.
let chimeCtx = null;
export function chime() {
  try {
    if (!chimeCtx) chimeCtx = new (window.AudioContext || window.webkitAudioContext)();
    const c = chimeCtx;
    if (c.state === 'suspended') c.resume();
    [660, 880].forEach((freq, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      o.connect(g); g.connect(c.destination);
      const t0 = c.currentTime + i * 0.14;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.2, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.5);
      o.start(t0); o.stop(t0 + 0.55);
    });
  } catch { /* audio unavailable */ }
}
