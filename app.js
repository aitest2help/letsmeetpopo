import { icon } from './icons.js';
import { SpeechController } from './speech.js';

const ASSETS = {
  "hero": "./assets/hero.jpg",
  "memory": "./assets/memory.jpg",
  "meal": "./assets/meal.jpg",
  "congee": "./assets/congee.jpg",
  "walk": "./assets/walk.jpg",
  "outdoors": "./assets/outdoors.jpg",
  "lis": "./assets/lis.jpg"
};
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let language = 'id';
let content;
let quotes;
let controller;
let noticeTimer;

const CARD_ICONS = {
  story: ['user', 'heart'],
  together: ['chat', 'bowl', 'bowl'],
  care: ['walk', 'bath', 'pill', 'note', 'clean', 'chat'],
  rhythm: ['sun', 'sun', 'bowl', 'moon'],
  home: ['bed', 'home', 'heart'],
  support: ['heart', 'chat', 'hand'],
  meet: ['sun', 'chat']
};

function listenButton(key) {
  const t = content[language];
  const sectionLabel = key === 'all' ? t.all : key === 'lis' ? (language === 'id' ? 'Cerita Lis' : 'Lis’s story') : t.sections.find(s => s.key === key)?.label;
  return `<button type="button" class="listen-btn" data-listen="${key}" aria-label="${esc(t.listen + ': ' + sectionLabel)}" aria-pressed="false">${icon('sound')}<span class="listen-label"><span class="listen-text">${esc(key === 'all' ? t.all : t.listen)}</span><span class="audio-language">${language === 'id' ? 'Bahasa Indonesia' : 'English'}</span></span></button>`;
}
function figure(asset, caption, hero = false, extraClass = '') {
  return `<figure class="photo ${hero ? 'hero-photo' : 'section-photo'} ${extraClass}"><img src="${ASSETS[asset]}" alt="${esc(caption)}" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"><figcaption>${esc(caption)}</figcaption></figure>`;
}
function quotedText(original, translation, panel = false) {
  const isEnglish = language === 'en';
  const label = isEnglish ? 'Lis · English translation of her Indonesian words' : 'Lis · Kata-kata aslinya';
  const body = isEnglish ? translation : original;
  return `<figure class="${panel ? 'quote-panel' : 'testimonial'}" ${panel ? 'id="lis-story"' : ''}>
    <div class="quote-heading"><div class="quote-credit"><img class="avatar" src="${ASSETS.lis}" alt="Lis" width="42" height="42"><div><strong>Lis</strong><span class="quote-source-label">${esc(label)}</span></div></div>${panel ? listenButton('lis') : ''}</div>
    <blockquote lang="${language}">${esc(body)}</blockquote>
    ${isEnglish ? `<div class="quote-original"><span class="quote-source-label" lang="en">Original Indonesian · unchanged</span><p lang="id">${esc(original)}</p></div>` : ''}
  </figure>`;
}
function render() {
  const t = content[language];
  document.documentElement.lang = language;
  document.title = language === 'id' ? 'Bersama Popo — Kenali pekerjaan dan kehidupan di sini' : 'With Popo — Meet the person, the work and life here';
  document.querySelector('meta[name="description"]').content = language === 'id' ? 'Kisah Lis, kehidupan bersama Popo, pekerjaan sehari-hari dan dukungan keluarga.' : 'Lis’s story, life with Popo, daily care responsibilities and family support.';
  document.getElementById('brand').textContent = t.brand;
  document.querySelector('.wordmark').setAttribute('aria-label', t.brand + (language === 'id' ? ' — awal halaman' : ' — beginning of page'));
  document.getElementById('skip-link').textContent = language === 'id' ? 'Langsung ke cerita' : 'Skip to the story';
  for (const button of document.querySelectorAll('[data-language]')) button.setAttribute('aria-pressed', String(button.dataset.language === language));
  const topics = t.sections.map((s, number) => `<a class="topic-link" href="#${s.key}"><span class="topic-symbol">${icon(s.icon)}</span><span class="topic-copy"><span class="topic-number">${String(number + 1).padStart(2, '0')}</span><span class="topic-label">${esc(s.label)}</span></span></a>`).join('');
  const sections = t.sections.map((section, number) => {
    const cards = section.cards.map((card, index) => `<article class="info-card"><span class="card-symbol">${icon(CARD_ICONS[section.key]?.[index] || card.icon)}</span><div class="card-text"><h3>${esc(card.title)}</h3><p>${esc(card.text)}</p></div></article>`).join('');
    const testimonials = section.testimonials.map(key => quotedText(quotes.extras[key].id, quotes.extras[key].en)).join('');
    const porridgeCaption = language === 'id' ? 'Bubur kesukaan Popo, dibuat Lis. Makanan yang akrab punya tempat dalam kesehariannya.' : 'Popo’s favourite congee, made by Lis. Familiar food is part of her everyday life.';
    const photoRail = section.photo ? `<div class="photo-rail">${figure(section.photo, section.photoCaption)}${section.key === 'together' ? figure('congee', porridgeCaption, false, 'second-photo') : ''}</div>` : '';
    return `<section class="story-section" id="${section.key}" aria-labelledby="title-${section.key}"><div class="wrap">
      <div class="section-top"><div><p class="section-eyebrow">${icon(section.icon)}<span>${String(number + 1).padStart(2,'0')} · ${esc(section.label)}</span></p><h2 id="title-${section.key}">${esc(section.title)}</h2><p class="subtitle">${esc(section.subtitle)}</p></div>${listenButton(section.key)}</div>
      <div class="section-body ${section.photo ? 'with-photo' : 'without-photo'}">${photoRail}<div class="section-content"><div class="cards">${cards}</div>${testimonials ? `<div class="testimonial-group">${testimonials}</div>` : ''}</div></div>
      ${section.key === 'meet' ? `<div class="meeting-cta">${icon('chat')}<div><h3>${esc(t.meetCta)}</h3><p>${esc(t.meetNote)}</p></div></div>` : ''}
    </div></section>`;
  }).join('');
  document.getElementById('page').innerHTML = `<section class="hero wrap" aria-labelledby="hero-title">
    <div class="hero-top"><div class="hero-story"><p class="eyebrow">${esc(t.eyebrow)}</p><h1 id="hero-title">${esc(t.heroTitle[0])}<br><span>${esc(t.heroTitle[1])}</span></h1><p class="intro">${esc(t.heroIntro)}</p><div class="requirement-note">${icon('heart')}<p>${esc(t.introRequirement)}</p></div><div class="hero-listen">${listenButton('all')}<p>${language === 'id' ? 'Baca sambil menggulir, atau dengarkan ceritanya.' : 'Scroll through the story, or listen along.'}</p></div></div>${figure('hero',t.heroCaption,true)}</div>
    ${quotedText(quotes.original,quotes.translation,true)}
    <p class="after-quote">${esc(t.afterQuote)}</p>
    <div class="audio-intro">${icon('sound')}<p>${esc(t.audioHint)}</p></div>
  </section>
  <nav class="topic-section wrap" aria-label="${language === 'id' ? 'Bagian cerita pada halaman ini' : 'Story sections on this page'}"><h2 class="topic-heading">${esc(t.sectionTitle)}</h2><p class="topic-intro">${esc(t.tocHint)}</p><div class="topics">${topics}</div></nav>
  ${sections}`;
}
function speechText(key) {
  const t = content[language];
  const hero = [t.heroTitle.join(' '), t.heroIntro, t.introRequirement, language === 'id' ? quotes.original : quotes.translation, t.afterQuote].join(' ');
  const sectionText = section => [section.title,section.subtitle,...section.cards.map(c => `${c.title} ${c.text}`),...section.testimonials.map(k => `${language === 'id' ? 'Kata Lis.' : 'Lis says.'} ${quotes.extras[k][language]}`), ...(section.key === 'meet' ? [t.meetCta,t.meetNote] : [])].join(' ');
  if (key === 'all') return [hero,...t.sections.map(sectionText)].join(' ');
  if (key === 'lis') return [t.heroIntro,language === 'id' ? quotes.original : quotes.translation].join(' ');
  const section = t.sections.find(s => s.key === key);
  return section ? sectionText(section) : '';
}
function showNotice(kind) {
  const messages = {
    id: { missing:'Suara bahasa Indonesia belum tersedia di perangkat ini. Aktifkan atau unduh suara Bahasa Indonesia pada pengaturan suara ponsel, lalu coba lagi. Teks tetap bisa dibaca.', unsupported:'Browser ini belum mendukung fitur membacakan teks. Coba browser ponsel lain, atau baca teks yang tersedia.', blocked:'Browser memblokir suara. Coba buka Preview di browser biasa, lalu ketuk Dengarkan lagi.', error:'Suara terhenti. Coba ketuk Dengarkan lagi. Teks tetap tersedia.' },
    en: { missing:'No English voice is available on this device. Enable an English voice in your device’s speech settings and try again. All text remains readable.', unsupported:'This browser does not support read-aloud. Try another phone browser or read the visible text.', blocked:'The browser blocked speech. Try opening Preview in your regular browser, then tap Listen again.', error:'Read-aloud stopped unexpectedly. Tap Listen to try again; all text remains available.' }
  };
  const box = document.getElementById('audio-notice');
  box.textContent = messages[language][kind] || messages[language].error;
  box.hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { box.hidden = true; },16000);
}
function updatePlayback({state,key,label,index,total}) {
  if (!content) return;
  const t = content[language];
  const active = state !== 'idle';
  document.body.classList.toggle('has-audio',active);
  const player = document.getElementById('audio-player');
  player.hidden = !active;
  player.setAttribute('aria-label',language === 'id' ? 'Pemutar suara' : 'Read-aloud player');
  const status = state === 'preparing' ? (language === 'id' ? 'Menyiapkan suara…' : 'Preparing the device voice…') : state === 'paused' ? (language === 'id' ? 'Dijeda' : 'Paused') : (language === 'id' ? 'Sedang dibacakan' : 'Reading aloud');
  document.getElementById('player-label').textContent = label || '';
  document.getElementById('player-status').textContent = state === 'preparing' ? status : `${status} · ${language === 'id' ? 'Bahasa Indonesia' : 'English'} · ${Math.min(index + 1,total)}/${total}`;
  const pause = document.getElementById('player-pause');
  pause.disabled = state === 'preparing';
  pause.innerHTML = icon(state === 'paused' ? 'play' : 'pause') + `<span>${esc(state === 'paused' ? t.resume : t.pause)}</span>`;
  document.getElementById('player-stop').innerHTML = icon('stop') + `<span>${esc(t.stop)}</span>`;
  for (const button of document.querySelectorAll('[data-listen]')) {
    const current = active && button.dataset.listen === key;
    button.dataset.active = String(current);
    button.setAttribute('aria-pressed', String(current));
    const action = current ? (state === 'paused' ? t.resume : state === 'preparing' ? t.stop : t.pause) : t.listen;
    const target = button.dataset.listen === 'all' ? t.all : button.dataset.listen === 'lis' ? (language === 'id' ? 'Cerita Lis' : 'Lis’s story') : t.sections.find(s => s.key === button.dataset.listen)?.label;
    button.setAttribute('aria-label', action + ': ' + target);
    const text = button.querySelector('.listen-text');
    text.textContent = current ? (state === 'paused' ? t.resume : state === 'preparing' ? (language === 'id' ? 'Menyiapkan…' : 'Preparing…') : t.pause) : (button.dataset.listen === 'all' ? t.all : t.listen);
  }
}
async function boot() {
  const responses = await Promise.all([fetch('./content.json'),fetch('./quotes.json')]);
  if (responses.some(response => !response.ok)) throw new Error('Content could not load');
  [content,quotes] = await Promise.all(responses.map(response => response.json()));
  render();
  controller = new SpeechController({ synth: window.speechSynthesis, Utterance: window.SpeechSynthesisUtterance, onChange:updatePlayback, onNotice:showNotice });
  window.speechSynthesis?.getVoices();
  document.addEventListener('click',event => {
    const langButton = event.target.closest('[data-language]');
    if (langButton && langButton.dataset.language !== language) {
      const anchor = [...document.querySelectorAll('section[id]')].filter(s => s.getBoundingClientRect().top < 130).at(-1);
      const position = anchor?.getBoundingClientRect().top;
      const oldId = anchor?.id;
      controller.stop();
      language = langButton.dataset.language;
      document.getElementById('audio-notice').hidden = true;
      render();
      updatePlayback({state:'idle'});
      if (oldId) { const newPosition = document.getElementById(oldId)?.getBoundingClientRect().top; if (typeof newPosition === 'number') window.scrollBy({top:newPosition - position,behavior:'instant'}); }
      return;
    }
    const button = event.target.closest('[data-listen]');
    if (button) {
      document.getElementById('audio-notice').hidden = true;
      const key = button.dataset.listen;
      const t = content[language];
      const label = key === 'all' ? t.all : key === 'lis' ? (language === 'id' ? 'Cerita Lis' : 'Lis’s story') : t.sections.find(s => s.key === key).label;
      void controller.play({key,label,text:speechText(key),language});
    }
  });
  document.getElementById('player-pause').addEventListener('click',() => { if (controller.state === 'paused') controller.resume(); else controller.pause(); });
  document.getElementById('player-stop').addEventListener('click',() => controller.stop());
  window.addEventListener('pagehide',() => controller.stop());
}
boot().catch(error => {
  console.error(error);
  document.getElementById('loading-message')?.replaceWith(Object.assign(document.createElement('p'),{textContent:'Cerita belum dapat dimuat. Silakan muat ulang halaman. / Please reload to load the story.'}));
});
