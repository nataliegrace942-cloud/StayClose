/* Login, sign up and forgot-password pages */
window.Page = {
  init({ user, page }) {
    const { $, $$, toast, setLoading, shake } = App;
    const next = App.params.get('next') || 'dashboard.html';

    if (user && page !== 'forgot') { location.replace('dashboard.html'); return; }

    /* ---------- illustration panel with interactive buddy ---------- */
    const art = $('#authArt');
    art.innerHTML = `
      <div class="art-paws">
        ${[[10, 20, 60], [80, 12, 40], [70, 70, 70], [15, 78, 46]].map(([x, y, s], i) =>
          `<svg class="icon paw" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${-i * 2}s"><use href="#i-paw"></use></svg>`).join('')}
      </div>
      <a class="l-brand" href="index.html"><svg class="icon"><use href="#i-logo"></use></svg><span class="bn">Stay<span>Close</span></span></a>
      <div class="buddy-wrap">
        <div>
          <div class="buddy" id="buddy">
            <div class="speech" id="speech">${art.dataset.say}</div>
            <div class="b-ear l"></div><div class="b-ear r"></div>
            <div class="b-head">
              <div class="b-eye l"><div class="b-pupil"></div></div>
              <div class="b-eye r"><div class="b-pupil"></div></div>
              <div class="b-blush l"></div><div class="b-blush r"></div>
              <div class="b-muzzle"><div class="b-nose"></div><div class="b-mouth"></div><div class="b-tongue"></div></div>
            </div>
            <div class="b-paw l"></div><div class="b-paw r"></div>
          </div>
          <div class="buddy-shadow"></div>
        </div>
      </div>
      <div class="art-copy"><h2>${art.dataset.title}</h2><p>${art.dataset.text}</p></div>`;

    const buddy = $('#buddy'), speech = $('#speech');
    const say = (txt, ms = 2200) => { speech.textContent = txt; speech.classList.add('show'); clearTimeout(say.t); say.t = setTimeout(() => speech.classList.remove('show'), ms); };
    setTimeout(() => say(art.dataset.say), 500);

    // eyes follow the cursor
    const pupils = $$('.b-pupil', buddy);
    document.addEventListener('mousemove', (e) => {
      if (buddy.classList.contains('shy')) return;
      pupils.forEach(p => {
        const r = p.parentElement.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        const a = Math.atan2(dy, dx), d = Math.min(6, Math.hypot(dx, dy) / 40);
        p.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px)`;
      });
    });
    // blink
    setInterval(() => { buddy.classList.add('blink'); setTimeout(() => buddy.classList.remove('blink'), 160); }, 3800);
    // pet the buddy
    buddy.addEventListener('click', () => { buddy.classList.add('happy'); say('Hehe, that tickles! 💛'); setTimeout(() => buddy.classList.remove('happy'), 1600); });

    // cover eyes while typing a password; look at the email field when typing it
    $$('[data-pw]').forEach(inp => {
      inp.addEventListener('focus', () => { if (inp.type === 'password') buddy.classList.add('shy'); });
      inp.addEventListener('blur', () => buddy.classList.remove('shy'));
    });
    $$('input[type=email], #name').forEach(inp => inp.addEventListener('input', () => {
      const p = Math.min(1, inp.value.length / 30);
      pupils.forEach(el => el.style.transform = `translate(${-6 + p * 12}px, 5px)`);
    }));

    // show / hide password
    $$('.pw-toggle').forEach(btn => btn.addEventListener('click', () => {
      const inp = btn.parentElement.querySelector('input');
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      btn.innerHTML = icon(show ? 'eyeOff' : 'eye');
      if (show) { buddy.classList.remove('shy'); say('Peekaboo! 👀', 1400); }
      else if (document.activeElement === inp) buddy.classList.add('shy');
      inp.focus();
    }));

    /* ---------- validation helpers ---------- */
    const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
    const mark = (inp, ok) => {
      const f = inp.closest('.field');
      f.classList.toggle('invalid', !ok);
      f.classList.toggle('valid', ok && inp.type !== 'checkbox');
      if (!ok) shake(f);
      return ok;
    };
    const fail = (form, msg) => { shake(form); toast(msg, 'error'); buddy.classList.remove('happy'); say('Oops! 🙈'); };

    // password strength meter
    const pw = $('[data-strength]');
    if (pw) {
      const bars = $$('.strength i'), label = $('#strengthLabel');
      const levels = [['Too short', '#E06B5A'], ['Weak', '#E06B5A'], ['Okay', '#F59E0B'], ['Good', '#5A82AB'], ['Strong 💪', '#22C55E']];
      pw.addEventListener('input', () => {
        const v = pw.value;
        let s = 0;
        if (v.length >= 8) s++;
        if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
        if (/\d/.test(v)) s++;
        if (/[^A-Za-z0-9]/.test(v)) s++;
        if (v.length < 8) s = Math.min(s, 1);
        bars.forEach((b, i) => { b.style.background = i < s ? levels[s][1] : ''; b.classList.toggle('on', i < s); });
        label.textContent = v ? levels[s][0] : 'Use 8+ characters with a number and a symbol.';
        label.style.color = v ? levels[s][1] : '';
      });
    }

    /* ---------- LOGIN ---------- */
    if (page === 'login') {
      const form = $('#loginForm');
      const fillDemo = () => { $('#email').value = 'gwen@stayclose.com'; $('#password').value = 'password123'; say('Welcome back, Gwen! 🐶'); };
      $('#fillDemo').addEventListener('click', fillDemo);
      if (App.params.get('demo')) fillDemo();
      $$('[data-social]').forEach(b => b.addEventListener('click', () => toast(`${b.dataset.social} sign-in needs a backend. Use the demo account for now.`, 'warn')));

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = $('#email'), pass = $('#password');
        const ok = [mark(email, validEmail(email.value)), mark(pass, pass.value.length > 0)].every(Boolean);
        if (!ok) return fail(form, 'Please check the highlighted fields.');
        const btn = $('#submitBtn');
        setLoading(btn, true, 'Logging in…');
        try {
          await new Promise(r => setTimeout(r, 700));
          const u = await DB.Auth.login(email.value, pass.value, $('#remember').checked);
          buddy.classList.add('happy'); say(`Yay! Hi ${u.first_name}! 🎉`);
          toast(`Welcome back, ${App.esc(u.first_name)}!`, 'success');
          setTimeout(() => location.href = next, 800);
        } catch (err) {
          setLoading(btn, false);
          mark(pass, false);
          fail(form, err.message);
        }
      });
    }

    /* ---------- SIGN UP ---------- */
    if (page === 'signup') {
      const form = $('#signupForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = $('#name'), email = $('#email'), pass = $('#password'), conf = $('#confirm'), terms = $('#terms');
        const ok = [
          mark(name, name.value.trim().length >= 2),
          mark(email, validEmail(email.value)),
          mark(pass, pass.value.length >= 8),
          mark(conf, conf.value === pass.value && conf.value.length > 0),
          mark(terms, terms.checked)
        ].every(Boolean);
        if (!ok) return fail(form, 'Please fix the highlighted fields.');
        const btn = $('#submitBtn');
        setLoading(btn, true, 'Creating account…');
        try {
          await new Promise(r => setTimeout(r, 800));
          const u = await DB.Auth.signup({ name: name.value, email: email.value, password: pass.value, phone: $('#phone').value });
          buddy.classList.add('happy'); say('Welcome to the pack! 🎉');
          App.confetti(60);
          toast(`Account created. Welcome, ${App.esc(u.first_name)}!`, 'success');
          setTimeout(() => location.href = 'dashboard.html', 1300);
        } catch (err) {
          setLoading(btn, false);
          mark(email, false);
          fail(form, err.message);
        }
      });
    }

    /* ---------- FORGOT PASSWORD ---------- */
    if (page === 'forgot') {
      let email = '', code = '';
      const go = (n) => {
        $$('.fp-pane').forEach(p => p.classList.toggle('active', +p.dataset.step === n));
        $$('.fp-steps i').forEach((b, i) => b.classList.toggle('on', i < n));
        const lines = { 2: 'Check your email! 📨', 3: 'Almost there! 🦴', 4: 'Good as new! 🎉' };
        if (lines[n]) say(lines[n]);
        if (n === 4) { buddy.classList.add('happy'); App.confetti(40); }
      };
      const sendCode = () => {
        code = DB.Auth.requestReset(email);
        // No email server in this demo, so show the code in a toast.
        toast(`Demo email: your StayClose code is <b>${code}</b>`, 'info', 9000);
        startTimer();
      };
      let timer;
      const startTimer = () => {
        let s = 30; const el = $('#resendTimer'), link = $('#resend');
        link.style.pointerEvents = 'none'; link.style.opacity = .5;
        clearInterval(timer);
        timer = setInterval(() => {
          el.textContent = `(${--s}s)`;
          if (s <= 0) { clearInterval(timer); el.textContent = ''; link.style.pointerEvents = ''; link.style.opacity = 1; }
        }, 1000);
      };

      $('#fpEmail').addEventListener('submit', async (e) => {
        e.preventDefault();
        const inp = $('#email');
        if (!mark(inp, validEmail(inp.value))) return fail(e.target, 'Please enter a valid email.');
        const btn = e.target.querySelector('button');
        setLoading(btn, true, 'Sending…');
        await new Promise(r => setTimeout(r, 700));
        try {
          email = inp.value.trim().toLowerCase();
          sendCode();
          $('#sentTo').textContent = email;
          go(2);
          setTimeout(() => $('.otp input').focus(), 300);
        } catch (err) { mark(inp, false); fail(e.target, err.message); }
        setLoading(btn, false);
      });

      const otp = $$('.otp input');
      otp.forEach((inp, i) => {
        inp.addEventListener('input', () => {
          inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
          inp.classList.toggle('filled', !!inp.value);
          if (inp.value && otp[i + 1]) otp[i + 1].focus();
          if (otp.every(x => x.value)) $('#fpCode').requestSubmit();
        });
        inp.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !inp.value && otp[i - 1]) otp[i - 1].focus(); });
        inp.addEventListener('paste', (e) => {
          const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 4);
          if (!t) return; e.preventDefault();
          t.split('').forEach((d, j) => { otp[j].value = d; otp[j].classList.add('filled'); });
          if (t.length === 4) $('#fpCode').requestSubmit();
        });
      });
      $('#resend').addEventListener('click', (e) => { e.preventDefault(); sendCode(); });
      $('#fpCode').addEventListener('submit', (e) => {
        e.preventDefault();
        const entered = otp.map(x => x.value).join('');
        try { DB.Auth.verifyReset(email, entered); code = entered; go(3); }
        catch (err) { shake($('.otp')); otp.forEach(x => { x.value = ''; x.classList.remove('filled'); }); otp[0].focus(); fail(e.target, err.message); }
      });

      $('#fpNew').addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass = $('#password'), conf = $('#confirm');
        const ok = [mark(pass, pass.value.length >= 8), mark(conf, conf.value === pass.value && !!conf.value)].every(Boolean);
        if (!ok) return fail(e.target, 'Please fix the highlighted fields.');
        const btn = e.target.querySelector('button[type=submit]');
        setLoading(btn, true, 'Saving…');
        await new Promise(r => setTimeout(r, 600));
        await DB.Auth.resetPassword(email, code, pass.value);
        go(4);
      });
    }
  }
};
