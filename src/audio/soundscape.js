(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EchoesSoundscape = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function createSoundscape() {
    let ctx = null;
    let muted = false;
    let activeAmbient = null;
    let pianoTimer = null;

    function ensureContext() {
      if (muted) return null;
      if (!ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          ctx = new AudioCtx();
        }
      }
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(function () {});
      }
      return ctx;
    }

    function stopAmbient() {
      if (activeAmbient) {
        try {
          if (activeAmbient.stop) activeAmbient.stop();
        } catch (_e) {}
        activeAmbient = null;
      }
      if (pianoTimer) {
        clearInterval(pianoTimer);
        pianoTimer = null;
      }
    }

    function createNoiseBuffer(audioCtx, seconds) {
      const length = Math.floor(audioCtx.sampleRate * seconds);
      const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.025 * white) / 1.025;
        lastOut = data[i];
      }
      return buffer;
    }

    function playAmbient(mode) {
      stopAmbient();
      if (muted || mode === 'none') return;
      const audioCtx = ensureContext();
      if (!audioCtx) return;

      if (mode === 'wind' || mode === 'aachen_walk') {
        const src = audioCtx.createBufferSource();
        src.buffer = createNoiseBuffer(audioCtx, 3);
        src.loop = true;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = mode === 'wind' ? 420 : 280;
        filter.Q.value = 1.4;

        const gain = audioCtx.createGain();
        gain.gain.value = mode === 'wind' ? 0.09 : 0.045;

        src.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        src.start();
        activeAmbient = {
          stop: function () {
            src.stop();
            src.disconnect();
          }
        };
      } else if (mode === 'engine' || mode === 'spark') {
        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 56;

        const sub = audioCtx.createOscillator();
        sub.type = 'triangle';
        sub.frequency.value = 112;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = mode === 'spark' ? 240 : 170;

        const gain = audioCtx.createGain();
        gain.gain.value = 0.045;

        osc.connect(filter);
        sub.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        sub.start();

        activeAmbient = {
          stop: function () {
            osc.stop();
            sub.stop();
            osc.disconnect();
            sub.disconnect();
          }
        };
      }
    }

    function playSparkSfx() {
      if (muted) return;
      const audioCtx = ensureContext();
      if (!audioCtx) return;
      const src = audioCtx.createBufferSource();
      src.buffer = createNoiseBuffer(audioCtx, 0.32);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1600;

      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      src.start();
      src.stop(now + 0.31);
    }

    function playLopLopSteps() {
      if (muted) return;
      const audioCtx = ensureContext();
      if (!audioCtx) return;
      [0, 0.36, 0.72].forEach(function (offset) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime + offset;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(68, now + 0.09);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      });
    }

    function playNote(audioCtx, freq, duration, volume) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    }

    function toggleWarsawConcerto(enable) {
      if (pianoTimer) {
        clearInterval(pianoTimer);
        pianoTimer = null;
      }
      if (!enable || muted) return;
      const audioCtx = ensureContext();
      if (!audioCtx) return;

      // Motif arpeggio romantik bernuansa konserto piano klasik tahun 1940-an/1950-an
      const motif = [261.63, 311.13, 392.0, 523.25, 466.16, 392.0, 349.23, 392.0];
      let idx = 0;
      playNote(audioCtx, motif[0], 0.9, 0.06);
      idx = 1;
      pianoTimer = setInterval(function () {
        if (muted) return;
        playNote(audioCtx, motif[idx % motif.length], 0.85, 0.055);
        idx += 1;
      }, 480);
    }

    function setMuted(nextMuted) {
      muted = Boolean(nextMuted);
      if (muted) {
        stopAmbient();
      }
      return muted;
    }

    function isMuted() {
      return muted;
    }

    return {
      playAmbient: playAmbient,
      stopAmbient: stopAmbient,
      playSparkSfx: playSparkSfx,
      playLopLopSteps: playLopLopSteps,
      toggleWarsawConcerto: toggleWarsawConcerto,
      setMuted: setMuted,
      isMuted: isMuted
    };
  }

  return {
    createSoundscape: createSoundscape
  };
}));
