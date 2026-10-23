/* ==========================================================================
   Brasswick — main interactions (vanilla JS, no dependencies)
   Each module is guarded so pages only run what they contain.
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isRTL = () => root.dir === 'rtl';
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Preloader ---------- */
  const pre = $('.preloader');
  const donePre = () => pre && pre.classList.add('is-done');
  window.addEventListener('load', () => setTimeout(donePre, 350));
  setTimeout(donePre, 2600); // safety net

  /* ---------- Theme & direction ---------- */
  $$('[data-theme-toggle]').forEach(btn => btn.addEventListener('click', () => {
    const dark = root.classList.toggle('dark');
    store.set('bw-theme', dark ? 'dark' : 'light');
  }));
  $$('[data-dir-toggle]').forEach(btn => btn.addEventListener('click', () => {
    const next = isRTL() ? 'ltr' : 'rtl';
    root.dir = next;
    root.lang = next === 'rtl' ? 'ar' : 'en';
    store.set('bw-dir', next);
    window.dispatchEvent(new Event('resize'));
  }));

  /* ---------- Header: scrolled state ---------- */
  const header = $('.site-header');
  const onScrollHeader = () => header && header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScrollHeader();

  /* ---------- Mobile drawer ---------- */
  const drawer = $('#drawer'), backdrop = $('.drawer-backdrop');
  const openers = $$('[data-drawer-open]');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    backdrop && backdrop.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    openers.forEach(b => b.setAttribute('aria-expanded', String(open)));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { const f = $('a,button', drawer); f && f.focus(); }
  }
  openers.forEach(b => b.addEventListener('click', () => setDrawer(true)));
  $$('[data-drawer-close]').forEach(b => b.addEventListener('click', () => setDrawer(false)));
  backdrop && backdrop.addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setDrawer(false); });
  window.addEventListener('resize', () => { if (window.innerWidth >= 1280) setDrawer(false); });

  /* ---------- Split text into words ---------- */
  $$('[data-split]').forEach(el => {
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'split-word';
            const s = document.createElement('span'); s.textContent = part; w.appendChild(s);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    $$('.split-word > span', el).forEach((s, i) => s.style.setProperty('--i', i));
    el.classList.add('reveal-split');
  });

  /* ---------- Reveal on scroll ---------- */
  const revealables = $$('.reveal, .reveal-left, .reveal-mask, .reveal-split');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(el => io.observe(el));
  } else revealables.forEach(el => el.classList.add('is-in'));

  /* ---------- Counters ---------- */
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduced) {
    counters.forEach(c => c.textContent = '0');
    const cio = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
      const t0 = performance.now(), dur = 1800;
      const tick = t => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = (end * e).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick); cio.unobserve(el);
    }), { threshold: .5 });
    counters.forEach(c => cio.observe(c));
  }

  /* ---------- Scroll-driven effects (single rAF loop) ---------- */
  const rail = $('.rail-progress .fill');
  const parallax = $$('[data-speed]');
  const stackCards = $$('.stack-card');
  const hpins = $$('[data-hpin]');
  const draws = $$('[data-draw]');
  const scaleFrames = $$('[data-scale-frame]');
  const backTop = $('.back-top');

  draws.forEach(p => { const len = p.getTotalLength ? p.getTotalLength() : 2000; p.style.strokeDasharray = len; p.style.strokeDashoffset = len; p.dataset.len = len; });

  function sizePins() {
    hpins.forEach(sec => {
      const track = $('.hpin-track', sec);
      if (!track) return;
      if (window.innerWidth < 768) { sec.style.height = ''; return; }
      const dist = Math.max(0, track.scrollWidth - window.innerWidth);
      sec.dataset.dist = dist;
      sec.style.height = (window.innerHeight + dist) + 'px';
    });
  }

  let ticking = false;
  function onScroll() {
    const y = window.scrollY, vh = window.innerHeight;
    onScrollHeader();
    if (rail) { const max = document.documentElement.scrollHeight - vh; rail.style.transform = `scaleX(${max > 0 ? y / max : 0})`; }
    if (backTop) backTop.classList.toggle('is-show', y > vh);
    if (!reduced) {
      parallax.forEach(el => {
        const r = el.getBoundingClientRect(); const speed = parseFloat(el.dataset.speed);
        const off = (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.setProperty('--py', off.toFixed(1) + 'px');
        el.style.transform = `translate3d(var(--mxp, 0px), calc(var(--py) + var(--myp, 0px)), 0)`;
      });
      stackCards.forEach((card, i) => {
        const next = stackCards[i + 1]; if (!next) return;
        const r = next.getBoundingClientRect(); const top = card.getBoundingClientRect().top;
        const p = Math.min(1, Math.max(0, 1 - (r.top - top) / vh));
        card.style.transform = `scale(${1 - p * 0.06})`;
        card.style.filter = `brightness(${1 - p * 0.25})`;
      });
      hpins.forEach(sec => {
        if (window.innerWidth < 768) return;
        const track = $('.hpin-track', sec), r = sec.getBoundingClientRect();
        const dist = parseFloat(sec.dataset.dist || 0);
        const p = Math.min(1, Math.max(0, -r.top / (r.height - vh || 1)));
        track.style.transform = `translate3d(${(isRTL() ? 1 : -1) * p * dist}px,0,0)`;
        const bar = $('[data-hpin-bar]', sec); if (bar) bar.style.transform = `scaleX(${p})`;
        const loco = $('[data-hpin-loco]', sec); if (loco) loco.style.insetInlineStart = `calc(${p * 100}% - ${p * 40}px)`;
      });
      scaleFrames.forEach(f => {
        const r = (f.closest('section') || f.parentElement).getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / (vh * .8)));
        const inset = 6 * (1 - p), rad = 28 * (1 - p);
        f.style.clipPath = `inset(${inset}% ${inset}% ${inset}% ${inset}% round ${rad}px)`;
      });
    }
    draws.forEach(p => {
      const host = p.closest('[data-draw-host]') || p.parentElement; const r = host.getBoundingClientRect();
      const prog = Math.min(1, Math.max(0, (vh - r.top) / (vh * .55 + r.height * .5)));
      p.style.strokeDashoffset = (parseFloat(p.dataset.len) * (1 - (reduced ? 1 : prog))).toFixed(1);
    });
    ticking = false;
  }
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', () => { sizePins(); req(); });
  window.addEventListener('load', () => { sizePins(); req(); });
  sizePins(); onScroll();

  /* ---------- Mouse parallax in hero scenes ---------- */
  $$('[data-mouse-scene]').forEach(scene => {
    if (reduced || window.matchMedia('(hover: none)').matches) return;
    const layers = $$('[data-depth]', scene);
    scene.addEventListener('mousemove', e => {
      const r = scene.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      layers.forEach(l => {
        const d = parseFloat(l.dataset.depth);
        l.style.setProperty('--mxp', (x * -d).toFixed(1) + 'px');
        l.style.setProperty('--myp', (y * -d * .6).toFixed(1) + 'px');
        if (!l.hasAttribute('data-speed')) l.style.transform = `translate3d(var(--mxp), var(--myp), 0)`;
      });
    });
  });

  /* ---------- Tilt + spotlight cards ---------- */
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateX(${(.5 - y) * 6}deg) rotateY(${(x - .5) * 8}deg) translateY(-4px)`;
        card.style.setProperty('--mx', x * 100 + '%'); card.style.setProperty('--my', y * 100 + '%');
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px, ${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Split-flap departure board ---------- */
  $$('[data-flap]').forEach(board => {
    const msgs = JSON.parse(board.dataset.flap); const row = $('.flap-row', board);
    const len = Math.max(...msgs.map(m => m.length));
    const chars = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-/';
    row.setAttribute('dir', 'ltr');
    const cells = Array.from({ length: len }, () => { const c = document.createElement('span'); c.className = 'flap'; c.textContent = ' '; row.appendChild(c); return c; });
    let idx = 0;
    function show(msg) {
      const target = msg.toUpperCase().padEnd(len, ' ');
      cells.forEach((c, i) => {
        let steps = reduced ? 0 : 3 + Math.floor(Math.random() * 6);
        const tick = () => {
          c.classList.remove('flip'); void c.offsetWidth; c.classList.add('flip');
          if (steps-- > 0) { c.textContent = chars[Math.floor(Math.random() * chars.length)]; setTimeout(tick, 70); }
          else c.textContent = target[i];
        };
        setTimeout(tick, i * 22);
      });
    }
    show(msgs[0]);
    setInterval(() => { idx = (idx + 1) % msgs.length; show(msgs[idx]); }, 4200);
    const sr = $('.sr-only', board); if (sr) sr.textContent = msgs.join('. ');
  });

  /* ---------- Marquee: duplicate content for seamless loop ---------- */
  $$('.marquee-track').forEach(t => { t.innerHTML += t.innerHTML; Array.from(t.children).slice(t.children.length / 2).forEach(c => c.setAttribute('aria-hidden', 'true')); });

  /* ---------- Filter / search / sort / view (products & blog) ---------- */
  $$('[data-filter-scope]').forEach(scope => {
    const items = $$('[data-item]', scope);
    const chips = $$('[data-filter]', scope);
    const search = $('[data-search]', scope);
    const cat = $('[data-category]', scope);
    const sort = $('[data-sort]', scope);
    const empty = $('[data-empty]', scope);
    const count = $('[data-result-count]', scope);
    const grid = $('[data-grid]', scope);
    let active = 'all';
    function apply() {
      const q = (search && search.value || '').trim().toLowerCase();
      const c = cat ? cat.value : 'all';
      let shown = 0;
      items.forEach(it => {
        const okF = active === 'all' || (it.dataset.tags || '').split(' ').includes(active);
        const okC = c === 'all' || it.dataset.cat === c;
        const okQ = !q || (it.dataset.title || '').toLowerCase().includes(q);
        const ok = okF && okC && okQ;
        it.hidden = !ok; if (ok) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
      if (count) count.textContent = shown;
    }
    chips.forEach(ch => ch.addEventListener('click', () => {
      chips.forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
      ch.classList.add('is-active'); ch.setAttribute('aria-pressed', 'true');
      active = ch.dataset.filter; apply();
    }));
    search && search.addEventListener('input', apply);
    cat && cat.addEventListener('change', apply);
    sort && sort.addEventListener('change', () => {
      const v = sort.value;
      const sorted = items.slice().sort((a, b) => {
        if (v === 'low') return a.dataset.price - b.dataset.price;
        if (v === 'high') return b.dataset.price - a.dataset.price;
        if (v === 'name') return a.dataset.title.localeCompare(b.dataset.title);
        return a.dataset.order - b.dataset.order;
      });
      sorted.forEach(it => grid.appendChild(it));
    });
    $$('[data-view]', scope).forEach(btn => btn.addEventListener('click', () => {
      $$('[data-view]', scope).forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('is-active'); btn.setAttribute('aria-pressed', 'true');
      grid.classList.toggle('is-list', btn.dataset.view === 'list');
    }));
    $$('[data-clear]', scope).forEach(b => b.addEventListener('click', () => {
      if (search) search.value = ''; if (cat) cat.value = 'all';
      const all = chips.find(c => c.dataset.filter === 'all'); all ? all.click() : apply();
    }));
  });

  /* ---------- Tabs ---------- */
  $$('[data-tabs]').forEach(tabs => {
    const btns = $$('[role="tab"]', tabs);
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); $('#' + x.getAttribute('aria-controls')).hidden = true; });
      b.classList.add('is-active'); b.setAttribute('aria-selected', 'true'); $('#' + b.getAttribute('aria-controls')).hidden = false;
    }));
  });

  /* ---------- Product gallery & quantity ---------- */
  $$('[data-gallery]').forEach(g => {
    const main = $('[data-gallery-main]', g);
    $$('[data-thumb]', g).forEach(t => t.addEventListener('click', () => {
      $$('[data-thumb]', g).forEach(x => x.classList.remove('ring-2'));
      t.classList.add('ring-2');
      main.style.opacity = 0;
      setTimeout(() => { main.src = t.dataset.thumb; main.style.opacity = 1; }, 200);
    }));
    const zoomBox = main && main.parentElement;
    if (zoomBox && window.matchMedia('(hover: hover)').matches) {
      zoomBox.addEventListener('mousemove', e => {
        const r = zoomBox.getBoundingClientRect();
        main.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`;
        main.style.transform = 'scale(1.6)';
      });
      zoomBox.addEventListener('mouseleave', () => { main.style.transform = ''; });
    }
  });
  $$('[data-qty]').forEach(q => {
    const input = $('input', q);
    $('[data-qty-minus]', q).addEventListener('click', () => input.value = Math.max(1, (+input.value || 1) - 1));
    $('[data-qty-plus]', q).addEventListener('click', () => input.value = (+input.value || 1) + 1);
  });

  /* ---------- Option pills (radio-like) ---------- */
  $$('[data-options]').forEach(group => {
    const pills = $$('button', group);
    pills.forEach(p => p.addEventListener('click', () => {
      pills.forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
      p.classList.add('is-active'); p.setAttribute('aria-pressed', 'true');
      const price = group.dataset.priceTarget && $(group.dataset.priceTarget);
      if (price && p.dataset.price) price.textContent = '$' + p.dataset.price;
    }));
  });

  /* ---------- Cart demo ---------- */
  const cartCount = $$('[data-cart-count]');
  let cart = parseInt(store.get('bw-cart') || '2', 10);
  const renderCart = () => cartCount.forEach(c => c.textContent = cart);
  renderCart();
  $$('[data-add-cart]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault(); cart++; store.set('bw-cart', cart); renderCart();
    toast('Added to your cart');
    cartCount.forEach(c => { c.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 400 }); });
  }));
  $$('[data-wish]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault(); const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on)); b.classList.toggle('text-signal', on);
    toast(on ? 'Saved to your wishlist' : 'Removed from wishlist');
  }));

  /* ---------- Pricing toggle ---------- */
  $$('[data-billing]').forEach(sw => {
    const btns = $$('button', sw);
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('is-active'); b.setAttribute('aria-pressed', 'true');
      const yearly = b.dataset.mode === 'yearly';
      $$('[data-monthly]').forEach(p => p.textContent = yearly ? p.dataset.yearly : p.dataset.monthly);
      $$('[data-period]').forEach(p => p.textContent = yearly ? '/year' : '/month');
    }));
  });

  /* ---------- Layout estimator (custom layouts page) ---------- */
  const est = $('[data-estimator]');
  if (est) {
    const out = $('[data-estimate]'), weeks = $('[data-weeks]'), areas = $$('[data-area-out]');
    const calc = () => {
      const f = new FormData(est);
      const scale = parseFloat(f.get('scale') || 1), size = parseFloat(f.get('size') || 6), detail = parseFloat(f.get('detail') || 1);
      const extras = f.getAll('extra').reduce((s, v) => s + parseFloat(v), 0);
      const total = Math.round((size * 380 * scale * detail + extras) / 50) * 50;
      out.textContent = '$' + total.toLocaleString('en-US');
      weeks.textContent = Math.max(3, Math.round(size * 0.9 * detail));
      areas.forEach(a => a.textContent = size + ' m²');
    };
    est.addEventListener('input', calc); est.addEventListener('change', calc); calc();
    est.addEventListener('submit', e => e.preventDefault());
  }

  /* ---------- Before / after ---------- */
  $$('.ba').forEach(ba => {
    const r = $('input[type=range]', ba);
    const set = () => ba.style.setProperty('--pos', r.value + '%');
    r.addEventListener('input', set); set();
  });

  /* ---------- Countdown ---------- */
  $$('[data-countdown]').forEach(cd => {
    const target = new Date(cd.dataset.countdown).getTime();
    const parts = { d: $('[data-d]', cd), h: $('[data-h]', cd), m: $('[data-m]', cd), s: $('[data-s]', cd) };
    const pad = n => String(n).padStart(2, '0');
    const upd = () => {
      let diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 864e5); diff -= d * 864e5;
      const h = Math.floor(diff / 36e5); diff -= h * 36e5;
      const m = Math.floor(diff / 6e4); diff -= m * 6e4;
      const s = Math.floor(diff / 1e3);
      parts.d.textContent = pad(d); parts.h.textContent = pad(h); parts.m.textContent = pad(m); parts.s.textContent = pad(s);
    };
    upd(); setInterval(upd, 1000);
  });

  /* ---------- Password visibility ---------- */
  $$('[data-pw-toggle]').forEach(b => b.addEventListener('click', () => {
    const input = b.parentElement.querySelector('input');
    const show = input.type === 'password'; input.type = show ? 'text' : 'password';
    b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    b.setAttribute('aria-pressed', String(show));
  }));

  /* ---------- Forms (demo validation) ---------- */
  $$('form[data-demo]').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(f => {
      const bad = f.type === 'checkbox' ? !f.checked : !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle('is-invalid', bad); f.setAttribute('aria-invalid', String(bad)); if (bad) ok = false;
    });
    if (!ok) { toast('Please complete the highlighted fields'); return; }
    toast(form.dataset.demo || 'Thank you — we will be in touch shortly');
    form.reset();
  }));


  /* ---------- Scroll-scrubbed text (word by word) ---------- */
  const scrubs = $$('[data-scrub]');
  scrubs.forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map(w => `<span class="scrub-w" style="opacity:.16;transition:opacity .25s">${w}</span>`).join(' ');
    el.setAttribute('aria-label', words.join(' '));
  });
  function scrubUpdate() {
    const vh = window.innerHeight;
    scrubs.forEach(el => {
      const r = el.getBoundingClientRect();
      const p = reduced ? 1 : Math.min(1, Math.max(0, (vh * .85 - r.top) / (vh * .6)));
      const ws = el.children, n = ws.length;
      for (let i = 0; i < n; i++) ws[i].style.opacity = i / n < p ? 1 : .16;
    });
  }
  if (scrubs.length) { window.addEventListener('scroll', scrubUpdate, { passive: true }); scrubUpdate(); }

  /* ---------- Carousels (scroll-snap + buttons) ---------- */
  $$('[data-carousel]').forEach(c => {
    const track = $('[data-carousel-track]', c);
    const step = () => { const card = track.firstElementChild; return card ? card.getBoundingClientRect().width + 24 : 320; };
    $$('[data-next]', c).forEach(b => b.addEventListener('click', () => track.scrollBy({ left: (isRTL() ? -1 : 1) * step(), behavior: reduced ? 'auto' : 'smooth' })));
    $$('[data-prev]', c).forEach(b => b.addEventListener('click', () => track.scrollBy({ left: (isRTL() ? 1 : -1) * step(), behavior: reduced ? 'auto' : 'smooth' })));
  });

  /* ---------- Toast ---------- */
  const toastEl = $('.toast');
  let tt;
  function toast(msg) {
    if (!toastEl) return;
    $('[data-toast-msg]', toastEl).textContent = msg;
    toastEl.classList.add('is-show'); clearTimeout(tt);
    tt = setTimeout(() => toastEl.classList.remove('is-show'), 2600);
  }

  /* ---------- Back to top & year ---------- */
  backTop && backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
  $$('[data-year]').forEach(y => y.textContent = new Date().getFullYear());
})();
