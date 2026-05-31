/**
 * Generates short placeholder WAV sound effects + a gentle music loop so audio
 * is functional before real assets are added. Replace these with produced audio
 * before release. Run: npm run assets:sounds
 *
 * Implemented with only Node built-ins — synthesizes 16-bit mono PCM WAVs.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'src/assets/sounds');
const SAMPLE_RATE = 44100;

function toWav(samples) {
  const length = samples.length;
  const buffer = Buffer.alloc(44 + length * 2);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + length * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(length * 2, 40);
  for (let i = 0; i < length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }
  return buffer;
}

function tone({ freqs, duration, gain = 0.3, attack = 0.005, release = 0.05 }) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / SAMPLE_RATE;
    let v = 0;
    for (const f of freqs) v += Math.sin(2 * Math.PI * f * t);
    v /= freqs.length;
    let env = 1;
    if (t < attack) env = t / attack;
    else if (t > duration - release) env = Math.max(0, (duration - t) / release);
    out[i] = v * env * gain;
  }
  return out;
}

function sequence(notes) {
  const parts = notes.map(tone);
  const total = parts.reduce((sum, p) => sum + p.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

const A4 = 440;
const C5 = 523;
const E5 = 659;
const G5 = 784;
const C6 = 1046;
const F4 = 349;
const C4 = 262;

const sounds = {
  button: tone({ freqs: [A4], duration: 0.06, gain: 0.22 }),
  rotate: tone({ freqs: [E5], duration: 0.05, gain: 0.2 }),
  place: tone({ freqs: [C4], duration: 0.07, gain: 0.22 }),
  star: tone({ freqs: [C6], duration: 0.12, gain: 0.22 }),
  victory: sequence([
    { freqs: [C5], duration: 0.12, gain: 0.25 },
    { freqs: [E5], duration: 0.12, gain: 0.25 },
    { freqs: [G5], duration: 0.12, gain: 0.25 },
    { freqs: [C6], duration: 0.22, gain: 0.25 },
  ]),
  failure: sequence([
    { freqs: [A4], duration: 0.14, gain: 0.24 },
    { freqs: [F4], duration: 0.14, gain: 0.24 },
    { freqs: [C4], duration: 0.24, gain: 0.24 },
  ]),
  // Gentle, low-volume loop pad.
  music: sequence(
    [A4, C5, E5, C5, F4, A4, C5, A4].map((f) => ({
      freqs: [f],
      duration: 0.4,
      gain: 0.1,
      attack: 0.02,
      release: 0.12,
    })),
  ),
};

mkdirSync(OUT_DIR, { recursive: true });
for (const [name, samples] of Object.entries(sounds)) {
  const path = join(OUT_DIR, `${name}.wav`);
  writeFileSync(path, toWav(samples));
  // eslint-disable-next-line no-console
  console.log(`wrote src/assets/sounds/${name}.wav (${(samples.length / SAMPLE_RATE).toFixed(2)}s)`);
}
