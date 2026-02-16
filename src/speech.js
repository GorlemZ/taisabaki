const base = import.meta.env.BASE_URL;

let ctx;
const buffers = {};
const MOVES = ['irimi', 'tenshin', 'tenkan', 'kaiten'];

async function loadBuffer(move) {
  const res = await fetch(`${base}audio/${move}.mp3`);
  const data = await res.arrayBuffer();
  buffers[move] = await ctx.decodeAudioData(data);
}

export async function initAudio() {
  ctx = new AudioContext();
  await Promise.all(MOVES.map(loadBuffer));
}

export function speak(move) {
  const buffer = buffers[move];
  if (!buffer || !ctx) return Promise.resolve();

  return new Promise((resolve) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = resolve;
    source.start();
  });
}
