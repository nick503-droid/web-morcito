import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { story } from './story';
import './styles.css';

gsap.registerPlugin(ScrollTrigger);
const pad = (n) => String(n).padStart(2, '0');
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const Arrow = ({ diagonal = false }) => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M12 3v17M5 13l7 7 7-7'} stroke="currentColor" strokeWidth="1.4" /></svg>;
const Star = ({ className = '' }) => <span className={'star ' + className} aria-hidden="true">✳</span>;

const preloadImage = (src) => new Promise((resolve) => {
  const image = new Image();
  image.onload = resolve;
  image.onerror = resolve;
  image.src = src;
  if (image.complete) resolve();
});

const preloadVideo = (src) => new Promise((resolve) => {
  const video = document.createElement('video');
  const done = () => {
    video.onloadeddata = null;
    video.onerror = null;
    video.removeAttribute('src');
    video.load();
    resolve();
  };
  video.preload = 'auto';
  video.muted = true;
  video.onloadeddata = done;
  video.onerror = done;
  video.src = src;
  video.load();
});

const criticalAssets = [...new Map([
  { src: story.heroImage, video: false },
  { src: story.reveal.image, video: false },
  { src: story.reveal.secondImage, video: false },
  ...story.moments.map((moment) => ({ src: moment.secondImage, video: !!moment.secondIsVideo })),
  { src: story.birthday.image, video: false },
].filter(({ src }) => src).map((asset) => [asset.src, asset])).values()];

function LoadingScreen({ progress, ready, onEnter }) {
  return <div className="story-loader" role="dialog" aria-modal="true" aria-label="Cargando nuestra historia">
    <div className="loader-top mono"><span>{story.initials}<sup>∞</sup></span><span>Una historia que sigue</span></div>
    <div className="loader-rings" aria-hidden="true"><i /><i /><i /></div>
    <div className="loader-center">
      <p className="mono">Para {story.herName}</p>
      <div className="loader-mark" aria-hidden="true"><span>{story.initials.split('+')[0]?.trim()}</span><em>+</em><span>{story.initials.split('+')[1]?.trim()}</span></div>
      <p className="loader-title">Todo lo nuestro,<br /><em>listo para revivir.</em></p>
    </div>
    <div className="loader-bottom">
      <div className="loader-status mono" aria-live="polite"><span>{ready ? 'Todo listo' : 'Preparando nuestros recuerdos'}</span><strong>{pad(progress)}%</strong></div>
      <div className="loader-bar" aria-hidden="true"><i style={{ transform: `scaleX(${progress / 100})` }} /></div>
      <button className="loader-enter" type="button" onClick={onEnter} disabled={!ready}>{ready ? <>Entrar a nuestra historia <span>↗</span></> : 'Un momento…'}</button>
    </div>
  </div>;
}

function Photo({ src, alt, className = '', eager = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return failed ? <span className={'photo-fallback ' + className} role="img" aria-label={alt}><span>Un instante para recordar ♡</span></span> : <img className={className} src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />;
}

function MediaItem({ src, alt, className = '', isVideo = false, eager = false }) {
  if (isVideo) {
    return <video className={className} src={src} preload={eager ? 'auto' : 'metadata'} autoPlay loop muted playsInline aria-label={alt} />;
  }
  return <Photo src={src} alt={alt} className={className} eager={eager} />;
}

function RevealPhoto() {
  const area = useRef(null);
  const lens = useRef(null);
  const setters = useRef(null);
  const [locked, setLocked] = useState(false);
  useEffect(() => {
    const ctx = gsap.context(() => {
      setters.current = {
        x: gsap.quickTo(lens.current, '--lens-x', { duration: 0.28, ease: 'power3.out' }),
        y: gsap.quickTo(lens.current, '--lens-y', { duration: 0.28, ease: 'power3.out' }),
      };
    }, area);
    return () => ctx.revert();
  }, []);
  const move = (event) => {
    if (event.pointerType === 'touch' || locked || reducedMotion()) return;
    const rect = area.current.getBoundingClientRect();
    setters.current?.x((event.clientX - rect.left) * area.current.offsetWidth / rect.width);
    setters.current?.y((event.clientY - rect.top) * area.current.offsetHeight / rect.height);
    area.current.dataset.hover = 'true';
  };
  return <div className={'reveal-photo ' + (locked ? 'is-locked' : '')} ref={area} onPointerMove={move} onPointerLeave={() => { area.current.dataset.hover = 'false'; }}>
    <Photo src={story.reveal.image} alt={story.reveal.alt} eager />
    <div className="reveal-lens" ref={lens} aria-hidden={!locked}><Photo src={story.reveal.secondImage} alt={story.reveal.secondAlt} eager /></div>
    <div className="reveal-shade" />
    <div className="reveal-top mono"><span>01 / Otra forma de mirar</span><span>{locked ? '02' : '01'} — 02</span></div>
    <div className="reveal-heading"><span>Mi lugar favorito</span><em>eres tú.</em></div>
    <div className="reveal-bottom"><p className="mono pointer-hint">Mueve el cursor.<br />Hay otra historia debajo.</p><button className="pill light" onClick={() => setLocked(!locked)} aria-pressed={locked}>{locked ? 'Volver a la primera foto' : 'Revelar la segunda foto'} <span aria-hidden="true">{locked ? '−' : '+'}</span></button></div>
  </div>;
}

function MemoryDialog({ selection, onClose, onSelect }) {
  const dialog = useRef(null);
  const [second, setSecond] = useState(true);
  const isMemory = typeof selection === 'number';
  const moment = isMemory ? story.moments[selection] : null;
  useEffect(() => {
    if (selection === null) return;
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const element = dialog.current;
    document.body.style.overflow = 'hidden';
    element.showModal();
    return () => { document.body.style.overflow = previousOverflow; element.close(); previous?.focus({ preventScroll: true }); };
  }, [selection !== null]);
  useEffect(() => setSecond(typeof selection === 'number'), [selection]);
  const navigate = (direction) => onSelect((selection + direction + story.moments.length) % story.moments.length);
  return <dialog ref={dialog} className={'memory-dialog ' + (isMemory ? '' : 'text-dialog')} onCancel={onClose} onClick={(event) => { if (event.target === dialog.current) onClose(); }} onKeyDown={(event) => {
    if (isMemory && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); navigate(event.key === 'ArrowRight' ? 1 : -1); }
  }} aria-labelledby="dialog-title">
    <div className="dialog-inner">
      <button className="round-button dialog-close" onClick={onClose} aria-label="Cerrar recuerdo" autoFocus>×</button>
      {moment ? <>
        <div className="dialog-photo"><MediaItem key={selection + '-' + second} src={second ? moment.secondImage : moment.image} alt={second ? (moment.secondAlt || moment.alt + ', nuestro recuerdo') : moment.alt} isVideo={second && !!moment.secondIsVideo} eager /><button className="pill light" onClick={() => setSecond(!second)} aria-pressed={second}>{second ? 'Primera foto' : 'Nuestro recuerdo'} <span>↔</span></button></div>
        <div className="dialog-copy"><p className="mono">{moment.date}</p><h2 id="dialog-title">{moment.title}</h2><p>{moment.text}</p><div className="dialog-navigation"><button className="round-button" onClick={() => navigate(-1)} aria-label="Recuerdo anterior">←</button><span className="mono" aria-live="polite">{pad(selection + 1)} / {pad(story.moments.length)}</span><button className="round-button" onClick={() => navigate(1)} aria-label="Recuerdo siguiente">→</button></div></div>
      </> : <div className="dialog-letter"><Star /><p className="mono">Una nota para ti</p><h2 id="dialog-title">{selection === 'future' ? 'Lo mejor está por venir.' : 'Las cosas pequeñas.'}</h2>{selection === 'future' ? <p>{story.futureLetter}</p> : <ul>{story.littleThings.map((thing) => <li key={thing}>{thing}</li>)}</ul>}<p className="handwriting">Siempre contigo.</p></div>}
    </div>
  </dialog>;
}

function App() {
  const root = useRef(null);
  const menu = useRef(null);
  const menuButton = useRef(null);
  const gallery = useRef(null);
  const galleryTrack = useRef(null);
  const galleryTrigger = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selection, setSelection] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [assetsReady, setAssetsReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const celebrationTimer = useRef(null);

  useEffect(() => {
    let active = true;
    let completed = 0;
    const total = Math.max(criticalAssets.length, 1);
    const load = ({ src, video }) => Promise.race([
      video ? preloadVideo(src) : preloadImage(src),
      new Promise((resolve) => setTimeout(resolve, 12000)),
    ]).finally(() => {
      completed += 1;
      if (active) setLoadProgress(Math.round((completed / total) * 100));
    });
    Promise.all(criticalAssets.map(load)).then(() => {
      if (!active) return;
      setLoadProgress(100);
      setAssetsReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (entered) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [entered]);

  const enterStory = () => {
    if (!assetsReady) return;
    if (reducedMotion()) { setEntered(true); return; }
    gsap.to('.story-loader', { yPercent: -100, duration: 0.9, ease: 'power4.inOut', onComplete: () => setEntered(true) });
  };

  useEffect(() => {
    if (!entered) return undefined;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      gsap.to('.page-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: true } });
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.hero-kicker, .hero-title .line, .hero-meta', { y: 60, opacity: 0, stagger: 0.12, duration: 1.15, ease: 'power3.out', clearProps: 'transform,opacity' });
        gsap.from('.hero-image', { scale: 1.08, duration: 1.8, ease: 'power2.out' });
        gsap.utils.toArray('.enter').forEach((element) => gsap.from(element, { y: 45, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 90%' } }));
        gsap.fromTo('.manifesto-word', { opacity: 0.2 }, { opacity: 1, stagger: 0.18, ease: 'none', scrollTrigger: { trigger: '.manifesto-copy', start: 'top 82%', end: 'bottom 65%', scrub: 0.5 } });
      });
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.to('.hero-copy', { y: -75, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.timeline({ scrollTrigger: { trigger: '.reveal-section', start: 'top top', end: '+=95%', pin: true, scrub: 0.8, anticipatePin: 1 } })
          .to('.reveal-frame', { scale: 0.72, borderRadius: 8, ease: 'none', duration: 1 })
          .fromTo('.reveal-surround', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.7 }, 0.25);
        const distance = () => Math.max(0, galleryTrack.current.scrollWidth - gallery.current.clientWidth);
        const travel = gsap.to(galleryTrack.current, { x: () => -distance(), ease: 'none', scrollTrigger: {
          trigger: gallery.current, start: 'top top', end: () => '+=' + (distance() + window.innerHeight * 0.3), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => { gallery.current.style.setProperty('--gallery-progress', self.progress); },
        } });
        galleryTrigger.current = travel.scrollTrigger;
        gsap.fromTo('.gallery', { backgroundColor: '#252c25', color: '#f3efe7' }, { backgroundColor: '#f3efe7', color: '#252c25', ease: 'none', scrollTrigger: { trigger: gallery.current, start: 'top top', end: () => '+=' + distance() * 0.65, scrub: true } });
        gsap.timeline({ scrollTrigger: { trigger: '.birthday', start: 'top top', end: '+=115%', pin: true, scrub: 0.8, anticipatePin: 1 } })
          .fromTo('.birthday-photo', { clipPath: 'inset(20% 24% 20% 24% round 8px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1, ease: 'none' })
          .fromTo('.birthday-shade', { opacity: 0.1 }, { opacity: 0.72, duration: 0.65 }, 0.35)
          .fromTo('.birthday-content', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.55);
        return () => { galleryTrigger.current = null; gallery.current?.style.removeProperty('--gallery-progress'); };
      });
    }, root);
    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => { window.removeEventListener('load', refresh); mm.revert(); ctx.revert(); clearTimeout(celebrationTimer.current); };
  }, [entered]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => menu.current?.querySelector('a')?.focus());
    const trap = (event) => {
      if (event.key === 'Escape') { setMenuOpen(false); return; }
      if (event.key !== 'Tab') return;
      const controls = [...menu.current.querySelectorAll('a, button')];
      const first = controls[0], last = controls.at(-1);
      if (!menu.current.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trap);
    return () => { cancelAnimationFrame(focusFrame); document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', trap); menuButton.current?.focus({ preventScroll: true }); };
  }, [menuOpen]);

  const goTo = (id) => {
    setMenuOpen(false);
    requestAnimationFrame(() => {
      const trigger = ScrollTrigger.getAll().find((item) => item.trigger?.id === id && item.pin);
      const target = document.getElementById(id);
      if (!target) return;
      const headerOffset = ['inicio', 'felicitaciones'].includes(id) ? 0 : 84;
      const top = trigger ? trigger.start + (id === 'felicitaciones' ? trigger.end - trigger.start : 1) : target.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: reducedMotion() ? 'instant' : 'smooth' });
      target.focus({ preventScroll: true });
    });
  };
  const focusMemory = (event) => {
    if (!event.target.matches(':focus-visible') || !galleryTrigger.current) return;
    const distance = galleryTrack.current.scrollWidth - gallery.current.clientWidth;
    const position = event.currentTarget.offsetLeft - (gallery.current.clientWidth - event.currentTarget.offsetWidth) / 2;
    const progress = Math.min(1, Math.max(0, position / distance));
    const trigger = galleryTrigger.current;
    window.scrollTo({ top: trigger.start + progress * (trigger.end - trigger.start), behavior: 'instant' });
  };
  const celebrate = () => {
    clearTimeout(celebrationTimer.current);
    setCelebrating(false);
    requestAnimationFrame(() => setCelebrating(true));
    celebrationTimer.current = setTimeout(() => setCelebrating(false), 4200);
  };
  const navItems = [['inicio', 'El comienzo'], ['miradas', 'Otra mirada'], ['recuerdos', 'Los recuerdos'], ['nosotros', 'Tú y yo'], ['felicitaciones', 'Para ti']];

  return <div ref={root}>
    {!entered && <LoadingScreen progress={loadProgress} ready={assetsReady} onEnter={enterStory} />}
    <a className="skip-link" href="#miradas">Saltar al contenido</a>
    <div className="page-progress" aria-hidden="true" />
    <header className="site-header" inert={!entered || menuOpen ? true : undefined}>
      <a className="brand" href="#inicio" onClick={(event) => { event.preventDefault(); goTo('inicio'); }} aria-label="Volver al inicio">{story.initials}<sup>∞</sup></a>
      <span className="header-note mono">Una historia que sigue.</span>
      <div className="header-actions"><button className="birthday-link mono" onClick={() => goTo('felicitaciones')}>Para ti <span>↗</span></button><button ref={menuButton} className="menu-button" onClick={() => setMenuOpen(true)} aria-expanded={menuOpen} aria-controls="story-menu" aria-label="Abrir menú"><span /><span /></button></div>
    </header>
    <nav id="story-menu" className={'menu ' + (menuOpen ? 'active' : '')} ref={menu} role={menuOpen ? 'dialog' : undefined} aria-modal={menuOpen ? 'true' : undefined} aria-label="Capítulos de nuestra historia" inert={!menuOpen ? true : undefined}>
      <p className="mono">Cada parte de nosotros</p>
      {navItems.map(([id, label], index) => <a href={'#' + id} key={id} onClick={(event) => { event.preventDefault(); goTo(id); }}><span className="mono">{pad(index)}</span>{label}<span className="nav-arrow">↗</span></a>)}
      <button className="menu-close round-button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">×</button>
      <p className="menu-signature handwriting">Con todo mi amor.</p>
    </nav>

    <main inert={!entered || menuOpen ? true : undefined} aria-hidden={!entered ? 'true' : undefined}>
      <section className="hero" id="inicio" tabIndex={-1} aria-label="El comienzo">
        <div className="hero-image-wrap"><Photo className="hero-image" src={story.heroImage} alt="Una historia de amor" eager /></div>
        <div className="grain" />
        <div className="hero-copy"><p className="hero-kicker mono">Para {story.herName} · en su cumpleaños</p><h1 className="hero-title"><span className="line">Todo lo que</span><span className="line italic">hemos vivido,</span><span className="line">en un solo lugar.</span></h1><div className="hero-meta mono"><span>{story.date}</span><span>Esta es nuestra historia</span></div></div>
        <button className="scroll-cue round-button" onClick={() => goTo('miradas')} aria-label="Descubrir otra mirada"><Arrow /></button>
        <span className="hero-side mono">Hecho de instantes. Hecho de ti.</span>
      </section>

      <section className="reveal-section" id="miradas" tabIndex={-1} aria-label="Dos fotos, otra mirada">
        <div className="reveal-surround" aria-hidden="true"><span>Todo cambia</span><span>cuando estás tú.</span><i className="handwriting">mi persona favorita</i></div>
        <div className="reveal-frame"><RevealPhoto /></div>
        <span className="reveal-caption mono">{story.reveal.caption}</span>
      </section>

      <section className="manifesto" id="historia" aria-label="Nuestra historia">
        <div className="manifesto-mark enter"><Star /><p className="mono">Qué suerte coincidir.</p></div>
        <h2 className="manifesto-copy">{'NO SON SOLO RECUERDOS. SON LAS VECES QUE EL MUNDO SE SINTIÓ MÁS NUESTRO PORQUE ESTABAS TÚ.'.split(' ').map((word, index) => <React.Fragment key={index}><span className={'manifesto-word ' + ([3, 9, 13, 16].includes(index) ? 'serif-accent' : '')}>{word}</span>{' '}</React.Fragment>)}</h2>
        <div className="manifesto-bottom enter"><p>Guardé un poquito de nosotros.<br />Para volver aquí, siempre.</p><span className="handwriting">Tú, yo y todo lo demás.</span></div>
      </section>

      <section className="gallery" id="recuerdos" ref={gallery} tabIndex={-1} aria-labelledby="gallery-title">
        <div className="gallery-top mono"><h2 id="gallery-title">02 / Instantes que se quedan</h2><span className="desktop-hint">Sigue bajando para recorrerlos →</span><span className="mobile-hint">Toca una foto para abrirla ↗</span></div>
        <span className="gallery-watermark" aria-hidden="true">nosotros.</span>
        <div className="gallery-track" ref={galleryTrack}>
          {story.moments.map((moment, index) => <React.Fragment key={moment.title}>
            {index === 2 && <blockquote className="gallery-quote"><span>Y si pudiera<br />repetir algo,</span><em>sería contigo.</em><span className="handwriting">una y otra vez</span></blockquote>}
            <button className={'memory-card memory-card-' + (index + 1)} onClick={() => setSelection(index)} onFocus={focusMemory} aria-label={'Abrir recuerdo ' + pad(index + 1) + ': ' + moment.title}><span className="memory-caption mono">{moment.date}</span><span className="memory-image"><Photo src={moment.image} alt={moment.alt} /><MediaItem className="memory-second" src={moment.secondImage} alt="" isVideo={!!moment.secondIsVideo} /><span className="memory-open" aria-hidden="true"><Arrow diagonal /></span></span><span className="memory-title">{moment.title}<span>↗</span></span></button>
            {index === 5 && <blockquote className="gallery-quote second-quote"><span>Lo extraordinario<br />era lo de siempre.</span><em>Pero contigo.</em><Star /></blockquote>}
          </React.Fragment>)}
          <div className="gallery-end"><Star /><p>Y todavía<br /><em>nos queda tanto.</em></p><button className="round-button" onClick={() => goTo('nosotros')} aria-label="Seguir a Tú y yo"><Arrow /></button></div>
        </div>
        <div className="gallery-bottom mono"><span>Pequeños momentos, una gran historia.</span><span className="gallery-meter"><i /></span><span>{pad(story.moments.length)} recuerdos / ∞ por vivir</span></div>
      </section>

      <section className="together" id="nosotros" tabIndex={-1} aria-labelledby="together-title">
        <div className="together-heading enter"><p className="mono">03 / Mi equipo favorito</p><h2 id="together-title">Tú <em>&</em> yo.</h2><p>No importa el plan.<br />Me quedo contigo.</p></div>
        <div className="chapter-grid">
          <button className="chapter chapter-past" onClick={() => setSelection('little')}><Photo src={story.moments.at(-2)?.image || story.heroImage} alt={story.moments.at(-2)?.alt || 'Nuestra historia'} /><span className="chapter-shade" /><span className="chapter-label mono">Lo que más me gusta</span><span className="chapter-title">LAS COSAS<br /><em>pequeñas.</em></span><span className="chapter-foot"><span>Mis razones favoritas.</span><span className="round-button"><Arrow diagonal /></span></span></button>
          <button className="chapter chapter-future" onClick={() => setSelection('future')}><Photo src={story.moments.at(-1)?.image || story.heroImage} alt={story.moments.at(-1)?.alt || 'Nuestro siguiente capítulo'} /><span className="chapter-shade" /><span className="chapter-label mono">Nuestro siguiente capítulo</span><span className="chapter-title">TODO LO<br /><em>que viene.</em></span><span className="chapter-foot"><span>Lo mejor aún no tiene foto.</span><span className="round-button"><Arrow diagonal /></span></span></button>
        </div>
        <div className="together-footer mono"><span>Mi persona. Mi lugar. Mi suerte.</span><span>Y hoy, celebramos tu vida. ↓</span></div>
      </section>

      <section className="birthday" id="felicitaciones" tabIndex={-1} aria-labelledby="birthday-title">
        <span className="birthday-backdrop" aria-hidden="true">por muchos<br /><em>más.</em></span>
        <div className="birthday-photo"><Photo src={story.birthday.image} alt={story.birthday.alt} /><div className="birthday-shade" /></div>
        <div className="birthday-content"><p className="mono">04 / Hoy todo es por ti · {story.date}</p><h2 id="birthday-title">Feliz cumpleaños,<br /><em>{story.herName}.</em></h2><p className="birthday-message">{story.birthday.message}</p><span className="handwriting birthday-signature">Con amor, {story.yourName}</span><button className="pill light celebrate-button" onClick={celebrate}>Pide un deseo <Star /></button><p className={'birthday-wish ' + (celebrating ? 'visible' : '')} role="status">{celebrating ? story.birthday.wish : '\u00a0'}</p></div>
        {celebrating && <div className="confetti" aria-hidden="true">{Array.from({ length: 40 }, (_, index) => <i key={index} style={{ '--x': (index * 37) % 100 + '%', '--delay': (index % 7) * 0.12 + 's', '--angle': index * 29 + 'deg', '--drift': (index % 2 ? 1 : -1) * (40 + index * 3) + 'px', '--color': ['#f5f0e5', '#ef806b', '#e8ce83', '#aaba95'][index % 4] }} />)}</div>}
        <footer className="birthday-footer mono"><span>Hecho con todo mi amor · {story.initials}</span><button onClick={() => goTo('inicio')}>Volver a vivirlo ↑</button></footer>
      </section>
    </main>
    <MemoryDialog selection={selection} onClose={() => setSelection(null)} onSelect={setSelection} />
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
