import { createEngine } from './engine.js';
import { speak, initAudio } from './speech.js';
import './style.css';

const numCommandsInput = document.getElementById('numCommands');
const intervalInput = document.getElementById('interval');
const maxDriftInput = document.getElementById('maxDrift');
const playBtn = document.getElementById('playBtn');
const moveDisplay = document.getElementById('moveDisplay');
const counter = document.getElementById('counter');
const track = document.getElementById('track');

let engine = createEngine(parseInt(maxDriftInput.value));
let running = false;
let abortController = null;

function buildTrack(maxDrift) {
  track.innerHTML = '';
  const totalSlots = maxDrift * 2 + 1;

  for (let i = -maxDrift; i <= maxDrift; i++) {
    const marker = document.createElement('div');
    marker.className = 'track-marker' + (i === 0 ? ' origin' : '');
    marker.style.left = `${((i + maxDrift) / (totalSlots - 1)) * 100}%`;
    track.appendChild(marker);
  }

  const dot = document.createElement('div');
  dot.className = 'track-dot';
  dot.id = 'dot';
  track.appendChild(dot);

  updateDot(maxDrift);
}

function updateDot(maxDrift) {
  const dot = document.getElementById('dot');
  if (!dot) return;
  const { position, facing } = engine.getState();
  const totalSlots = maxDrift * 2 + 1;
  const leftPct = ((position + maxDrift) / (totalSlots - 1)) * 100;
  const widthPct = (1 / (totalSlots - 1)) * 100;
  dot.style.left = `${leftPct}%`;
  dot.style.width = `${widthPct}%`;
  dot.textContent = facing === 1 ? '→' : '←';
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

async function run() {
  const numCommands = parseInt(numCommandsInput.value);
  const interval = parseFloat(intervalInput.value) * 1000;
  const maxDrift = parseInt(maxDriftInput.value);

  await initAudio();

  engine = createEngine(maxDrift);
  buildTrack(maxDrift);

  running = true;
  abortController = new AbortController();
  const { signal } = abortController;

  playBtn.textContent = 'Stop';
  playBtn.classList.add('running');
  numCommandsInput.disabled = true;
  intervalInput.disabled = true;
  maxDriftInput.disabled = true;

  try {
    for (let i = 0; i < numCommands; i++) {
      if (signal.aborted) break;

      const move = engine.getNextMove();
      moveDisplay.textContent = move;
      counter.textContent = `${i + 1} / ${numCommands}`;
      updateDot(maxDrift);

      await speak(move);

      if (i < numCommands - 1) {
        await sleep(interval, signal);
      }
    }
  } catch (e) {
    if (e.name !== 'AbortError') throw e;
  }

  stop();
}

function stop() {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  running = false;
  playBtn.textContent = 'Play';
  playBtn.classList.remove('running');
  numCommandsInput.disabled = false;
  intervalInput.disabled = false;
  maxDriftInput.disabled = false;
}

playBtn.addEventListener('click', () => {
  if (running) {
    stop();
  } else {
    run();
  }
});

// Initialize track on load and when max drift changes
buildTrack(parseInt(maxDriftInput.value));
maxDriftInput.addEventListener('change', () => {
  const maxDrift = parseInt(maxDriftInput.value);
  engine = createEngine(maxDrift);
  buildTrack(maxDrift);
  moveDisplay.textContent = '';
  counter.textContent = '';
});
