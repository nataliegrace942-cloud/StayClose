/* ============================================================
   STAYCLOSE — App shell, shared UI helpers & animations
   ============================================================ */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- formatting ---------- */
  const fmtRp = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID') + ',-';
  const fmtRpPlain = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
  const fmtDate = (d, opt = { month: 'long', day: 'numeric', year: 'numeric' }) => new Date(d).toLocaleDateString('en-US', opt);
  const fmtShort = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const nights = (a, b) => Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000));
  function timeAgo(d) {
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60) return 'Just now';
    if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) { const h = Math.floor(s / 3600); return h + (h === 1 ? ' hour ago' : ' hours ago'); }
    const days = Math.floor(s / 86400); return days === 1 ? 'Yesterday' : days + ' days ago';
  }
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- visual building blocks ---------- */
  const petPhoto = (p, size = 'md', extra = '') =>
    `<div class="pet-photo ${size} ${extra}" style="background:${p.color || 'var(--active-bg)'}"><span class="emo">${p.emoji || '🐾'}</span></div>`;
  const hotelPhoto = (h, style = 'height:130px') =>
    `<div class="hotel-photo" style="${style};background:linear-gradient(160deg,${h.tint}55,${h.tint})">
      <div class="tree l"></div><div class="tree r"></div>
      <div class="bld"><div class="sign">${icon('paw')}${esc(h.name).replace(' ', '<br>')}</div></div>
      <div class="shine"></div></div>`;

  /* ---------- toast ---------- */
  function toast(msg, type = 'info', ms = 3200) {
    let wrap = $('.toasts');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toasts'; document.body.appendChild(wrap); }
    const ic = { success: 'checkCircle', error: 'alert', warn: 'alert', info: 'info' }[type];
    const colors = { success: 't-green', error: 't-red', warn: 't-orange', info: 't-blue' }[type];
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = `<span class="tile sm ${colors}">${icon(ic)}</span><span>${msg}</span>`;
    wrap.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, ms);
  }

  /* ---------- modal ---------- */
  function modal(title, html, { onOpen, wide } = {}) {
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `<div class="modal" style="${wide ? 'width:min(760px,100%)' : ''}" role="dialog" aria-modal="true">
      <div class="modal-head"><h3>${title}</h3><button class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
      <div class="modal-body">${html}</div></div>`;
    document.body.appendChild(back);
    requestAnimationFrame(() => back.classList.add('open'));
    const close = () => { back.classList.remove('open'); setTimeout(() => back.remove(), 300); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    back.addEventListener('click', (e) => { if (e.target === back || e.target.closest('[data-close]')) close(); });
    onOpen && onOpen(back, close);
    return close;
  }

  /* ---------- effects ---------- */
  function ripple(e) {
    const btn = e.target.closest('.btn, .ripple');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const s = Math.max(r.width, r.height);
    const el = document.createElement('span');
    el.className = 'ripple-el';
    el.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    btn.appendChild(el);
    setTimeout(() => el.remove(), 600);
  }
  let pawTrail = true;
  function pawPrint(e) {
    if (!pawTrail || e.target.closest('input, textarea, select')) return;
    const el = document.createElement('div');
    el.className = 'paw-print';
    el.style.left = e.clientX - 11 + 'px';
    el.style.top = e.clientY - 11 + 'px';
    el.style.setProperty('--r', (Math.random() * 60 - 30) + 'deg');
    el.innerHTML = icon('paw');
    el.firstElementChild.style.cssText = 'width:100%;height:100%';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
  function confetti(n = 70) {
    const colors = ['#5A82AB', '#22C55E', '#F59E0B', '#E06B5A', '#A35BD1', '#F6C9A8'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDuration = 2 + Math.random() * 2.5 + 's';
      c.style.animationDelay = Math.random() * .6 + 's';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 5500);
    }
  }
  function countUp(el, to, { dur = 1200, decimals = 0, suffix = '' } = {}) {
    const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const v = to * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: .08 }) : null;
  function reveal(root = document) {
    $$('.reveal:not(.in)', root).forEach((el, i) => {
      if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', Math.min(i, 12) * 0.05 + 's');
      io ? io.observe(el) : el.classList.add('in');
    });
  }
  function tilt(el, max = 6) {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateY(${x * max}deg) rotateX(${-y * max}deg) translateY(-3px)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  }
  function setLoading(btn, on, label) {
    if (on) { btn.dataset.label = btn.innerHTML; btn.innerHTML = `<span class="spinner"></span>${label || 'Please wait…'}`; btn.disabled = true; }
    else { btn.innerHTML = btn.dataset.label; btn.disabled = false; }
  }
  function shake(el) { el.style.animation = 'none'; el.offsetHeight; el.style.animation = 'shake .45s ease'; }

  /* ---------- preferences ---------- */
  function applyPrefs(s) {
    const theme = s?.theme || localStorage.getItem('sc_theme') || 'light';
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.motion = s?.reduced_motion ? 'reduced' : '';
    pawTrail = s ? s.paw_trail !== false : true;
  }

  /* ---------- shell ---------- */
  const NAV = [
    ['dashboard', 'Dashboard', 'home', 'dashboard.html'],
    ['live', 'Live Monitoring', 'video', 'live.html'],
    ['activity', 'Activity Report', 'chart', 'activity.html'],
    ['bookings', 'My Bookings', 'calendar', 'bookings.html'],
    ['pets', 'Pet Profiles', 'paw', 'pets.html'],
    ['notifications', 'Notifications', 'bell', 'notifications.html'],
    ['chat', 'Chat Support', 'chat', 'chat.html'],
    ['settings', 'Settings', 'settings', 'settings.html']
  ];

  function renderSidebar(page, user) {
    const side = $('#sidebar');
    if (!side) return;
    const unread = DB.Q.unread(user.id);
    side.className = 'sidebar';
    side.innerHTML = `
      <a class="brand" href="dashboard.html">
        <svg class="brand-logo icon" style="width:54px;height:54px"><use href="#i-logo"></use></svg>
        <div class="brand-name">Stay<span>Close</span></div>
        <div class="brand-tag">Smart Pet Hotel Monitoring Platform</div>
      </a>
      <nav class="nav"><div class="nav-indicator"></div>
        ${NAV.map(([k, label, ic, href]) => `<a class="nav-link ${k === page ? 'active' : ''}" href="${href}" data-k="${k}">
          ${icon(ic)}<span>${label}</span>${k === 'notifications' && unread ? `<span class="nav-badge">${unread}</span>` : ''}</a>`).join('')}
      </nav>
      <div class="sidebar-foot">
        ${icon('paw', 'big-paw')}
        <p>Real time CCTV, trusted care.<br>Happy pets, worry-free pawrents.</p>
        <button class="logout-btn" data-logout>${icon('logout')} Log out</button>
      </div>`;
    // sliding active indicator
    const ind = $('.nav-indicator', side);
    const move = (el) => { if (!el) { ind.style.opacity = 0; return; } ind.style.opacity = 1; ind.style.transform = `translateY(${el.offsetTop}px)`; };
    const active = $('.nav-link.active', side);
    requestAnimationFrame(() => move(active));
    $$('.nav-link', side).forEach(a => a.addEventListener('mouseenter', () => move(a)));
    $('.nav', side).addEventListener('mouseleave', () => move(active));

    const back = document.createElement('div');
    back.className = 'sidebar-back';
    document.body.appendChild(back);
    back.addEventListener('click', () => { side.classList.remove('open'); back.classList.remove('open'); });
    App.toggleSidebar = () => { side.classList.toggle('open'); back.classList.toggle('open'); };
  }

  function renderTopbar(user) {
    const top = $('#topbar');
    if (!top) return;
    const mode = top.dataset.mode || 'greet';
    const left = mode === 'greet'
      ? `<div class="greet"><h1>Hello ${esc(user.first_name)}! <span class="wave">👋</span></h1><p>Here's what's happening today.</p></div>`
      : `<div class="top-search">${icon('search')}<input placeholder="Search pet hotel or location..." id="globalSearch"></div>`;
    const notifs = DB.Q.notifications(user.id).slice(0, 4);
    top.className = 'topbar';
    top.innerHTML = `
      <div class="row"><button class="icon-btn menu-btn" aria-label="Menu" onclick="App.toggleSidebar()">${icon('menu')}</button>${left}</div>
      <div class="top-actions">
        <div style="position:relative">
          <button class="icon-btn bell" id="bellBtn" aria-label="Notifications">${icon('bell')}${DB.Q.unread(user.id) ? '<span class="dot"></span>' : ''}</button>
          <div class="dropdown notif-pop" id="notifPop">
            <div class="row between" style="padding:6px 10px 10px"><strong>Notifications</strong><a class="view-all" href="notifications.html">View all ${icon('arrowRight')}</a></div>
            ${notifs.map(n => `<a class="np-item" href="notifications.html?id=${n.id}">
              <span class="tile sm ${n.type === 'alert' ? 't-red' : n.type === 'promo' ? 't-orange' : 't-blue'}">${icon(n.type === 'alert' ? 'megaphone' : n.type === 'promo' ? 'sparkle' : 'paw')}</span>
              <span><b style="font-weight:600">${esc(n.title)}</b><small>${timeAgo(n.at)}</small></span></a>`).join('')}
          </div>
        </div>
        <div class="user-menu" id="userMenu">
          <div class="avatar">${user.avatar || '🙂'}</div>${icon('chevDown', 'chev')}
          <div class="dropdown">
            <div class="dd-head"><strong>${esc(user.name)}</strong><span>${esc(user.email)}</span></div>
            <a href="settings.html#profile">${icon('user')} My Profile</a>
            <a href="pets.html">${icon('paw')} My Pets</a>
            <a href="bookings.html">${icon('calendar')} My Bookings</a>
            <a href="settings.html">${icon('settings')} Settings</a>
            <button id="themeQuick">${icon('moon')} Toggle dark mode</button>
            <button data-logout style="color:var(--red-soft)">${icon('logout')} Log out</button>
          </div>
        </div>
      </div>`;
    const um = $('#userMenu'), pop = $('#notifPop');
    um.addEventListener('click', (e) => { if (!e.target.closest('.dropdown')) { um.classList.toggle('open'); pop.classList.remove('open'); } });
    $('#bellBtn').addEventListener('click', (e) => { e.stopPropagation(); pop.classList.toggle('open'); um.classList.remove('open'); });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#userMenu')) um.classList.remove('open');
      if (!e.target.closest('#notifPop') && !e.target.closest('#bellBtn')) pop.classList.remove('open');
    });
    $('#themeQuick').addEventListener('click', () => {
      const s = DB.Q.settings(user.id);
      const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      if (s) DB.table('user_settings').update(s.id, { theme });
      localStorage.setItem('sc_theme', theme);
      applyPrefs({ ...s, theme });
    });
    const gs = $('#globalSearch');
    if (gs) gs.addEventListener('keydown', (e) => { if (e.key === 'Enter') location.href = 'bookings.html?tab=find&q=' + encodeURIComponent(gs.value); });
  }

  function bgPaws() {
    const main = $('.main');
    if (!main) return;
    const wrap = document.createElement('div');
    wrap.className = 'main-bg-paws';
    const spots = [[8, 62, 34], [38, 18, 26], [60, 85, 30], [88, 30, 38], [72, 55, 22], [28, 92, 28]];
    wrap.innerHTML = spots.map(([x, y, s], i) => `<svg class="icon paw" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${i * -1.4}s"><use href="#i-paw"></use></svg>`).join('');
    main.prepend(wrap);
  }

  /* ---------- boot ---------- */
  const App = {
    $, $$, esc, fmtRp, fmtRpPlain, fmtDate, fmtShort, fmtTime, timeAgo, nights,
    petPhoto, hotelPhoto, toast, modal, confetti, countUp, reveal, tilt, setLoading, shake, applyPrefs,
    user: null, params: new URLSearchParams(location.search),
    toggleSidebar() {}
  };
  window.App = App;

  document.addEventListener('DOMContentLoaded', async () => {
    await DB.init();
    const page = document.body.dataset.page;
    const isPublic = document.body.dataset.public === 'true';
    const user = DB.Auth.current();
    App.user = user;
    applyPrefs(user ? DB.Q.settings(user.id) : null);

    if (!isPublic && !user) { location.replace('login.html?next=' + encodeURIComponent(location.pathname.split('/').pop())); return; }
    if (!isPublic) { renderSidebar(page, user); renderTopbar(user); bgPaws(); }

    document.addEventListener('click', (e) => {
      ripple(e);
      if (e.target.closest('[data-logout]')) { DB.Auth.logout(); toast('See you soon! 🐾', 'success'); setTimeout(() => location.href = 'login.html', 500); }
    });
    document.addEventListener('pointerdown', pawPrint);

    if (window.Page && Page.init) await Page.init({ user, page });
    reveal();
    document.body.classList.add('ready');
  });
})();
