/* ==========================================================================
   Brasswick — main interactions (vanilla JS, no dependencies)
   Every module is guarded, so a page only runs what it contains.
   --------------------------------------------------------------------------
   01 Helpers & storage        08 Filters, search & pagination
   02 Preloader, theme, RTL    09 Tabs, gallery, quantity, options
   03 Header & mobile menu     10 Cart (drawer) & wishlist
   04 Reveal & split text      11 Checkout & order success
   05 Scroll effects           12 Forms: phone, digits, validation
   06 Pointer effects          13 Pricing, estimator, before/after
   07 Flap board, marquee,     14 Countdown, carousel, misc
      counters, scrub text
   ========================================================================== */
(function () {
  'use strict';

  /* 01 ---------------------------------------------------------- helpers */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isRTL = () => root.dir === 'rtl';
  const money = n => '$' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, fb) { try { const v = localStorage.getItem(k); return v === null ? fb : JSON.parse(v); } catch (e) { return fb; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    raw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    setRaw(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const params = new URLSearchParams(location.search);
  const ICON_X = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';

  /* toast */
  const toastEl = $('.toast'); let tt;
  function toast(msg, type) {
    if (!toastEl) return;
    $('[data-toast-msg]', toastEl).textContent = msg;
    toastEl.classList.toggle('is-error', type === 'error');
    toastEl.classList.add('is-show'); clearTimeout(tt);
    tt = setTimeout(() => toastEl.classList.remove('is-show'), 2600);
  }

  /* 02 ------------------------------------------------- preloader & theme */
  const pre = $('.preloader');
  const donePre = () => pre && pre.classList.add('is-done');
  window.addEventListener('load', () => setTimeout(donePre, 350));
  setTimeout(donePre, 2600);

  $$('[data-theme-toggle]').forEach(btn => btn.addEventListener('click', () => {
    const dark = root.classList.toggle('dark');
    store.setRaw('bw-theme', dark ? 'dark' : 'light');
  }));
  $$('[data-dir-toggle]').forEach(btn => btn.addEventListener('click', () => {
    const next = isRTL() ? 'ltr' : 'rtl';
    root.dir = next; root.lang = next === 'rtl' ? 'ar' : 'en';
    store.setRaw('bw-dir', next);
    toast(next === 'rtl' ? 'Right-to-left layout on' : 'Left-to-right layout on');
    window.dispatchEvent(new Event('resize'));
  }));

  /* 03 ----------------------------------------------- header & mobile menu */
  const header = $('.site-header');
  const onScrollHeader = () => header && header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScrollHeader();

  function lockScroll(lock) { document.body.style.overflow = lock ? 'hidden' : ''; }
  const drawer = $('#drawer'), dBackdrop = $('.drawer-backdrop');
  const menuOpeners = $$('[data-drawer-open]');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    dBackdrop && dBackdrop.classList.toggle('is-open', open);
    drawer.inert = !open;
    menuOpeners.forEach(b => b.setAttribute('aria-expanded', String(open)));
    lockScroll(open);
    if (open) { const f = $('a,button', drawer); f && f.focus(); }
  }
  menuOpeners.forEach(b => b.addEventListener('click', () => setDrawer(true)));
  $$('[data-drawer-close]').forEach(b => b.addEventListener('click', () => setDrawer(false)));
  window.addEventListener('resize', () => { if (window.innerWidth >= 1280 && drawer && drawer.classList.contains('is-open')) setDrawer(false); });

  /* 04 ---------------------------------------------- split text & reveal */
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
  const revealables = $$('.reveal, .reveal-left, .reveal-mask, .reveal-split');
  let revealIO = null;
  if ('IntersectionObserver' in window && !reduced) {
    revealIO = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); revealIO.unobserve(en.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(el => revealIO.observe(el));
  } else revealables.forEach(el => el.classList.add('is-in'));
  const revealNow = scope => $$('.reveal, .reveal-left, .reveal-mask, .reveal-split', scope).forEach(el => el.classList.add('is-in'));

  /* 05 ----------------------------------------------------- scroll effects */
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
      const track = $('.hpin-track', sec); if (!track) return;
      if (window.innerWidth < 768) { sec.style.height = ''; track.style.transform = ''; return; }
      const dist = Math.max(0, track.scrollWidth - window.innerWidth);
      sec.dataset.dist = dist; sec.style.height = (window.innerHeight + dist) + 'px';
    });
  }
  let ticking = false;
  function onScroll() {
    const y = window.scrollY, vh = window.innerHeight, wide = window.innerWidth >= 1024;
    onScrollHeader();
    if (rail) { const max = root.scrollHeight - vh; rail.style.transform = `scaleX(${max > 0 ? y / max : 0})`; }
    if (backTop) backTop.classList.toggle('is-show', y > vh);
    if (!reduced) {
      parallax.forEach(el => {
        const r = el.getBoundingClientRect(); const speed = parseFloat(el.dataset.speed);
        el.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -speed).toFixed(1) + 'px');
        el.style.transform = 'translate3d(var(--mxp, 0px), calc(var(--py) + var(--myp, 0px)), 0)';
      });
      stackCards.forEach((card, i) => {
        const next = stackCards[i + 1]; if (!next) return;
        const p = Math.min(1, Math.max(0, 1 - (next.getBoundingClientRect().top - card.getBoundingClientRect().top) / vh));
        card.style.transform = `scale(${1 - p * 0.05})`;
        card.style.filter = `brightness(${1 - p * 0.22})`;
      });
      hpins.forEach(sec => {
        if (window.innerWidth < 768) return;
        const track = $('.hpin-track', sec), r = sec.getBoundingClientRect(), dist = parseFloat(sec.dataset.dist || 0);
        const p = Math.min(1, Math.max(0, -r.top / (r.height - vh || 1)));
        track.style.transform = `translate3d(${(isRTL() ? 1 : -1) * p * dist}px,0,0)`;
        const bar = $('[data-hpin-bar]', sec); if (bar) bar.style.transform = `scaleX(${p})`;
        const loco = $('[data-hpin-loco]', sec); if (loco) loco.style.insetInlineStart = `calc(${p * 100}% - ${p * 32}px)`;
      });
      scaleFrames.forEach(f => {
        if (!wide) { f.style.clipPath = 'none'; return; }
        const r = (f.closest('section') || f.parentElement).getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / (vh * .8)));
        const inset = 5 * (1 - p), rad = 28 * (1 - p);
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
  backTop && backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

  /* 06 ---------------------------------------------------- pointer effects */
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduced && finePointer) {
    $$('[data-mouse-scene]').forEach(scene => {
      const layers = $$('[data-depth]', scene);
      scene.addEventListener('mousemove', e => {
        const r = scene.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        layers.forEach(l => {
          const d = parseFloat(l.dataset.depth);
          l.style.setProperty('--mxp', (x * -d).toFixed(1) + 'px');
          l.style.setProperty('--myp', (y * -d * .6).toFixed(1) + 'px');
          if (!l.hasAttribute('data-speed')) l.style.transform = 'translate3d(var(--mxp), var(--myp), 0)';
        });
      });
    });
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(900px) rotateX(${(.5 - y) * 5}deg) rotateY(${(x - .5) * 7}deg) translateY(-4px)`;
        card.style.setProperty('--mx', x * 100 + '%'); card.style.setProperty('--my', y * 100 + '%');
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* 07 ------------------------------ flap board, marquee, counters, scrub */
  $$('[data-flap]').forEach(board => {
    const msgs = JSON.parse(board.dataset.flap); const row = $('.flap-row', board);
    const len = Math.max(...msgs.map(m => m.length));
    const chars = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-/$';
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
  $$('.marquee-track').forEach(t => { t.innerHTML += t.innerHTML; Array.from(t.children).slice(t.children.length / 2).forEach(c => c.setAttribute('aria-hidden', 'true')); });

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

  const scrubs = $$('[data-scrub]');
  scrubs.forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = `<span class="sr-only">${esc(words.join(' '))}</span>` + words.map(w => `<span class="scrub-w" aria-hidden="true">${esc(w)}</span>`).join(' ');
  });
  function scrubUpdate() {
    const vh = window.innerHeight;
    scrubs.forEach(el => {
      const r = el.getBoundingClientRect();
      const p = reduced ? 1 : Math.min(1, Math.max(0, (vh * .85 - r.top) / (vh * .6)));
      const ws = el.querySelectorAll('.scrub-w'), n = ws.length;
      for (let i = 0; i < n; i++) ws[i].classList.toggle('is-lit', i / n < p);
    });
  }
  if (scrubs.length) { window.addEventListener('scroll', scrubUpdate, { passive: true }); scrubUpdate(); }

  /* 08 ------------------------------------ filters, search & pagination */
  $$('[data-filter-scope]').forEach(scope => {
    const items = $$('[data-item]', scope);
    const chips = $$('[data-filter]', scope);
    const search = $('[data-search]', scope);
    const cat = $('[data-category]', scope);
    const sort = $('[data-sort]', scope);
    const empty = $('[data-empty]', scope);
    const counts = $$('[data-result-count]', scope);
    const range = $('[data-range]', scope);
    const grid = $('[data-grid]', scope);
    const pager = $('[data-pagination]', scope);
    const perPage = parseInt(scope.dataset.perPage || '0', 10);
    let active = 'all', page = 1, inited = false;

    const norm = t => (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    function matches(it, q) {
      if (!q) return true;
      const hay = norm(it.dataset.title + ' ' + (it.dataset.keywords || ''));
      return q.split(/\s+/).every(w => hay.includes(w));
    }
    function setChip(key) {
      const target = chips.find(c => c.dataset.filter === key) ? key : 'all';
      chips.forEach(x => { const on = x.dataset.filter === target; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
      active = target;
    }
    function renderPager(total) {
      if (!pager) return;
      const pages = perPage ? Math.max(1, Math.ceil(total / perPage)) : 1;
      pager.hidden = pages <= 1;
      if (pages <= 1) { pager.innerHTML = ''; return; }
      const prev = isRTL() ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6', next = isRTL() ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6';
      const svg = d => `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
      let html = `<button type="button" class="icon-btn inline-flex" data-page="${page - 1}" aria-label="Previous page"${page === 1 ? ' disabled' : ''}>${svg(prev)}</button>`;
      for (let i = 1; i <= pages; i++) html += `<button type="button" class="icon-btn inline-flex font-bold${i === page ? ' is-current' : ''}" data-page="${i}" aria-label="Page ${i}"${i === page ? ' aria-current="page"' : ''}>${i}</button>`;
      html += `<button type="button" class="icon-btn inline-flex" data-page="${page + 1}" aria-label="Next page"${page === pages ? ' disabled' : ''}>${svg(next)}</button>`;
      pager.innerHTML = html;
    }
    function apply(resetPage = true, scroll = false) {
      if (resetPage) page = 1;
      const q = norm(search && search.value.trim());
      const c = cat ? cat.value : 'all';
      const visible = [];
      items.forEach(it => {
        const okF = active === 'all' || (it.dataset.tags || '').split(' ').includes(active);
        const okC = c === 'all' || it.dataset.cat === c;
        const ok = okF && okC && matches(it, q);
        if (ok) visible.push(it);
        it.hidden = true;
      });
      const order = Array.from(grid ? grid.children : []).filter(el => visible.includes(el));
      const pages = perPage ? Math.max(1, Math.ceil(order.length / perPage)) : 1;
      page = Math.min(Math.max(1, page), pages);
      const start = perPage ? (page - 1) * perPage : 0, end = perPage ? start + perPage : order.length;
      order.forEach((it, i) => { if (i >= start && i < end) { it.hidden = false; if (inited) it.classList.add('is-in'); } });
      if (empty) empty.hidden = order.length !== 0;
      counts.forEach(n => n.textContent = order.length);
      if (range) range.textContent = order.length ? `${start + 1}–${Math.min(end, order.length)}` : '0';
      renderPager(order.length);
      if (scroll) scope.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }
    chips.forEach(ch => ch.addEventListener('click', () => { setChip(ch.dataset.filter); apply(); }));
    if (search) {
      search.addEventListener('input', () => apply());
      search.addEventListener('search', () => apply());
      const f = search.closest('form'); if (f) f.addEventListener('submit', e => { e.preventDefault(); apply(); });
      search.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); apply(); } });
    }
    cat && cat.addEventListener('change', () => apply());
    sort && sort.addEventListener('change', () => {
      const v = sort.value;
      items.slice().sort((a, b) => {
        if (v === 'low') return a.dataset.price - b.dataset.price;
        if (v === 'high') return b.dataset.price - a.dataset.price;
        if (v === 'name') return a.dataset.title.localeCompare(b.dataset.title);
        return a.dataset.order - b.dataset.order;
      }).forEach(it => grid.appendChild(it));
      apply();
    });
    $$('[data-view]', scope).forEach(btn => btn.addEventListener('click', () => {
      $$('[data-view]', scope).forEach(b => { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('is-active'); btn.setAttribute('aria-pressed', 'true');
      grid.classList.toggle('is-list', btn.dataset.view === 'list');
    }));
    $$('[data-clear]', scope).forEach(b => b.addEventListener('click', () => {
      if (search) search.value = ''; if (cat) cat.value = 'all'; setChip('all'); apply();
    }));
    pager && pager.addEventListener('click', e => {
      const b = e.target.closest('[data-page]'); if (!b || b.disabled) return;
      page = parseInt(b.dataset.page, 10); apply(false, true);
    });
    /* URL parameters: ?scale=ho  ?cat=locomotives  ?q=decoder */
    const pScale = params.get('scale'), pCat = params.get('cat'), pQ = params.get('q');
    if (pScale) setChip(pScale.toLowerCase());
    if (pCat) {
      if (cat && $$('option', cat).some(o => o.value === pCat)) cat.value = pCat;
      else if (chips.some(c => c.dataset.filter === pCat)) setChip(pCat);
    }
    if (pQ && search) search.value = pQ;
    apply(); inited = true;
    if ((pScale || pCat || pQ) && location.hash) setTimeout(() => { const t = $(location.hash); t && t.scrollIntoView(); }, 300);
  });

  /* 09 ------------------------------- tabs, gallery, quantity, options */
  $$('[data-tabs]').forEach(tabs => {
    const btns = $$('[role="tab"]', tabs);
    function select(b, focus) {
      btns.forEach(x => {
        const on = x === b;
        x.classList.toggle('is-active', on); x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
        const panel = $('#' + x.getAttribute('aria-controls')); if (panel) panel.hidden = !on;
      });
      const panel = $('#' + b.getAttribute('aria-controls'));
      if (panel) revealNow(panel);
      if (focus) b.focus();
    }
    btns.forEach((b, i) => {
      b.addEventListener('click', () => select(b));
      b.addEventListener('keydown', e => {
        const dir = (e.key === 'ArrowRight') !== isRTL() ? 1 : -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(btns[(i + dir + btns.length) % btns.length], true); }
      });
    });
    $$('[data-open-tab]').forEach(a => a.addEventListener('click', e => {
      const b = $('#' + a.dataset.openTab); if (!b) return;
      e.preventDefault(); select(b); tabs.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }));
  });

  $$('[data-gallery]').forEach(g => {
    const main = $('[data-gallery-main]', g);
    $$('[data-thumb]', g).forEach(t => t.addEventListener('click', () => {
      $$('[data-thumb]', g).forEach(x => { x.classList.remove('ring-2'); x.setAttribute('aria-pressed', 'false'); });
      t.classList.add('ring-2'); t.setAttribute('aria-pressed', 'true');
      main.style.opacity = 0;
      setTimeout(() => { main.src = t.dataset.thumb; main.style.opacity = 1; }, 200);
    }));
    const box = main && main.parentElement;
    if (box && finePointer) {
      box.addEventListener('mousemove', e => {
        const r = box.getBoundingClientRect();
        main.style.transformOrigin = `${(e.clientX - r.left) / r.width * 100}% ${(e.clientY - r.top) / r.height * 100}%`;
        main.style.transform = 'scale(1.6)';
      });
      box.addEventListener('mouseleave', () => { main.style.transform = ''; });
    }
  });
  $$('[data-qty]').forEach(q => {
    const input = $('input', q), max = parseInt(input.max || '99', 10);
    const clamp = v => Math.min(max, Math.max(1, parseInt(v, 10) || 1));
    $('[data-qty-minus]', q).addEventListener('click', () => input.value = clamp(+input.value - 1));
    $('[data-qty-plus]', q).addEventListener('click', () => input.value = clamp(+input.value + 1));
    input.addEventListener('change', () => input.value = clamp(input.value));
  });
  $$('[data-options]').forEach(group => {
    const pills = $$('button', group);
    pills.forEach(p => p.addEventListener('click', () => {
      pills.forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
      p.classList.add('is-active'); p.setAttribute('aria-pressed', 'true');
      const price = group.dataset.priceTarget && $(group.dataset.priceTarget);
      if (price && p.dataset.price) price.textContent = '$' + p.dataset.price;
      const hidden = group.parentElement.querySelector('input[type=hidden]'); if (hidden) hidden.value = p.textContent.trim();
    }));
  });

  /* 10 ---------------------------------------------- cart & wishlist */
  const CART_KEY = 'bw-cart-v2', WISH_KEY = 'bw-wish', FREE_SHIP = 150;
  let cart = store.get(CART_KEY, []);
  if (!Array.isArray(cart)) cart = [];
  // memberships are subscriptions, never cart items — drop any saved by older versions
  cart = cart.filter(i => i && !String(i.id || '').startsWith('club-'));
  store.set(CART_KEY, cart);
  const saveCart = () => { store.set(CART_KEY, cart); renderCart(); };
  const cartQty = () => cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = () => cart.reduce((s, i) => s + i.qty * i.price, 0);

  function addToCart(item, qty) {
    const found = cart.find(i => i.key === item.key);
    if (found) found.qty = Math.min(20, found.qty + qty); else cart.push(Object.assign({}, item, { qty }));
    saveCart();
  }
  function itemRow(i, compact) {
    return `<li class="flex gap-4 py-4" data-key="${esc(i.key)}">
      ${i.img ? `<img src="${esc(i.img)}" alt="" width="72" height="72" class="w-[72px] h-[72px] rounded-xl object-cover bg-surface shrink-0" onerror="this.style.visibility='hidden'">` : '<span class="w-[72px] h-[72px] rounded-xl bg-surface shrink-0"></span>'}
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-3"><p class="font-semibold leading-snug">${esc(i.name)}</p><p class="font-display text-lg shrink-0">${money(i.price * i.qty)}</p></div>
        ${i.meta ? `<p class="text-xs text-muted mt-0.5">${esc(i.meta)}</p>` : ''}
        ${compact ? `<p class="text-sm text-muted mt-1">Qty ${i.qty} &times; ${money(i.price)}</p>` : `
        <div class="mt-3 flex items-center justify-between gap-3">
          <div class="flex items-center rounded-full border border-line/15">
            <button type="button" class="w-9 h-9 grid place-items-center" data-cart-dec aria-label="Decrease quantity of ${esc(i.name)}">&minus;</button>
            <span class="w-8 text-center font-bold text-sm" aria-live="polite">${i.qty}</span>
            <button type="button" class="w-9 h-9 grid place-items-center" data-cart-inc aria-label="Increase quantity of ${esc(i.name)}">+</button>
          </div>
          <button type="button" class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-signal" data-cart-remove aria-label="Remove ${esc(i.name)}">${ICON_X} Remove</button>
        </div>`}
      </div></li>`;
  }
  function renderCart() {
    const qty = cartQty(), sub = cartSubtotal();
    $$('[data-cart-count]').forEach(c => { c.textContent = qty; c.classList.toggle('hidden', qty === 0); c.classList.toggle('grid', qty > 0); });
    $$('[data-cart-qty]').forEach(c => c.textContent = qty);
    $$('[data-cart-subtotal]').forEach(c => c.textContent = money(sub));
    const list = $('[data-cart-items]');
    if (list) list.innerHTML = cart.length ? `<ul class="divide-y divide-line/10">${cart.map(i => itemRow(i)).join('')}</ul>` : '';
    const emptyEl = $('[data-cart-empty]'), foot = $('[data-cart-footer]'), meter = $('[data-ship-meter]');
    if (emptyEl) { emptyEl.classList.toggle('hidden', cart.length > 0); emptyEl.classList.toggle('flex', cart.length === 0); }
    if (list) list.classList.toggle('hidden', cart.length === 0);
    if (foot) foot.classList.toggle('hidden', cart.length === 0);
    if (meter) {
      meter.classList.toggle('hidden', cart.length === 0);
      const pct = Math.min(100, sub / FREE_SHIP * 100);
      $('[data-ship-bar]', meter).style.width = pct + '%';
      $('[data-ship-loco]', meter).style.insetInlineStart = `calc(${pct}% - ${pct * .24}px)`;
      $('[data-ship-text]', meter).innerHTML = sub >= FREE_SHIP ? '<strong class="text-brass">You\'ve unlocked free shipping.</strong>' : `Add <strong>${money(FREE_SHIP - sub)}</strong> more for free shipping`;
    }
    renderCheckout();
  }
  /* side panels (cart + wishlist) share one open/close system */
  let lastFocus = null;
  const panels = {
    cart: { el: $('#cart-drawer'), bd: $('.cart-backdrop'), openers: '[data-cart-open]', closeBtn: '[data-cart-close]' },
    wish: { el: $('#wish-drawer'), bd: $('.wish-backdrop'), openers: '[data-wish-open]', closeBtn: '[data-wish-close]' }
  };
  const isOpen = k => panels[k].el && panels[k].el.classList.contains('is-open');
  function setPanel(key, open) {
    const p = panels[key];
    if (!p.el) { if (open) location.href = key === 'cart' ? 'checkout.html' : 'wishlist.html'; return; }
    if (open) {
      if (!Object.keys(panels).some(isOpen)) lastFocus = document.activeElement;
      setDrawer(false);
      Object.keys(panels).forEach(k => { if (k !== key && isOpen(k)) setPanel(k, false, true); });
    }
    p.el.classList.toggle('is-open', open);
    p.bd && p.bd.classList.toggle('is-open', open);
    p.el.inert = !open;
    $$(p.openers).forEach(b => b.setAttribute('aria-expanded', String(open)));
    lockScroll(open);
    if (open) setTimeout(() => { const b = $(p.closeBtn, p.el); b && b.focus(); }, 60);
    else if (!arguments[2] && lastFocus) { lastFocus.focus(); lastFocus = null; }
  }
  const setCart = open => setPanel('cart', open);
  const setWishPanel = open => setPanel('wish', open);
  Object.keys(panels).forEach(k => {
    $$(panels[k].openers).forEach(b => b.addEventListener('click', () => setPanel(k, true)));
    $$(panels[k].closeBtn).forEach(b => b.addEventListener('click', () => setPanel(k, false)));
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = Object.keys(panels).find(isOpen);
    if (open) setPanel(open, false); else setDrawer(false);
  });
  document.addEventListener('click', e => {
    const row = e.target.closest('[data-key]'); if (!row || !e.target.closest('[data-cart-inc],[data-cart-dec],[data-cart-remove]')) return;
    const item = cart.find(i => i.key === row.dataset.key); if (!item) return;
    if (e.target.closest('[data-cart-inc]')) item.qty = Math.min(20, item.qty + 1);
    if (e.target.closest('[data-cart-dec]')) item.qty -= 1;
    if (e.target.closest('[data-cart-remove]') || item.qty < 1) { cart = cart.filter(i => i !== item); toast('Item removed from cart'); }
    saveCart();
  });
  const bump = sel => $$(sel).forEach(c => c.animate && c.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 400 }));
  let billingMode = 'monthly';
  $$('[data-add-cart]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    let price = parseFloat(b.dataset.price), meta = b.dataset.meta || '', name = b.dataset.name;
    const optGroup = b.dataset.optionFrom && $(b.dataset.optionFrom);
    if (optGroup) { const sel = $('.is-active', optGroup); if (sel) { price = parseFloat(sel.dataset.price); meta = (meta ? meta + ' · ' : '') + sel.textContent.trim(); } }
    const qtyInput = b.dataset.qtyFrom && $(b.dataset.qtyFrom);
    const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value, 10) || 1) : 1;
    addToCart({ key: b.dataset.id + '|' + meta, id: b.dataset.id, name, price, img: b.dataset.img || '', meta }, qty);
    b.classList.add('is-added'); setTimeout(() => b.classList.remove('is-added'), 900);
    toast(`${qty > 1 ? qty + ' × ' : ''}${name} added to cart`);
    bump('[data-cart-count]');
    setCart(true);
  }));

  /* wishlist — items saved with name, price, image and scale so they can be viewed anywhere */
  let wish = store.get(WISH_KEY, []); if (!Array.isArray(wish)) wish = [];
  const wishFromBtn = b => ({ id: b.dataset.wish, name: b.dataset.name || '', price: parseFloat(b.dataset.price) || 0, img: b.dataset.img || '', meta: b.dataset.meta || '', href: 'product-details.html' });
  /* migrate v1.1 lists (plain ids) using any matching button on this page */
  wish = wish.map(w => {
    if (typeof w !== 'string') return w;
    const b = $(`[data-wish="${w}"][data-name]`); return b ? wishFromBtn(b) : null;
  }).filter(Boolean);
  const saveWish = () => { store.set(WISH_KEY, wish); renderWish(); };
  const inWish = id => wish.some(w => w.id === id);
  const heart = filled => `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;
  const bagIcon = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
  function wishRow(w) {
    return `<li class="flex gap-4 py-4" data-wish-row="${esc(w.id)}">
      ${w.img ? `<img src="${esc(w.img)}" alt="" width="72" height="72" class="w-[72px] h-[72px] rounded-xl object-cover bg-surface shrink-0" onerror="this.style.visibility='hidden'">` : '<span class="w-[72px] h-[72px] rounded-xl bg-surface shrink-0"></span>'}
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-3"><a href="${esc(w.href)}" class="font-semibold leading-snug hover:text-brass">${esc(w.name)}</a><p class="font-display text-lg shrink-0">${money(w.price)}</p></div>
        ${w.meta ? `<p class="text-xs text-muted mt-0.5">${esc(w.meta)}</p>` : ''}
        <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button type="button" class="btn btn-ink btn-sm inline-flex" data-wish-move aria-label="Move ${esc(w.name)} to cart">${bagIcon} Move to cart</button>
          <button type="button" class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-signal" data-wish-remove aria-label="Remove ${esc(w.name)} from wishlist">${ICON_X} Remove</button>
        </div>
      </div></li>`;
  }
  function wishCard(w) {
    return `<article class="group flex flex-col h-full rounded-2xl bg-card border border-line/10 overflow-hidden" data-wish-row="${esc(w.id)}">
      <a href="${esc(w.href)}" class="relative block aspect-[4/3] bg-surface zoom-img" tabindex="-1" aria-hidden="true">${w.img ? `<img src="${esc(w.img)}" alt="" width="400" height="300" class="w-full h-full object-cover" onerror="this.style.visibility='hidden'">` : ''}
        ${w.meta ? `<span class="absolute top-3 start-3 rounded-full bg-night/80 text-cream backdrop-blur font-mono text-[.66rem] tracking-[.16em] uppercase px-2.5 py-1">${esc(w.meta)}</span>` : ''}</a>
      <div class="flex flex-col flex-1 p-5">
        <h3 class="font-display text-[1.2rem] leading-snug line-clamp-2"><a href="${esc(w.href)}" class="hover:text-brass transition">${esc(w.name)}</a></h3>
        <p class="mt-2 font-display text-2xl">${money(w.price)}</p>
        <div class="mt-auto pt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/10">
          <button type="button" class="btn btn-ink btn-sm inline-flex" data-wish-move aria-label="Move ${esc(w.name)} to cart">${bagIcon} Move to cart</button>
          <button type="button" class="icon-btn inline-flex text-signal" data-wish-remove aria-label="Remove ${esc(w.name)} from wishlist" title="Remove">${heart(true)}</button>
        </div>
      </div></article>`;
  }
  function renderWish() {
    const n = wish.length, total = wish.reduce((s, w) => s + w.price, 0);
    $$('[data-wish]').forEach(b => {
      const on = inWish(b.dataset.wish), nm = b.dataset.name || 'item';
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', `${on ? 'Remove' : 'Add'} ${nm} ${on ? 'from' : 'to'} wishlist`);
      b.title = on ? 'Saved to wishlist' : 'Add to wishlist';
    });
    $$('[data-wish-count]').forEach(c => { c.textContent = n; c.classList.toggle('hidden', n === 0); c.classList.toggle('grid', n > 0); });
    $$('[data-wish-qty]').forEach(c => c.textContent = n);
    $$('[data-wish-total]').forEach(c => c.textContent = money(total));
    const list = $('[data-wish-items]'), emptyEl = $('[data-wish-empty]'), foot = $('[data-wish-footer]');
    if (list) { list.innerHTML = n ? `<ul class="divide-y divide-line/10">${wish.map(wishRow).join('')}</ul>` : ''; list.classList.toggle('hidden', !n); }
    if (emptyEl) { emptyEl.classList.toggle('hidden', n > 0); emptyEl.classList.toggle('flex', n === 0); }
    if (foot) foot.classList.toggle('hidden', !n);
    const grid = $('[data-wish-grid]'), pEmpty = $('[data-wish-page-empty]'), bar = $('[data-wish-toolbar]');
    if (grid) { grid.innerHTML = wish.map(wishCard).join(''); grid.classList.toggle('hidden', !n); }
    if (pEmpty) pEmpty.classList.toggle('hidden', n > 0);
    if (bar) $$('button', bar).forEach(b => b.disabled = !n);
  }
  function moveToCart(w) {
    addToCart({ key: w.id + '|' + w.meta, id: w.id, name: w.name, price: w.price, img: w.img, meta: w.meta }, 1);
    wish = wish.filter(x => x.id !== w.id); saveWish();
  }
  $$('[data-wish]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    const id = b.dataset.wish, on = !inWish(id);
    wish = on ? wish.concat(wishFromBtn(b)) : wish.filter(x => x.id !== id);
    saveWish(); bump('[data-wish-count]');
    toast(on ? `${b.dataset.name || 'Item'} saved to your wishlist` : 'Removed from wishlist');
  }));
  document.addEventListener('click', e => {
    const row = e.target.closest('[data-wish-row]'); if (!row) return;
    const w = wish.find(x => x.id === row.dataset.wishRow); if (!w) return;
    if (e.target.closest('[data-wish-move]')) { moveToCart(w); toast(`${w.name} moved to cart`); bump('[data-cart-count]'); }
    else if (e.target.closest('[data-wish-remove]')) { wish = wish.filter(x => x !== w); saveWish(); toast('Removed from wishlist'); }
  });
  $$('[data-wish-all]').forEach(b => b.addEventListener('click', () => {
    if (!wish.length) return;
    const n = wish.length; wish.slice().forEach(moveToCart);
    toast(`${n} item${n > 1 ? 's' : ''} moved to cart`); setCart(true);
  }));
  $$('[data-wish-clear]').forEach(b => b.addEventListener('click', () => { wish = []; saveWish(); toast('Wishlist cleared'); }));
  renderWish();
  store.set(WISH_KEY, wish);

  /* 11 ------------------------------------------ checkout & success */
  const co = $('[data-checkout-form]');
  const PROMO = 'ALLABOARD';
  let promo = store.raw('bw-promo') === PROMO;
  function shippingCost(sub) {
    const m = co ? (new FormData(co).get('delivery') || 'standard') : 'standard';
    if (m === 'express') return 19.95;
    if (m === 'collect') return 0;
    return sub >= FREE_SHIP || sub === 0 ? 0 : 9.95;
  }
  function totals() {
    const sub = cartSubtotal(), ship = shippingCost(sub), disc = promo ? sub * .1 : 0, tax = (sub - disc) * .08;
    return { sub, ship, disc, tax, total: sub - disc + ship + tax };
  }
  function renderCheckout() {
    if (!co) return;
    const main = $('[data-checkout-main]'), emptyEl = $('[data-checkout-empty]'), success = $('[data-checkout-success]');
    if (success && !success.classList.contains('hidden')) return;
    const has = cart.length > 0;
    main.classList.toggle('hidden', !has); emptyEl.classList.toggle('hidden', has);
    const list = $('[data-checkout-items]'); if (list) list.innerHTML = cart.map(i => itemRow(i, true)).join('');
    const t = totals();
    $$('[data-co-subtotal]').forEach(e => e.textContent = money(t.sub));
    $$('[data-co-shipping]').forEach(e => e.textContent = t.ship ? money(t.ship) : 'Free');
    $$('[data-co-tax]').forEach(e => e.textContent = money(t.tax));
    $$('[data-co-total]').forEach(e => e.textContent = money(t.total));
    const dr = $('[data-co-discount-row]'); if (dr) { dr.hidden = !promo; $('[data-co-discount]').textContent = '−' + money(t.disc); }
    setStep(has ? 1 : 0);
  }
  function setStep(n) {
    $$('[data-step]').forEach(s => { const i = +s.dataset.step; s.classList.toggle('is-done', i < n); s.classList.toggle('is-current', i === n); if (i === n) s.setAttribute('aria-current', 'step'); else s.removeAttribute('aria-current'); });
    const bar = $('[data-stepper-bar]'); if (bar) bar.style.transform = `scaleX(${Math.min(1, n / 2)})`;
  }
  if (co) {
    co.addEventListener('change', e => {
      if (e.target.name === 'delivery') {
        const collect = e.target.value === 'collect';
        $$('[data-ship-required]', co).forEach(f => { f.required = !collect; f.closest('div').classList.toggle('opacity-50', collect); if (collect) clearError(f); });
      }
      if (e.target.name === 'pay') {
        const card = e.target.value === 'card';
        const box = $('[data-card-fields]'); box.classList.toggle('hidden', !card);
        $$('[data-card-required]', co).forEach(f => { f.required = card; if (!card) clearError(f); });
      }
      renderCheckout();
    });
    const pf = $('[data-promo]');
    pf && pf.addEventListener('submit', e => {
      e.preventDefault();
      const v = $('input', pf).value.trim().toUpperCase(), msg = $('[data-promo-msg]');
      if (v === PROMO) { promo = true; store.setRaw('bw-promo', PROMO); msg.textContent = '10% off applied — welcome aboard!'; msg.className = 'mt-2 text-sm text-brass font-semibold'; }
      else { msg.textContent = v ? 'That code isn\'t valid.' : 'Enter a promo code.'; msg.className = 'mt-2 text-sm text-signal font-semibold'; }
      renderCheckout();
    });
    co.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateForm(co)) { toast('Please check the highlighted fields', 'error'); return; }
      const fd = new FormData(co), t = totals();
      const method = { standard: 'Standard delivery', express: 'Express delivery', collect: 'Click & collect' }[fd.get('delivery')];
      const days = { standard: 4, express: 1, collect: 0 }[fd.get('delivery')];
      const eta = new Date(); eta.setDate(eta.getDate() + days);
      const order = 'BW-' + String(Date.now()).slice(-6);
      const s = $('[data-checkout-success]');
      $('[data-s-name]', s).textContent = fd.get('first') || 'friend';
      $('[data-s-email]', s).textContent = fd.get('email');
      $('[data-s-order]', s).textContent = order;
      $('[data-s-date]', s).textContent = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
      $('[data-s-method]', s).textContent = method;
      $('[data-s-eta]', s).textContent = days === 0 ? 'Ready in 2 hours' : eta.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
      $('[data-s-items]', s).textContent = cartQty();
      $('[data-s-total]', s).textContent = money(t.total);
      $('[data-s-list]', s).innerHTML = cart.map(i => itemRow(i, true)).join('');
      $('[data-checkout-main]').classList.add('hidden');
      s.classList.remove('hidden'); s.classList.add('is-shown');
      setStep(3);
      store.set('bw-last-order', { order, total: t.total, items: cart });
      cart = []; promo = false; store.setRaw('bw-promo', ''); store.set(CART_KEY, cart);
      renderCart();
      s.focus({ preventScroll: true });
      $('[data-stepper]').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      toast('Order ' + order + ' confirmed');
    });
  }
  renderCart();

  /* 12 -------------------------------------------------- form helpers */
  $$('[data-phone]').forEach(f => {
    f.addEventListener('input', () => {
      const v = f.value, plus = v.trim().startsWith('+');
      const clean = (plus ? '+' : '') + v.replace(/\D/g, '').slice(0, 15);
      if (clean !== v) f.value = clean;
    });
    f.addEventListener('keypress', e => { if (e.key.length === 1 && !/[0-9+]/.test(e.key)) e.preventDefault(); });
  });
  // names: letters (any alphabet), spaces, apostrophes, hyphens and dots only — no numbers or symbols
  const ALPHA_BAD = /[^\p{L}\p{M}\s'.\-]/gu;
  $$('[data-alpha]').forEach(f => {
    f.addEventListener('input', () => { const c = f.value.replace(ALPHA_BAD, '').replace(/\s{2,}/g, ' '); if (c !== f.value) f.value = c; });
    f.addEventListener('beforeinput', e => { if (e.inputType === 'insertText' && e.data && e.data.length === 1 && /[^\p{L}\p{M}\s'.\-]/u.test(e.data)) { e.preventDefault(); toast('Only letters are allowed in this field', 'error'); } });
  });
  $$('[data-digits]').forEach(f => f.addEventListener('input', () => { const c = f.value.replace(/\D/g, ''); if (c !== f.value) f.value = c; }));
  $$('[data-card-number]').forEach(f => f.addEventListener('input', () => { f.value = f.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '); }));
  $$('[data-expiry]').forEach(f => f.addEventListener('input', () => { let d = f.value.replace(/\D/g, '').slice(0, 4); if (d.length >= 3) d = d.slice(0, 2) + '/' + d.slice(2); f.value = d; }));

  function fieldError(f) {
    const v = (f.value || '').trim();
    if (f.type === 'checkbox') return f.required && !f.checked ? 'Please tick this box to continue.' : '';
    if (f.required && !v) return 'This field is required.';
    if (!v) return '';
    if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address.';
    if (f.hasAttribute('data-phone')) { const n = v.replace(/\D/g, '').length; if (n < 9 || n > 15) return 'Enter a valid mobile number (9 to 15 digits, numbers only).'; }
    if (f.hasAttribute('data-card-number') && v.replace(/\D/g, '').length !== 16) return 'Enter the 16-digit card number.';
    if (f.hasAttribute('data-expiry')) {
      const m = v.match(/^(\d{2})\/(\d{2})$/); if (!m || +m[1] < 1 || +m[1] > 12) return 'Use the format MM/YY.';
      const exp = new Date(2000 + +m[2], +m[1], 0, 23, 59); if (exp < new Date()) return 'This card has expired.';
    }
    if (f.hasAttribute('data-alpha')) { if (/[^\p{L}\p{M}\s'.\-]/u.test(v)) return 'Letters only — numbers and symbols are not allowed.'; if (f.required && v.replace(/[^\p{L}]/gu, '').length < 2) return 'Enter at least 2 letters.'; }
    if (f.dataset.min && v.length < +f.dataset.min) return `Enter at least ${f.dataset.min} digits.`;
    if (f.pattern && !new RegExp('^(?:' + f.pattern + ')$').test(v)) return 'Please match the requested format.';
    return '';
  }
  function setError(f, msg) {
    const wrap = f.type === 'checkbox' ? f.closest('label') : (f.closest('.relative') || f);
    let el = f._err;
    if (!el) { el = document.createElement('p'); el.className = 'field-error'; el.id = (f.id || 'f' + Math.random().toString(36).slice(2)) + '-err'; wrap.insertAdjacentElement('afterend', el); f._err = el; }
    el.textContent = msg; el.hidden = !msg;
    f.classList.toggle('is-invalid', !!msg); f.setAttribute('aria-invalid', String(!!msg));
    if (msg) f.setAttribute('aria-describedby', el.id); else f.removeAttribute('aria-describedby');
  }
  function clearError(f) { if (f._err) setError(f, ''); else { f.classList.remove('is-invalid'); f.removeAttribute('aria-invalid'); } }
  function validateForm(form) {
    let first = null;
    $$('input, textarea, select', form).forEach(f => {
      if (f.type === 'hidden' || f.disabled || f.closest('.hidden')) return;
      const msg = fieldError(f);
      if (msg || f._err || f.classList.contains('is-invalid')) setError(f, msg);
      if (msg && !first) first = f;
    });
    if (first) { first.focus({ preventScroll: true }); first.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); }
    return !first;
  }
  document.addEventListener('blur', e => {
    const f = e.target; if (!f.form || !(f.form.hasAttribute('data-demo') || f.form.hasAttribute('data-checkout-form'))) return;
    if (f.matches('input, textarea, select') && (f.value || f._err)) setError(f, fieldError(f));
  }, true);
  document.addEventListener('input', e => { const f = e.target; if (f._err && !f._err.hidden) setError(f, fieldError(f)); });
  $$('form[data-demo]').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) { toast('Please check the highlighted fields', 'error'); return; }
    toast(form.dataset.demo || 'Thank you — we will be in touch shortly');
    form.reset();
    $$('[data-options] button', form).forEach((b, i) => { b.classList.toggle('is-active', i === 0); });
  }));

  /* 13 --------------------------------- pricing, estimator, before/after */
  $$('[data-billing]').forEach(sw => {
    const btns = $$('button', sw);
    btns.forEach(b => b.addEventListener('click', () => {
      btns.forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('is-active'); b.setAttribute('aria-pressed', 'true');
      billingMode = b.dataset.mode;
      const yearly = billingMode === 'yearly';
      $$('[data-monthly]').forEach(p => p.textContent = yearly ? p.dataset.yearly : p.dataset.monthly);
      $$('[data-period]').forEach(p => p.textContent = yearly ? '/year' : '/month');
    }));
  });
  const jm = $('#join-modal');
  if (jm) {
    const jf = $('[data-join-form]', jm); let opener = null, plan = null;
    const step = s => $$('[data-join-step]', jm).forEach(x => x.classList.toggle('hidden', x.dataset.joinStep !== s));
    const close = () => { jm.close(); };
    jm.addEventListener('close', () => { if (opener) opener.focus({ preventScroll: true }); });
    $$('[data-join]').forEach(b => b.addEventListener('click', () => {
      opener = b; plan = b.dataset.planName;
      const yearly = billingMode === 'yearly';
      $$('[data-join-plan]', jm).forEach(x => x.textContent = plan);
      $('[data-join-price]', jm).textContent = '$' + (yearly ? b.dataset.priceYearly : b.dataset.priceMonthly);
      $('[data-join-period]', jm).textContent = yearly ? 'per year' : 'per month';
      jf.reset(); $$('input', jf).forEach(clearError); step('form');
      jm.showModal(); $('#j-name', jm).focus();
    }));
    $$('[data-join-close]', jm).forEach(b => b.addEventListener('click', close));
    jm.addEventListener('click', e => { if (e.target === jm) close(); });
    jf.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateForm(jf)) { toast('Please check the highlighted fields', 'error'); return; }
      $('[data-join-who]', jm).textContent = $('#j-name', jm).value.trim().split(/\s+/)[0];
      $('[data-join-email]', jm).textContent = $('#j-email', jm).value.trim();
      step('done'); $('[data-join-step="done"]', jm).focus();
      toast(plan + ' membership confirmed');
    });
  }
  const est = $('[data-estimator]');
  if (est) {
    const out = $('[data-estimate]'), weeks = $('[data-weeks]'), areas = $$('[data-area-out]');
    const calc = () => {
      const f = new FormData(est);
      const scale = parseFloat(f.get('scale') || 1), size = parseFloat(f.get('size') || 6), detail = parseFloat(f.get('detail') || 1);
      const extras = f.getAll('extra').reduce((s, v) => s + parseFloat(v), 0);
      out.textContent = '$' + (Math.round((size * 380 * scale * detail + extras) / 50) * 50).toLocaleString('en-US');
      weeks.textContent = Math.max(3, Math.round(size * 0.9 * detail));
      areas.forEach(a => a.textContent = size + ' m²');
    };
    est.addEventListener('input', calc); est.addEventListener('change', calc); calc();
    est.addEventListener('submit', e => e.preventDefault());
  }
  $$('.ba').forEach(ba => {
    const r = $('input[type=range]', ba);
    const set = () => ba.style.setProperty('--pos', r.value + '%');
    r.addEventListener('input', set); set();
  });

  /* 14 ---------------------------------------- countdown, carousel, misc */
  $$('[data-countdown]').forEach(cd => {
    const target = new Date(cd.dataset.countdown).getTime();
    const parts = { d: $('[data-d]', cd), h: $('[data-h]', cd), m: $('[data-m]', cd), s: $('[data-s]', cd) };
    const pad = n => String(n).padStart(2, '0');
    const upd = () => {
      let diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 864e5); diff -= d * 864e5;
      const h = Math.floor(diff / 36e5); diff -= h * 36e5;
      const m = Math.floor(diff / 6e4); diff -= m * 6e4;
      parts.d.textContent = pad(d); parts.h.textContent = pad(h); parts.m.textContent = pad(m); parts.s.textContent = pad(Math.floor(diff / 1e3));
    };
    upd(); setInterval(upd, 1000);
  });
  $$('[data-carousel]').forEach(c => {
    const track = $('[data-carousel-track]', c);
    const step = () => { const card = track.firstElementChild; return card ? card.getBoundingClientRect().width + 24 : 320; };
    $$('[data-next]', c).forEach(b => b.addEventListener('click', () => track.scrollBy({ left: (isRTL() ? -1 : 1) * step(), behavior: reduced ? 'auto' : 'smooth' })));
    $$('[data-prev]', c).forEach(b => b.addEventListener('click', () => track.scrollBy({ left: (isRTL() ? 1 : -1) * step(), behavior: reduced ? 'auto' : 'smooth' })));
  });
  $$('[data-pw-toggle]').forEach(b => b.addEventListener('click', () => {
    const input = b.parentElement.querySelector('input'); const show = input.type === 'password';
    input.type = show ? 'text' : 'password'; b.setAttribute('aria-pressed', String(show));
  }));
  $$('[data-copy-link]').forEach(b => b.addEventListener('click', () => {
    const url = location.href;
    const done = () => toast('Link copied to clipboard');
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(url).then(done, () => toast(url));
    else { const t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) { toast(url); } t.remove(); }
  }));
  $$('[data-reply]').forEach(a => a.addEventListener('click', () => {
    const t = $('#c-msg'); if (!t) return;
    setTimeout(() => { t.value = '@' + a.dataset.reply + ' '; t.focus(); }, 300);
  }));
  $$('[data-year]').forEach(y => y.textContent = new Date().getFullYear());
})();
