/**
 * Procedural Web Audio API sound synthesizer for arcade racing
 * Completely offline, zero external audio asset dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private nitroGain: GainNode | null = null;
  private musicInterval: number | null = null;
  private isMusicPlaying = false;

  public sfxVolume = 0.8;
  public musicVolume = 0.5;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startEngine() {
    this.initContext();
    if (!this.ctx || this.engineOsc1) return;

    try {
      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineFilter = this.ctx.createBiquadFilter();

      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = 'triangle';

      this.engineOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1
      this.engineOsc2.frequency.setValueAtTime(56.5, this.ctx.currentTime);

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.08 * this.sfxVolume, this.ctx.currentTime);

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc1.start();
      this.engineOsc2.start();
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public updateEnginePitch(speedRatio: number, isAccelerating: boolean) {
    if (!this.ctx || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter || !this.engineGain) return;

    const targetFreq = 45 + speedRatio * 180 + (isAccelerating ? 25 : 0);
    const targetFilter = 280 + speedRatio * 750;
    const targetGain = (0.04 + speedRatio * 0.12) * this.sfxVolume;

    const time = this.ctx.currentTime;
    this.engineOsc1.frequency.setTargetAtTime(targetFreq, time, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(targetFreq * 1.02, time, 0.08);
    this.engineFilter.frequency.setTargetAtTime(targetFilter, time, 0.08);
    this.engineGain.gain.setTargetAtTime(targetGain, time, 0.08);
  }

  public stopEngine() {
    if (this.engineOsc1) {
      try {
        this.engineOsc1.stop();
        this.engineOsc2?.stop();
        this.engineOsc1.disconnect();
        this.engineOsc2?.disconnect();
      } catch {}
      this.engineOsc1 = null;
      this.engineOsc2 = null;
    }
  }

  public playNitro(active: boolean) {
    this.initContext();
    if (!this.ctx) return;

    if (active && !this.nitroGain) {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 1.5;

      this.nitroGain = this.ctx.createGain();
      this.nitroGain.gain.setValueAtTime(0.18 * this.sfxVolume, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.nitroGain);
      this.nitroGain.connect(this.ctx.destination);
      noise.start();
    } else if (!active && this.nitroGain) {
      this.nitroGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      setTimeout(() => {
        this.nitroGain?.disconnect();
        this.nitroGain = null;
      }, 100);
    }
  }

  public playCrash() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.45);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);

    // Noise burst for metal crunch
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.3);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35 * this.sfxVolume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    noiseSource.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noiseSource.start(now);
  }

  public playNearMiss() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.18); // A6

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playCountdownBeep(highPitch: boolean) {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(highPitch ? 1046.5 : 523.25, now);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (highPitch ? 0.4 : 0.2));

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + (highPitch ? 0.4 : 0.2));
  }

  public playButtonClick() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public startArcadeMusic() {
    this.initContext();
    if (this.isMusicPlaying || !this.ctx) return;
    this.isMusicPlaying = true;

    // A driving bassline pattern
    const notes = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
    let step = 0;

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.isMusicPlaying || this.musicVolume <= 0) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        const freq = notes[step % notes.length];
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.12);

        gain.gain.setValueAtTime(0.08 * this.musicVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);

        step++;
      } catch {}
    }, 140);
  }

  public stopArcadeMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
