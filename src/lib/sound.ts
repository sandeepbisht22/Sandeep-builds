"use client";

import type { ChapterId } from "./chapters";

/**
 * The room's beat, synthesised live with Web Audio (no recorded music): an 86 BPM boom-bap
 * loop whose layers remix per chapter, plus a few small sound effects for the games.
 */

type Layer = "drums" | "bass" | "keys" | "crowd" | "air";
export type Sfx = "tick" | "kick" | "cheer" | "bat" | "stumps";

const BPM = 86;
const SIXTEENTH = 60 / BPM / 4;
const LOOKAHEAD = 0.12;

const MIX: Record<ChapterId, Record<Layer, number>> = {
  room: { drums: 0.7, bass: 0.6, keys: 0.6, crowd: 0, air: 0 },
  desk: { drums: 0.75, bass: 0.7, keys: 0.55, crowd: 0, air: 0 },
  wall: { drums: 0.55, bass: 0.55, keys: 0.8, crowd: 0, air: 0 },
  kit: { drums: 0.85, bass: 0.65, keys: 0.35, crowd: 0.55, air: 0 },
  turntable: { drums: 1, bass: 1, keys: 0.65, crowd: 0, air: 0 },
  shelf: { drums: 0.3, bass: 0.45, keys: 0.9, crowd: 0, air: 0 },
  window: { drums: 0.25, bass: 0.35, keys: 0.7, crowd: 0, air: 0.6 },
};

// Am7, Fmaj7, Cmaj7, G6 — one chord per bar.
const CHORDS = [
  [220, 261.63, 329.63, 392],
  [174.61, 220, 261.63, 329.63],
  [261.63, 329.63, 392, 493.88],
  [196, 246.94, 293.66, 329.63],
];
const BASS = [55, 43.65, 65.41, 49];
const KICKS = new Set([0, 7, 10]);
const SNARES = new Set([4, 12]);

interface Graph {
  ctx: AudioContext;
  master: GainNode;
  analyser: AnalyserNode;
  layers: Record<Layer, GainNode>;
  noise: AudioBuffer;
}

let graph: Graph | null = null;
let timer: number | null = null;
let step = 0;
let nextTime = 0;
let chapter: ChapterId = "room";

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function envelope(ctx: AudioContext, target: AudioNode, at: number, peak: number, attack: number, release: number): GainNode {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + release);
  gain.connect(target);
  return gain;
}

function noise(g: Graph, at: number, duration: number, filter: BiquadFilterType, freq: number, peak: number, out: AudioNode): void {
  const source = g.ctx.createBufferSource();
  source.buffer = g.noise;
  const biquad = g.ctx.createBiquadFilter();
  biquad.type = filter;
  biquad.frequency.value = freq;
  source.connect(biquad);
  biquad.connect(envelope(g.ctx, out, at, peak, 0.003, duration));
  source.start(at, Math.random());
  source.stop(at + duration + 0.05);
}

function tone(g: Graph, at: number, type: OscillatorType, from: number, to: number, peak: number, attack: number, release: number, out: AudioNode): void {
  const osc = g.ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, at + attack + release * 0.6);
  osc.connect(envelope(g.ctx, out, at, peak, attack, release));
  osc.start(at);
  osc.stop(at + attack + release + 0.05);
}

function schedule(g: Graph, index: number, at: number): void {
  const inBar = index % 16;
  const bar = Math.floor(index / 16) % 4;
  const swing = inBar % 2 === 1 ? SIXTEENTH * 0.18 : 0;
  const { drums, bass, keys } = g.layers;
  if (KICKS.has(inBar)) tone(g, at, "sine", 140, 42, 0.9, 0.004, 0.32, drums);
  if (SNARES.has(inBar)) {
    noise(g, at, 0.16, "bandpass", 1900, 0.5, drums);
    tone(g, at, "triangle", 210, 170, 0.25, 0.002, 0.1, drums);
  }
  if (inBar % 2 === 0) noise(g, at + swing, inBar === 14 ? 0.18 : 0.04, "highpass", 7600, 0.16, drums);
  if (inBar === 0 || inBar === 10) tone(g, at, "triangle", BASS[bar], BASS[bar], 0.5, 0.01, inBar === 0 ? 0.9 : 0.4, bass);
  if (inBar === 0) {
    const filter = g.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1100;
    filter.connect(keys);
    CHORDS[bar].forEach((freq, i) => {
      tone(g, at + i * 0.012, "sawtooth", freq, freq, 0.045, 0.06, 2.2, filter);
      tone(g, at + i * 0.012, "triangle", freq * 1.003, freq * 1.003, 0.05, 0.06, 2.2, filter);
    });
  }
  if (Math.random() < 0.35) noise(g, at + Math.random() * SIXTEENTH, 0.012, "highpass", 3000, 0.05, keys);
}

function bed(g: Graph, layer: Layer, filter: BiquadFilterType, freq: number): void {
  const source = g.ctx.createBufferSource();
  source.buffer = g.noise;
  source.loop = true;
  const biquad = g.ctx.createBiquadFilter();
  biquad.type = filter;
  biquad.frequency.value = freq;
  biquad.Q.value = 0.6;
  const gain = g.ctx.createGain();
  gain.gain.value = 0.18;
  const lfo = g.ctx.createOscillator();
  const depth = g.ctx.createGain();
  lfo.frequency.value = layer === "air" ? 0.08 : 0.3;
  depth.gain.value = 0.08;
  lfo.connect(depth);
  depth.connect(gain.gain);
  source.connect(biquad);
  biquad.connect(gain);
  gain.connect(g.layers[layer]);
  source.start();
  lfo.start();
}

function build(): Graph {
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0;
  const compressor = ctx.createDynamicsCompressor();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 128;
  master.connect(compressor);
  compressor.connect(analyser);
  analyser.connect(ctx.destination);
  const layer = (): GainNode => {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(master);
    return gain;
  };
  const g: Graph = {
    ctx,
    master,
    analyser,
    noise: noiseBuffer(ctx),
    layers: { drums: layer(), bass: layer(), keys: layer(), crowd: layer(), air: layer() },
  };
  bed(g, "crowd", "bandpass", 700);
  bed(g, "air", "lowpass", 420);
  return g;
}

function applyMix(g: Graph): void {
  const mix = MIX[chapter];
  (Object.keys(mix) as Layer[]).forEach((layer) => {
    g.layers[layer].gain.setTargetAtTime(mix[layer], g.ctx.currentTime, 0.6);
  });
}

export async function startSound(): Promise<boolean> {
  try {
    graph ??= build();
    const g = graph;
    await g.ctx.resume();
    g.master.gain.setTargetAtTime(0.7, g.ctx.currentTime, 0.3);
    applyMix(g);
    if (timer === null) {
      nextTime = g.ctx.currentTime + 0.05;
      timer = window.setInterval(() => {
        while (nextTime < g.ctx.currentTime + LOOKAHEAD) {
          schedule(g, step, nextTime);
          nextTime += SIXTEENTH;
          step = (step + 1) % 64;
        }
      }, 25);
    }
    return true;
  } catch {
    return false;
  }
}

export function stopSound(): void {
  if (!graph) return;
  const g = graph;
  g.master.gain.setTargetAtTime(0, g.ctx.currentTime, 0.15);
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  window.setTimeout(() => {
    if (timer === null) void g.ctx.suspend();
  }, 600);
}

export function setSoundChapter(id: ChapterId): void {
  chapter = id;
  if (graph && timer !== null) applyMix(graph);
}

export function getAnalyser(): AnalyserNode | null {
  return timer === null ? null : (graph?.analyser ?? null);
}

/** One-shot effects; silent unless the beat is playing. */
export function playSfx(name: Sfx): void {
  if (!graph || timer === null) return;
  const g = graph;
  const at = g.ctx.currentTime + 0.01;
  const out = g.master;
  if (name === "tick") tone(g, at, "sine", 1800, 1800, 0.05, 0.002, 0.03, out);
  if (name === "kick") tone(g, at, "sine", 120, 60, 0.6, 0.003, 0.14, out);
  if (name === "bat") {
    noise(g, at, 0.05, "highpass", 2500, 0.4, out);
    tone(g, at, "triangle", 900, 700, 0.3, 0.002, 0.08, out);
  }
  if (name === "stumps") {
    tone(g, at, "square", 520, 380, 0.12, 0.002, 0.1, out);
    tone(g, at + 0.07, "square", 610, 420, 0.1, 0.002, 0.1, out);
  }
  if (name === "cheer") noise(g, at, 1.4, "bandpass", 1000, 0.35, out);
}
