export class NeuroacousticSynth {
  private ctx: AudioContext | null = null;
  private mainGain: GainNode | null = null;
  private activeNodes: AudioNode[] = [];
  private intervalId: any = null;
  private secondaryIntervalId: any = null;
  private timeouts: any[] = [];
  private category: string = '';
  private currentVolume: number = 0.6; // 0 to 1

  constructor() {}

  private initContext() {
    if (!this.ctx) {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public start(category: string, volume: number) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.category = category;
    this.currentVolume = volume;

    // Create main gain
    this.mainGain = this.ctx.createGain();
    this.mainGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    this.mainGain.connect(this.ctx.destination);

    if (category === 'Respiración') {
      this.playBreathingGuide();
    } else if (category === 'Meditación' || category === 'Apertura') {
      this.playMeditationDrone();
    } else if (category === 'Conexión') {
      this.playConnectionPads();
    } else if (category === 'Reflexión') {
      this.playContemplativePiano();
    } else if (category === 'Liberación') {
      this.playLiberationRelease();
    } else {
      this.playDefaultDrone();
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.mainGain && this.ctx) {
      this.mainGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.2);
    }
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.secondaryIntervalId) {
      clearTimeout(this.secondaryIntervalId);
      this.secondaryIntervalId = null;
    }
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];

    this.activeNodes.forEach(node => {
      try {
        // @ts-ignore
        if (node.stop) node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
    if (this.mainGain) {
      try {
        this.mainGain.disconnect();
      } catch (e) {}
      this.mainGain = null;
    }
  }

  // --- Breath Guide (Inhale/Exhale swell) ---
  private playBreathingGuide() {
    if (!this.ctx || !this.mainGain) return;

    // Pinkish/brownish noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);
    filter.Q.setValueAtTime(4, this.ctx.currentTime);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.mainGain);
    noise.start();
    this.activeNodes.push(noise);

    // Deep sine hum
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    osc.connect(oscGain);
    oscGain.connect(this.mainGain);
    osc.start();
    this.activeNodes.push(osc);

    const runBreathCycle = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      
      // Inhale 4s: filter rises, noise volume rises
      filter.frequency.setValueAtTime(250, t);
      filter.frequency.exponentialRampToValueAtTime(750, t + 4);
      noiseGain.gain.setValueAtTime(0.01, t);
      noiseGain.gain.linearRampToValueAtTime(0.15, t + 4);

      // Hold 2s
      filter.frequency.setValueAtTime(750, t + 4);
      filter.frequency.setValueAtTime(750, t + 6);
      noiseGain.gain.setValueAtTime(0.15, t + 4);
      noiseGain.gain.setValueAtTime(0.15, t + 6);

      // Exhale 4s: filter and volume decrease
      filter.frequency.exponentialRampToValueAtTime(220, t + 10);
      noiseGain.gain.linearRampToValueAtTime(0.005, t + 10);

      // Hold 2s
      filter.frequency.setValueAtTime(220, t + 10);
      filter.frequency.setValueAtTime(220, t + 12);
      noiseGain.gain.setValueAtTime(0.005, t + 10);
      noiseGain.gain.setValueAtTime(0.005, t + 12);
    };

    runBreathCycle();
    this.intervalId = setInterval(runBreathCycle, 12000);
  }

  // --- Meditation / Ceremonial Drone ---
  private playMeditationDrone() {
    if (!this.ctx || !this.mainGain) return;

    // Binaural beating waves for theta states
    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(108, this.ctx.currentTime);
    const gainL = this.ctx.createGain();
    gainL.gain.setValueAtTime(0.25, this.ctx.currentTime);
    oscL.connect(gainL);

    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(112.5, this.ctx.currentTime); // 4.5Hz binaural beat (theta)
    const gainR = this.ctx.createGain();
    gainR.gain.setValueAtTime(0.25, this.ctx.currentTime);
    oscR.connect(gainR);

    const pannerL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const pannerR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    if (pannerL && pannerR) {
      pannerL.pan.setValueAtTime(-1, this.ctx.currentTime);
      pannerR.pan.setValueAtTime(1, this.ctx.currentTime);
      gainL.connect(pannerL);
      gainR.connect(pannerR);
      pannerL.connect(this.mainGain);
      pannerR.connect(this.mainGain);
    } else {
      gainL.connect(this.mainGain);
      gainR.connect(this.mainGain);
    }

    oscL.start();
    oscR.start();
    this.activeNodes.push(oscL, oscR);

    // Sweeping high harmonic
    const sweepOsc = this.ctx.createOscillator();
    sweepOsc.type = 'triangle';
    sweepOsc.frequency.setValueAtTime(216, this.ctx.currentTime);

    const sweepFilter = this.ctx.createBiquadFilter();
    sweepFilter.type = 'lowpass';
    sweepFilter.frequency.setValueAtTime(250, this.ctx.currentTime);
    sweepFilter.Q.setValueAtTime(4, this.ctx.currentTime);

    const sweepGain = this.ctx.createGain();
    sweepGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    sweepOsc.connect(sweepFilter);
    sweepFilter.connect(sweepGain);
    sweepGain.connect(this.mainGain);
    sweepOsc.start();
    this.activeNodes.push(sweepOsc);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.04, this.ctx.currentTime); // slow LFO
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(150, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(sweepFilter.frequency);
    lfo.start();
    this.activeNodes.push(lfo);

    // Play a tibetan bell sound
    const playTibetanBell = () => {
      if (!this.ctx || !this.mainGain) return;
      const t = this.ctx.currentTime;
      const bellFreqs = [285, 330, 440, 528];
      const freq = bellFreqs[Math.floor(Math.random() * bellFreqs.length)];

      const bell = this.ctx.createOscillator();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(freq, t);

      const ring1 = this.ctx.createOscillator();
      ring1.type = 'sine';
      ring1.frequency.setValueAtTime(freq * 1.5, t);

      const ring2 = this.ctx.createOscillator();
      ring2.type = 'sine';
      ring2.frequency.setValueAtTime(freq * 2.02, t);

      const bGain = this.ctx.createGain();
      bGain.gain.setValueAtTime(0, t);
      bGain.gain.linearRampToValueAtTime(0.1, t + 0.05);
      bGain.gain.exponentialRampToValueAtTime(0.001, t + 10);

      bell.connect(bGain);
      ring1.connect(bGain);
      ring2.connect(bGain);
      bGain.connect(this.mainGain);

      bell.start(t);
      ring1.start(t);
      ring2.start(t);

      bell.stop(t + 11);
      ring1.stop(t + 11);
      ring2.stop(t + 11);

      this.activeNodes.push(bell, ring1, ring2, bGain);

      const cleanTimeout = setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n !== bell && n !== ring1 && n !== ring2 && n !== bGain);
      }, 11000);
      this.timeouts.push(cleanTimeout);
    };

    playTibetanBell();
    this.intervalId = setInterval(playTibetanBell, 16000);
  }

  // --- Connection Pads (Soft minor/major 9ths) ---
  private playConnectionPads() {
    if (!this.ctx || !this.mainGain) return;

    const rootOsc = this.ctx.createOscillator();
    rootOsc.type = 'sine';
    rootOsc.frequency.setValueAtTime(110.00, this.ctx.currentTime); // A2 hum
    const rootGain = this.ctx.createGain();
    rootGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    rootOsc.connect(rootGain);
    rootGain.connect(this.mainGain);
    rootOsc.start();
    this.activeNodes.push(rootOsc);

    const pad1 = this.ctx.createOscillator();
    const pad2 = this.ctx.createOscillator();
    const pad3 = this.ctx.createOscillator();
    pad1.type = 'sine';
    pad2.type = 'sine';
    pad3.type = 'sine';

    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    pad1.connect(padGain);
    pad2.connect(padGain);
    pad3.connect(padGain);
    padGain.connect(this.mainGain);

    pad1.start();
    pad2.start();
    pad3.start();
    this.activeNodes.push(pad1, pad2, pad3);

    const chords = [
      [220.00, 261.63, 329.63], // Am
      [261.63, 329.63, 392.00], // C Maj
      [220.00, 293.66, 349.23], // Dm7
      [196.00, 246.94, 293.66]  // G Maj
    ];

    let chordIdx = 0;

    const changeChord = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const notes = chords[chordIdx];

      // Crossfade
      padGain.gain.setValueAtTime(0.06, t);
      padGain.gain.linearRampToValueAtTime(0.002, t + 2);

      const pTimeout = setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        pad1.frequency.setValueAtTime(notes[0], now);
        pad2.frequency.setValueAtTime(notes[1], now);
        pad3.frequency.setValueAtTime(notes[2], now);
        padGain.gain.linearRampToValueAtTime(0.06, now + 3.5);
      }, 2200);
      this.timeouts.push(pTimeout);

      chordIdx = (chordIdx + 1) % chords.length;
    };

    changeChord();
    this.intervalId = setInterval(changeChord, 9000);
  }

  // --- Contemplative Piano (Reflexión) ---
  private playContemplativePiano() {
    if (!this.ctx || !this.mainGain) return;

    const drone = this.ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.setValueAtTime(130.81, this.ctx.currentTime); // C3 hum
    const dGain = this.ctx.createGain();
    dGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    drone.connect(dGain);
    dGain.connect(this.mainGain);
    drone.start();
    this.activeNodes.push(drone);

    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // Pentatonic

    const playNote = () => {
      if (!this.ctx || !this.mainGain) return;
      const t = this.ctx.currentTime;
      const f = scale[Math.floor(Math.random() * scale.length)];

      const note = this.ctx.createOscillator();
      note.type = 'sine';
      note.frequency.setValueAtTime(f, t);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, t);

      const nGain = this.ctx.createGain();
      nGain.gain.setValueAtTime(0, t);
      nGain.gain.linearRampToValueAtTime(0.07, t + 0.02);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 6);

      note.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.mainGain);

      note.start(t);
      note.stop(t + 7);

      this.activeNodes.push(note, filter, nGain);
      const noteTimeout = setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n !== note && n !== filter && n !== nGain);
      }, 7000);
      this.timeouts.push(noteTimeout);
    };

    playNote();

    const loopRunner = () => {
      playNote();
      const delay = 3200 + Math.random() * 2800;
      this.secondaryIntervalId = setTimeout(loopRunner, delay);
    };
    this.secondaryIntervalId = setTimeout(loopRunner, 4000);
  }

  // --- Liberation (Rising and falling filter sweeps) ---
  private playLiberationRelease() {
    if (!this.ctx || !this.mainGain) return;

    const sweepOsc = this.ctx.createOscillator();
    sweepOsc.type = 'sawtooth';
    sweepOsc.frequency.setValueAtTime(110.00, this.ctx.currentTime); // A2

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, this.ctx.currentTime);
    filter.Q.setValueAtTime(5, this.ctx.currentTime);

    const sGain = this.ctx.createGain();
    sGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    sweepOsc.connect(filter);
    filter.connect(sGain);
    sGain.connect(this.mainGain);
    sweepOsc.start();
    this.activeNodes.push(sweepOsc);

    const sweepCycles = () => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // tension
      filter.frequency.setValueAtTime(180, t);
      filter.frequency.exponentialRampToValueAtTime(750, t + 6);
      sGain.gain.setValueAtTime(0.04, t);
      sGain.gain.linearRampToValueAtTime(0.1, t + 6);
      // release
      filter.frequency.exponentialRampToValueAtTime(140, t + 14);
      sGain.gain.linearRampToValueAtTime(0.015, t + 14);
    };

    sweepCycles();
    this.intervalId = setInterval(sweepCycles, 15000);
  }

  // --- Default Warm Ambient Drone ---
  private playDefaultDrone() {
    if (!this.ctx || !this.mainGain) return;

    const root = this.ctx.createOscillator();
    root.type = 'sine';
    root.frequency.setValueAtTime(146.83, this.ctx.currentTime); // D3

    const third = this.ctx.createOscillator();
    third.type = 'sine';
    third.frequency.setValueAtTime(185.00, this.ctx.currentTime); // F#3

    const fifth = this.ctx.createOscillator();
    fifth.type = 'sine';
    fifth.frequency.setValueAtTime(220.00, this.ctx.currentTime); // A3

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    root.connect(gain);
    third.connect(gain);
    fifth.connect(gain);
    gain.connect(this.mainGain);

    root.start();
    third.start();
    fifth.start();
    this.activeNodes.push(root, third, fifth);
  }
}
