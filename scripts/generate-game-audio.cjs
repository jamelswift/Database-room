// Original synthesized audio for Database City. Run: node scripts/generate-game-audio.cjs
const fs = require('node:fs');
const path = require('node:path');
const out = path.join(__dirname, '../public/audio');
fs.mkdirSync(out, { recursive: true });
const rate = 22050;
function render(name, seconds, notes) {
  const samples = new Float64Array(Math.ceil(seconds * rate));
  for (const [start, duration, frequency, volume, kind = 'sine'] of notes) {
    for (let i = 0; i < Math.floor(duration * rate); i++) {
      const index = Math.round(start * rate) + i;
      if (index >= samples.length) break;
      const t = i / rate;
      const phase = 2 * Math.PI * frequency * t;
      // Original procedural action voices: punchy bass, brass-like stabs and drums.
      const random = Math.sin(i * 12.9898 + frequency * 78.233) * 43758.5453;
      const noise = 2 * (random - Math.floor(random)) - 1;
      let wave = Math.sin(phase);
      let decay = 1;
      let attack = 0.012;
      if (kind === 'triangle') wave = 2 / Math.PI * Math.asin(Math.sin(phase));
      if (kind === 'pluck') { wave += 0.28 * Math.sin(phase * 2) + 0.12 * Math.sin(phase * 3); decay = Math.exp(-t * 8); }
      if (kind === 'bell') { wave += 0.32 * Math.sin(phase * 2.76) + 0.12 * Math.sin(phase * 5.4); decay = Math.exp(-t * 4); }
      if (kind === 'bass') { wave += 0.22 * Math.sin(phase * 2); decay = Math.exp(-t * 4.5); }
      if (kind === 'pad') { wave = (wave + 0.25 * Math.sin(phase * 1.003)) * 0.7; attack = 0.3; }
      if (kind === 'brush') { wave = noise; decay = Math.exp(-t * 35); attack = 0.002; }
      if (kind === 'kick') { wave = Math.sin(2 * Math.PI * (48 * t + 3 * (1 - Math.exp(-t * 25)))); decay = Math.exp(-t * 22); attack = 0.002; }
      if (kind === 'digital') { wave = Math.sin(phase + 1.8 * Math.exp(-t * 9) * Math.sin(phase * 2)); decay = Math.exp(-t * 6); attack = 0.006; }
      if (kind === 'sub') { wave += 0.18 * Math.sin(phase * 3) + 0.08 * Math.sin(phase * 5); decay = Math.exp(-t * 3); }
      if (kind === 'air') { wave = 0.55 * Math.sin(phase + 0.6 * Math.sin(2 * Math.PI * 0.7 * t)) + 0.22 * Math.sin(phase * 1.005); attack = 0.22; }
      if (kind === 'scan') { wave = Math.sin(phase + 1.2 * Math.sin(2 * Math.PI * frequency * 1.006 * t)); decay = Math.exp(-t * 5); }
      if (kind === 'hat') { wave = (noise + 0.2 * Math.sin(phase * 2.7)) * 0.7; decay = Math.exp(-t * 65); attack = 0.001; }
      if (kind === 'snare') { wave = 0.7 * noise + 0.3 * Math.sin(2 * Math.PI * 180 * t); decay = Math.exp(-t * 22); attack = 0.002; }
      if (kind === 'piano') {
        wave = Math.sin(phase) * Math.exp(-t * 1.25)
          + 0.35 * Math.sin(phase * 2.002) * Math.exp(-t * 2.5)
          + 0.16 * Math.sin(phase * 3.006) * Math.exp(-t * 4)
          + 0.055 * Math.sin(phase * 4.012) * Math.exp(-t * 7);
        attack = 0.007;
      }
      if (kind === 'clock') { wave = 0.6 * Math.sin(phase) + 0.25 * Math.sin(phase * 2.3) + 0.15 * noise; decay = Math.exp(-t * 100); attack = 0.001; }
      if (kind === 'mist') { wave = 0.6 * Math.sin(phase) + 0.25 * Math.sin(phase * 1.002); wave *= 0.8 + 0.2 * Math.sin(t * 2); attack = 0.6; }
      if (kind === 'punch') { wave = Math.tanh(1.7 * (Math.sin(phase) + 0.28 * Math.sin(phase * 2) + 0.12 * Math.sin(phase * 3))); decay = Math.exp(-t * 2.8); attack = 0.004; }
      if (kind === 'brass') { wave = 0.65 * Math.sin(phase) + 0.3 * Math.sin(phase * 2) + 0.18 * Math.sin(phase * 3) + 0.09 * Math.sin(phase * 4); decay = Math.exp(-t * 2); attack = 0.024; }
      if (kind === 'strings') { wave = 0.62 * Math.sin(phase) + 0.2 * Math.sin(phase * 2.004) + 0.12 * Math.sin(phase * 3); decay = Math.exp(-t * 7); attack = 0.012; }
      if (kind === 'tom') { wave = Math.sin(phase + 2 * (1 - Math.exp(-t * 22))); decay = Math.exp(-t * 15); attack = 0.003; }
      if (kind === 'crash') { wave = 0.7 * noise + 0.12 * Math.sin(phase * 1.41); decay = Math.exp(-t * 6); attack = 0.002; }
      const envelope = Math.min(1, t / attack) * Math.min(1, (duration - t) / ((kind === 'pad' || kind === 'air' || kind === 'mist') ? 0.6 : (kind === 'piano' ? 0.25 : 0.02))) * decay;
      samples[index] += wave * envelope * volume;
    }
  }
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write('RIFF'); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(rate, 24); buffer.writeUInt32LE(rate * 2, 28);
  buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36); buffer.writeUInt32LE(samples.length * 2, 40);
  // Smooth boundaries where final percussion or echo tails meet the next loop.
  const fadeSamples = Math.round(rate * 0.008);
  for (let i = 0; i < Math.min(fadeSamples, samples.length); i++) {
    const gain = i / fadeSamples;
    samples[i] *= gain;
    samples[samples.length - 1 - i] *= gain;
  }
  let rawPeak = 0;
  for (const value of samples) rawPeak = Math.max(rawPeak, Math.abs(value));
  const headroom = rawPeak > 0.84 ? 0.84 / rawPeak : 1;
  samples.forEach((value, i) => buffer.writeInt16LE(Math.round(value * headroom * 32767), 44 + i * 2));
  fs.writeFileSync(path.join(out, name + '.wav'), buffer);
}
const hz = midi => 440 * 2 ** ((midi - 69) / 12);
render('click', 0.12, [[0, 0.09, hz(81), 0.18, 'digital']]);
render('correct', 0.8, [[0, 0.23, hz(64), 0.18, 'brass'], [0.13, 0.28, hz(67), 0.18, 'brass'], [0.28, 0.46, hz(76), 0.18, 'brass']]);
render('incorrect', 0.55, [[0, 0.22, hz(40), 0.23, 'punch'], [0.16, 0.33, hz(39), 0.2, 'punch']]);
render('mission', 1.25, [[0, 0.18, 80, 0.24, 'kick'], [0.16, 0.2, 110, 0.2, 'tom'], [0.3, 0.2, 85, 0.2, 'tom'], [0.45, 0.7, hz(52), 0.2, 'brass'], [0.45, 0.7, hz(59), 0.14, 'brass'], [0.45, 0.6, 4000, 0.1, 'crash']]);
render('victory', 2, [[0, 0.2, 80, 0.23, 'kick'], ...[64, 67, 71, 76].map((midi, i) => [i * 0.17, 0.65, hz(midi), 0.2, 'brass']), [0.51, 1.2, hz(52), 0.12, 'air'], [0.51, 0.75, 4000, 0.11, 'crash']]);
// Original spy chase: syncopated 3+3+2 bass riff and minor/chromatic brass replies.
const roots = [40, 40, 36, 35, 40, 33, 38, 35];
const leads = [[64, 67, 66, 71], [64, 63, 64, 67], [67, 71, 70, 67], [66, 63, 66, 71], [76, 74, 71, 67], [69, 72, 71, 69], [66, 69, 68, 66], [63, 66, 71, 63]];
function music(name, bpm, tense) {
  const beat = 60 / bpm;
  const bars = 16;
  const seconds = bars * 4 * beat;
  const notes = [];
  for (let bar = 0; bar < bars; bar++) {
    const root = roots[bar % 8];
    const base = bar * 4 * beat;
    [0, 1.5, 3].forEach((step, i) => notes.push([base + step * beat, beat * 0.8, hz(root + (i === 1 ? 12 : 0)), 0.27, 'punch']));
    if (tense) [0.75, 2.25, 3.5].forEach(step => notes.push([base + step * beat, beat * 0.35, hz(root + 7), 0.16, 'punch']));
    for (let step = 0; step < 8; step++) {
      const at = base + step * beat / 2;
      notes.push([at, beat * 0.34, hz(root + [24, 31, 27, 31][step % 4]), 0.065, 'strings']);
      notes.push([at, 0.075, 6500, step % 2 === 0 ? 0.06 : 0.09, 'hat']);
    }
    if (bar % 2 === 0 || tense) leads[bar % 8].forEach((midi, step) => {
      const at = base + [0.5, 1.25, 2.5, 3.25][step] * beat;
      notes.push([at, beat * 0.55, hz(midi), 0.12, 'brass']);
      notes.push([at + beat * 0.25, beat * 0.35, hz(midi), 0.022, 'digital']);
    });
    for (let step = 0; step < 4; step++) {
      if (step % 2 === 0 || tense) notes.push([base + step * beat, 0.19, 80, 0.24, 'kick']);
      if (step % 2 === 1) notes.push([base + step * beat, 0.15, 1800, 0.16, 'snare']);
    }
    if (bar % 4 === 3) [0, 1, 2].forEach((step) => notes.push([base + (3.25 + step * 0.25) * beat, 0.12, [135, 110, 85][step], 0.13, 'tom']));
    if (bar % 4 === 0) notes.push([base, 0.65, 4000, 0.085, 'crash']);
    [root + 12, root + 19].forEach(midi => notes.push([base, beat * 3.85, hz(midi), 0.025, 'air']));
  }
  render(name, seconds, notes);
}
music('city-theme', 128, false); // 30-second action exploration loop.
music('mission-theme', 144, true); // 26.67-second chase with stronger drums and bass.
console.log('Generated 7 original spy action WAV files in public/audio');
