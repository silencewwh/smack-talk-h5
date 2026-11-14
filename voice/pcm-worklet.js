class SmackTalkVoicePCM extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(4096);
    this.offset = 0;
    this.port.onmessage = event => {
      this.recognizerId = event.data.recognizerId;
      this.target = event.data.port;
    };
  }

  process(inputs) {
    const samples = inputs[0]?.[0];
    if (!samples || !this.target) return true;
    for (const sample of samples) {
      // Vosk's direct worker protocol takes signed 16-bit amplitudes in Float32Array.
      this.buffer[this.offset++] = sample * 0x8000;
      if (this.offset === this.buffer.length) {
        this.target.postMessage({ action: 'audioChunk', recognizerId: this.recognizerId,
          sampleRate, data: this.buffer }, [this.buffer.buffer]);
        this.buffer = new Float32Array(4096);
        this.offset = 0;
      }
    }
    return true;
  }
}
registerProcessor('smacktalk-voice-pcm', SmackTalkVoicePCM);
