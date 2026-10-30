"use strict";
// Locally stored, synthetic Portuguese performances. No speech-service calls at runtime.
window.GameVoices = (() => {
  let context = null,
    source = null,
    gain = null,
    key = null,
    offset = 0,
    started = 0,
    paused = false,
    muted = false,
    ticket = 0,
    error = null;
  const buffers = new Map(),
    loading = new Map();
  const roles = {
    rick: "rick",
    morty: "morty",
    "rick-miss": "rick",
    spamton: "spamton",
    locked: "spamton",
  };
  async function load(name) {
    if (buffers.has(name)) return buffers.get(name);
    if (!context) return null;
    if (!loading.has(name))
      loading.set(
        name,
        fetch(`audio/${name}.ogg`)
          .then((r) => {
            if (!r.ok) throw Error("Audio " + name + ": " + r.status);
            return r.arrayBuffer();
          })
          .then((b) => context.decodeAudioData(b))
          .then((b) => {
            buffers.set(name, b);
            return b;
          })
          .catch((e) => {
            error = String(e);
            return null;
          }),
      );
    return loading.get(name);
  }
  function halt() {
    if (source) {
      source.onended = null;
      try {
        source.stop();
      } catch {}
      source.disconnect();
      source = null;
    }
  }
  function begin(buffer) {
    if (!buffer || paused || !context) return;
    halt();
    source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    started = context.currentTime;
    source.onended = () => {
      source = null;
      key = null;
      offset = 0;
    };
    source.start(0, Math.min(offset, Math.max(0, buffer.duration - 0.01)));
  }
  return {
    attach(ctx) {
      context = ctx;
      if (!gain) {
        gain = context.createGain();
        gain.gain.value = muted ? 0 : 0.9;
        gain.connect(context.destination);
      }
      for (const name of [
        "script",
        "city",
        "snow",
        "blocks",
        "obby",
        "rick",
        "rick-miss",
        "morty",
        "spamton",
        "locked",
      ])
        load(name);
    },
    async play(name) {
      const id = ++ticket;
      halt();
      key = name;
      offset = 0;
      const buffer = await load(name);
      if (id !== ticket) return;
      begin(buffer);
    },
    stop() {
      ticket++;
      halt();
      key = null;
      offset = 0;
    },
    sync(isPaused, isMuted) {
      muted = isMuted;
      if (gain) gain.gain.value = muted ? 0 : 0.9;
      if (paused === isPaused) return;
      paused = isPaused;
      if (paused && source) {
        offset += context.currentTime - started;
        halt();
      } else if (!paused && key) {
        const resumeKey = key,
          resumeTicket = ticket;
        load(resumeKey).then((buffer) => {
          if (
            key === resumeKey &&
            ticket === resumeTicket &&
            !paused &&
            !source &&
            buffer
          )
            begin(buffer);
        });
      }
    },
    speaker() {
      return source && !muted && !paused ? roles[key] || "narrator" : null;
    },
    status() {
      return {
        key,
        playing: !!source,
        paused,
        muted,
        loaded: buffers.size,
        error,
      };
    },
  };
})();
