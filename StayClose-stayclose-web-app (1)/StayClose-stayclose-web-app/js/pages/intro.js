window.Page = {
  init({ user }) {
    const { $, $$, countUp, tilt } = App;

    // splash: paw steps walk across, then fade out (only once per session)
    const splash = $('#splash');
    const seen = sessionStorage.getItem('sc_splash');
    const startDelay = seen ? 0 : 1900;
    if (seen) splash.remove();
    else {
      const steps = $('#splashSteps');
      for (let i = 0; i < 7; i++) {
        steps.insertAdjacentHTML('beforeend', `<svg class="icon paw" style="left:${i * 38}px;top:${i % 2 ? 2 : 18}px;--r:90deg;animation-delay:${0.6 + i * 0.16}s"><use href="#i-paw"></use></svg>`);
      }
      setTimeout(() => { splash.classList.add('done'); sessionStorage.setItem('sc_splash', 1); setTimeout(() => splash.remove(), 700); }, startDelay);
    }

    // hero words stagger
    $$('#heroTitle .word').forEach((w, i) => w.style.animationDelay = (startDelay / 1000 + 0.1 + i * 0.12) + 's');
    const hl = $('#heroTitle .hl svg path');
    if (hl) hl.style.animationDelay = (startDelay / 1000 + 0.9) + 's';

    // logged-in users get a dashboard shortcut
    if (user) {
      $('#navCtas').innerHTML = `<a class="btn btn-primary" href="dashboard.html">Open dashboard ${icon('arrowRight', 'arrow')}</a>`;
      $('#heroCta').href = 'dashboard.html';
      $('#heroCta').innerHTML = `Go to my dashboard ${icon('arrowRight', 'arrow')}`;
    }

    // sticky nav
    const nav = $('#lnav');
    const onScroll = () => nav.classList.toggle('scrolled', scrollY > 20);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    // live clock on the camera
    const clock = $('#camTime');
    const tick = () => clock.textContent = 'CAM 02 • ' + new Date().toLocaleString('en-GB', { hour12: false }).replace(',', '');
    tick(); setInterval(tick, 1000);

    // floating hearts + click to pet
    const hearts = $('#hearts');
    const heart = (x, y) => {
      const h = document.createElement('div');
      h.innerHTML = `<svg class="icon heart" style="left:${x}%;top:${y}%;fill:currentColor"><use href="#i-heart"></use></svg>`;
      const el = h.firstElementChild; hearts.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    };
    setInterval(() => heart(38 + Math.random() * 25, 40 + Math.random() * 10), 1400);
    ['#dog', '#cat'].forEach(sel => $(sel).addEventListener('click', () => {
      for (let i = 0; i < 6; i++) setTimeout(() => heart(35 + Math.random() * 30, 35 + Math.random() * 15), i * 90);
      App.toast(sel === '#dog' ? 'Woof! Brownie loves the attention 🐶' : 'Purrr… Luna approves 🐱', 'success', 2200);
    }));

    // 3D tilt on the scene card (mouse parallax)
    tilt($('#sceneCard'), 8);

    // marquee
    const items = [['video', 'HD live cameras'], ['shield', 'Verified hotels'], ['bell', 'Instant alerts'], ['chart', 'Daily reports'], ['chat', '24/7 chat support'], ['heart', 'Happy pets'], ['card', 'Secure payments']];
    const html = items.map(([i, t]) => `<span>${icon(i)}${t}</span>`).join('');
    $('#marquee').innerHTML = html + html;

    // stars
    $$('[data-stars]').forEach(s => s.innerHTML = icon('star').repeat(5));

    // counters when visible
    const stats = $$('[data-count]');
    const io = new IntersectionObserver((en) => en.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      countUp(el, parseFloat(el.dataset.count), { decimals: +el.dataset.decimals || 0, suffix: el.dataset.suffix || '' });
      io.unobserve(el);
    }), { threshold: .5 });
    stats.forEach(s => io.observe(s));
  }
};
