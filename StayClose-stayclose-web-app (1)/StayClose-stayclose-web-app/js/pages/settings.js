/* Settings: profile, notifications, appearance, security, data */
window.Page = {
  init({ user }) {
    const { $, $$, esc, toast } = App;
    const view = $('#view');
    const s = DB.Q.settings(user.id) || DB.table('user_settings').insert({ id: 'set_' + user.id, user_id: user.id, theme: 'light', notify_push: true, notify_email: true, notify_alerts: true, notify_promos: false, reduced_motion: false, paw_trail: true, two_factor: false, language: 'en' });
    const AVATARS = ['👩🏻', '👨🏻', '👩🏽', '👨🏽', '👩🏾', '👨🏾', '🧑🏼', '👵🏻', '🙂', '🐶', '🐱', '🦊'];
    const sections = [['profile', 'user', 'Profile'], ['notifications', 'bell', 'Notifications'], ['appearance', 'sun', 'Appearance'], ['security', 'lock', 'Security'], ['data', 'shield', 'Privacy & Data']];
    const toggle = (key, label, sub) => `<div class="set-row"><div><b>${label}</b><small>${sub}</small></div><label class="switch"><input type="checkbox" data-set="${key}" ${s[key] ? 'checked' : ''}><span class="slider"></span></label></div>`;

    view.innerHTML = `
      <h1 class="page-title">Settings</h1><p class="page-sub">Manage your account, notifications and how StayClose looks.</p>
      <div class="settings">
        <nav class="card set-nav reveal">${sections.map(([k, ic, l]) => `<a href="#${k}" data-sec="${k}">${icon(ic)} ${l}</a>`).join('')}</nav>
        <div>
          <section class="card set-section" id="sec-profile">
            <div class="card-title">Profile</div>
            <div class="avatar-edit">
              <div class="avatar" id="avPrev">${user.avatar || '🙂'}</div>
              <div><b>Profile picture</b><div class="emoji-pick mt" id="avPick">${AVATARS.map(a => `<button type="button" class="${a === user.avatar ? 'on' : ''}">${a}</button>`).join('')}</div></div>
            </div>
            <form id="profileForm">
              <div class="grid g-2" style="gap:0 14px">
                <div class="field"><label>Full name</label><input class="input" name="name" value="${esc(user.name)}" required></div>
                <div class="field"><label>Email</label><input class="input" name="email" type="email" value="${esc(user.email)}" required></div>
                <div class="field"><label>Phone</label><input class="input" name="phone" value="${esc(user.phone || '')}"></div>
                <div class="field"><label>Language</label><select class="input select" name="language">${[['en', 'English'], ['id', 'Bahasa Indonesia']].map(([v, l]) => `<option value="${v}" ${s.language === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
              </div>
              <div class="field"><label>Address</label><input class="input" name="address" value="${esc(user.address || '')}" placeholder="Where should hotels pick up your pet?"></div>
              <div class="row" style="justify-content:flex-end"><button class="btn btn-primary" type="submit">${icon('check')} Save profile</button></div>
            </form>
          </section>

          <section class="card set-section" id="sec-notifications">
            <div class="card-title">Notifications</div>
            ${toggle('notify_push', 'Push notifications', 'Get real-time updates on this device')}
            ${toggle('notify_email', 'Email updates', 'Daily activity report summary by email')}
            ${toggle('notify_alerts', 'Emergency alerts', 'Always notify me when my pet needs attention')}
            ${toggle('notify_promos', 'Promotions', 'Discounts and offers from partner hotels')}
            <div class="set-row"><div><b>Test notification</b><small>See what an update looks like</small></div><button class="btn btn-outline btn-sm" id="testN">${icon('bell')} Send test</button></div>
          </section>

          <section class="card set-section" id="sec-appearance">
            <div class="card-title">Appearance</div>
            <div class="theme-opts">
              <button class="theme-opt ${s.theme !== 'dark' ? 'active' : ''}" data-th="light"><div class="prev" style="background:#F5F0E8"><i style="background:#FCFAF6"></i><i style="background:#FCFAF6"></i></div>☀️ Light</button>
              <button class="theme-opt ${s.theme === 'dark' ? 'active' : ''}" data-th="dark"><div class="prev" style="background:#111827"><i style="background:#18223A"></i><i style="background:#18223A"></i></div>🌙 Dark</button>
            </div>
            <div class="mt">
              ${toggle('paw_trail', 'Paw print on click', 'Leave little paw prints wherever you click 🐾')}
              ${toggle('reduced_motion', 'Reduce motion', 'Turn off most animations')}
            </div>
          </section>

          <section class="card set-section" id="sec-security">
            <div class="card-title">Change password</div>
            <form id="pwForm">
              <div class="field"><label>Current password</label><input class="input" type="password" name="old" required autocomplete="current-password"></div>
              <div class="grid g-2" style="gap:0 14px">
                <div class="field"><label>New password</label><input class="input" type="password" name="new" required minlength="8" autocomplete="new-password"></div>
                <div class="field"><label>Confirm new password</label><input class="input" type="password" name="confirm" required autocomplete="new-password"></div>
              </div>
              <div class="row" style="justify-content:flex-end"><button class="btn btn-primary" type="submit">${icon('lock')} Update password</button></div>
            </form>
            <div class="card-title mt-lg">Security</div>
            ${toggle('two_factor', 'Two-factor authentication', 'Ask for a code when logging in on a new device')}
            <div class="set-row"><div><b>Active sessions</b><small>This browser • last login ${user.last_login ? App.timeAgo(user.last_login) : 'now'}</small></div><button class="btn btn-outline btn-sm" data-logout>${icon('logout')} Log out</button></div>
          </section>

          <section class="card set-section" id="sec-data">
            <div class="card-title">Privacy & Data</div>
            <div class="set-row"><div><b>Export my data</b><small>Download your profile, pets, bookings and messages as JSON</small></div><button class="btn btn-outline btn-sm" id="exportBtn">${icon('download')} Export</button></div>
            <div class="set-row"><div><b>Reset demo database</b><small>Restore the sample data in this browser</small></div><button class="btn btn-outline btn-sm" id="resetBtn">${icon('activity')} Reset</button></div>
            <div class="card danger-zone mt" style="box-shadow:none">
              <div class="set-row" style="border:none;padding:0"><div><b style="color:var(--red-soft)">Delete account</b><small>Permanently remove your account and all pet data</small></div><button class="btn btn-danger btn-sm" id="deleteBtn">${icon('trash')} Delete</button></div>
            </div>
          </section>
        </div>
      </div>`;

    // section switching
    const show = (k) => {
      if (!sections.some(x => x[0] === k)) k = 'profile';
      $$('.set-section').forEach(x => x.classList.toggle('active', x.id === 'sec-' + k));
      $$('[data-sec]').forEach(a => a.classList.toggle('active', a.dataset.sec === k));
    };
    show(location.hash.slice(1));
    addEventListener('hashchange', () => show(location.hash.slice(1)));

    const save = (patch) => { Object.assign(s, patch); DB.table('user_settings').update(s.id, patch); App.applyPrefs(s); if (patch.theme) localStorage.setItem('sc_theme', patch.theme); };

    // avatar
    $('#avPick').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      $$('#avPick button').forEach(x => x.classList.toggle('on', x === b));
      const a = b.textContent; $('#avPrev').textContent = a;
      $('#avPrev').animate([{ transform: 'scale(.6) rotate(-20deg)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 450, easing: 'ease-out' });
      DB.table('users').update(user.id, { avatar: a }); $('.user-menu .avatar').textContent = a;
      toast('Profile picture updated', 'success', 1500);
    });
    $('#profileForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      const email = d.email.trim().toLowerCase();
      if (DB.table('users').first(u => u.email === email && u.id !== user.id)) return toast('That email is used by another account.', 'error');
      DB.table('users').update(user.id, { name: d.name.trim(), first_name: d.name.trim().split(' ')[0], email, phone: d.phone, address: d.address });
      save({ language: d.language });
      toast('Profile saved ✨', 'success');
    });

    // toggles
    $$('[data-set]').forEach(i => i.addEventListener('change', () => {
      save({ [i.dataset.set]: i.checked });
      toast(`${i.closest('.set-row').querySelector('b').textContent} ${i.checked ? 'on' : 'off'}`, 'info', 1400);
    }));
    $$("[data-th]").forEach(b => b.addEventListener('click', () => {
      $$("[data-th]").forEach(x => x.classList.toggle('active', x === b)); save({ theme: b.dataset.th });
    }));
    $('#testN').addEventListener('click', () => toast('<b>Brownie</b> just finished a play session 🎾', 'info'));

    // password
    $('#pwForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(e.target));
      if (d.new.length < 8) return toast('New password must be at least 8 characters.', 'error');
      if (d.new !== d.confirm) { App.shake(e.target); return toast("New passwords don't match.", 'error'); }
      try { await DB.Auth.changePassword(user.id, d.old, d.new); e.target.reset(); toast('Password updated 🔒', 'success'); }
      catch (err) { App.shake(e.target); toast(err.message, 'error'); }
    });

    // data
    $('#exportBtn').addEventListener('click', () => {
      const petIds = new Set(DB.Q.pets(user.id).map(p => p.id));
      const { password_hash, salt, ...profile } = DB.table('users').find(user.id);
      const data = { profile, settings: s, pets: DB.Q.pets(user.id), bookings: DB.Q.bookings(user.id), activities: DB.table('activities').where(a => petIds.has(a.pet_id)), notifications: DB.Q.notifications(user.id), messages: DB.Q.messages(user.id) };
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      a.download = 'stayclose-my-data.json'; a.click();
      toast('Your data was exported', 'success');
    });
    $('#resetBtn').addEventListener('click', () => App.modal('Reset demo database?', `<p class="soft">All data in this browser is replaced with the sample data and you'll be logged out.</p><div class="row mt" style="justify-content:flex-end"><button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" id="yesReset">Reset</button></div>`, {
      onOpen(root) { root.querySelector('#yesReset').addEventListener('click', () => DB.reset()); }
    }));
    $('#deleteBtn').addEventListener('click', () => App.modal('Delete your account?', `<p class="soft">Type <b>DELETE</b> to permanently remove your account, pets, bookings and messages.</p><input class="input mt" id="confirmDel" placeholder="DELETE"><div class="row mt" style="justify-content:flex-end"><button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-danger" id="yesDel">Delete forever</button></div>`, {
      onOpen(root) {
        root.querySelector('#yesDel').addEventListener('click', () => {
          if (root.querySelector('#confirmDel').value !== 'DELETE') return App.shake(root.querySelector('#confirmDel'));
          const petIds = new Set(DB.Q.pets(user.id).map(p => p.id));
          const bkIds = new Set(DB.Q.bookings(user.id).map(b => b.id));
          DB.table('activities').removeWhere(a => petIds.has(a.pet_id));
          DB.table('booking_pets').removeWhere(x => bkIds.has(x.booking_id));
          DB.table('payments').removeWhere(x => bkIds.has(x.booking_id));
          ['pets', 'bookings', 'notifications', 'messages', 'user_settings'].forEach(t => DB.table(t).removeWhere(r => r.user_id === user.id));
          DB.table('users').remove(user.id);
          DB.Auth.logout();
          location.href = 'index.html';
        });
      }
    }));
  }
};
