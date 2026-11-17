export function chooseVoice(voices, language) {
  const pattern = language === 'id' ? /^(id|in)(-|_|$)/i : /^en(-|_|$)/i;
  const choices = voices.filter(v => pattern.test(v.lang || ''));
  return choices.find(v => v.localService) || choices[0] || null;
}

export function splitSpeech(text, maxLength = 210) {
  const sentences = String(text).match(/[^.!?]+[.!?]+|[^.!?]+$/gu) || [];
  const pieces = [];
  for (const sentence of sentences) {
    let rest = sentence.trim();
    while (rest.length > maxLength) {
      let end = rest.lastIndexOf(' ', maxLength);
      if (end < 30) end = maxLength;
      pieces.push(rest.slice(0, end).trim());
      rest = rest.slice(end).trim();
    }
    if (rest) pieces.push(rest);
  }
  return pieces;
}

export class SpeechController {
  constructor({ synth, Utterance, onChange = () => {}, onNotice = () => {} }) {
    this.synth = synth;
    this.Utterance = Utterance;
    this.onChange = onChange;
    this.onNotice = onNotice;
    this.state = 'idle';
    this.token = 0;
    this.index = 0;
    this.chunks = [];
    this.key = null;
    this.current = null;
    this.lastBoundary = 0;
  }
  publish() {
    this.onChange({ state: this.state, key: this.key, label: this.label, index: this.index, total: this.chunks.length });
  }
  async availableVoice(language, token) {
    const immediate = chooseVoice(this.synth.getVoices(), language);
    if (immediate) return immediate;
    return new Promise(resolve => {
      let timer;
      const finish = voice => {
        clearTimeout(timer);
        this.synth.removeEventListener?.('voiceschanged', changed);
        resolve(voice);
      };
      const changed = () => {
        const voice = chooseVoice(this.synth.getVoices(), language);
        if (voice || token !== this.token) finish(voice);
      };
      this.synth.addEventListener?.('voiceschanged', changed);
      timer = setTimeout(() => finish(chooseVoice(this.synth.getVoices(), language)), 1800);
      changed();
    });
  }
  async play({ key, label, text, language }) {
    if (this.key === key && this.state === 'playing') { this.pause(); return; }
    if (this.key === key && this.state === 'paused') { this.resume(); return; }
    if (this.key === key && this.state === 'preparing') { this.stop(); return; }
    this.stop();
    if (!this.synth || !this.Utterance) { this.onNotice('unsupported'); return; }
    const token = this.token;
    this.key = key;
    this.label = label;
    this.language = language;
    this.chunks = splitSpeech(text);
    if (!this.chunks.length) { this.stop(); return; }
    this.state = 'preparing';
    this.publish();
    const voice = chooseVoice(this.synth.getVoices(), language) || await this.availableVoice(language, token);
    if (token !== this.token) return;
    if (!voice) { this.stop(); this.onNotice('missing'); return; }
    this.voice = voice;
    this.state = 'playing';
    this.index = 0;
    this.publish();
    this.sayNext(token);
  }
  sayNext(token) {
    if (token !== this.token || this.state !== 'playing') return;
    if (this.index >= this.chunks.length) { this.stop(); return; }
    const u = new this.Utterance(this.chunks[this.index]);
    this.current = u;
    this.lastBoundary = 0;
    u.lang = this.language === 'id' ? 'id-ID' : 'en-GB';
    u.voice = this.voice;
    u.rate = 0.92;
    u.pitch = 1;
    u.onboundary = event => { if (token === this.token) this.lastBoundary = event.charIndex || 0; };
    u.onend = () => {
      if (token !== this.token) return;
      this.index += 1;
      this.publish();
      if (this.state === 'playing') this.sayNext(token);
    };
    u.onerror = event => {
      if (token !== this.token || ['canceled','interrupted'].includes(event.error)) return;
      this.stop();
      this.onNotice(event.error === 'not-allowed' ? 'blocked' : 'error');
    };
    try {
      this.synth.resume();
      this.synth.speak(u);
    } catch (_error) { this.stop(); this.onNotice('error'); }
  }
  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.synth.pause();
    this.publish();
  }
  resume() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.synth.resume();
    this.publish();
    if (this.index >= this.chunks.length) this.stop();
    else if (!this.synth.speaking) this.sayNext(this.token);
  }
  stop() {
    this.token += 1;
    this.synth?.cancel();
    this.key = null;
    this.state = 'idle';
    this.index = 0;
    this.chunks = [];
    this.current = null;
    this.publish();
  }
}
