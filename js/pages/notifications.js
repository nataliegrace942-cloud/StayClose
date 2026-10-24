/* Notifications list with filters + alert detail view */
window.Page = {
  init({ user }) {
    const { $, $$, esc, petPhoto, fmtTime, toast } = App;
    const view = $('#view');
    let filter = 'all';

    const dayLabel = (d) => {
      const x = new Date(d), t = new Date(); t.setHours(0, 0, 0, 0);
      const diff = Math.floor((t - new Date(x).setHours(0, 0, 0, 0)) / 86400000);
      return diff <= 0 ? 'Today' : diff === 1 ? 'Yesterday' : App.fmtDate(d);
    };
    const when = (d) => dayLabel(d) === 'Today' ? (Date.now() - new Date(d) < 5 * 60000 ? 'Just now' : fmtTime(d)) : `${App.fmtDate(d, { month: 'short', day: 'numeric', year: 'numeric' })} - ${fmtTime(d)}`;

    function renderList() {
      const all = DB.Q.notifications(user.id);
      const map = { all: () => true, alerts: n => n.type === 'alert', updates: n => n.type === 'update', promotions: n => n.type === 'promo' };
      const list = all.filter(map[filter]);
      const groups = {};
      list.forEach(n => (groups[dayLabel(n.at)] = groups[dayLabel(n.at)] || []).push(n));
      view.innerHTML = `
        <div class="row between" style="flex-wrap:wrap">
          <div><h1 class="page-title">Notifications</h1><p class="page-sub">Stay updated with your pets' activities, important alerts, and special offers.</p></div>
          <button class="btn btn-outline btn-sm" id="readAll">${icon('check')} Mark all as read</button>
        </div>
        <div class="chips" style="margin-bottom:6px">${[['all', 'All'], ['alerts', 'Alerts'], ['updates', 'Updates'], ['promotions', 'Promotions']].map(([k, l]) => `<button class="chip ${k === filter ? 'active' : ''}" data-f="${k}">${l}</button>`).join('')}</div>
        ${Object.entries(groups).map(([g, items]) => `<div class="n-group"><h5>${g}</h5>
          ${items.map((n, i) => {
            const p = n.pet_id && DB.table('pets').find(n.pet_id);
            const lead = n.type === 'alert' ? `<span class="tile t-red">${icon('megaphone')}</span>` : n.type === 'promo' ? `<span class="tile t-orange">${icon('sparkle')}</span>` : p ? petPhoto(p, 'sm round') : `<span class="tile t-blue">${icon('file')}</span>`;
            return `<div class="card n-item ${n.type === 'alert' ? 'alert' : ''} hover-lift reveal" data-id="${n.id}" style="--d:${i * .05}s">
              ${lead}<div><b>${esc(n.title)}</b><small>${esc(n.body)}</small></div>
              <div class="right">${when(n.at)} ${!n.read ? '<span class="unread-dot"></span>' : ''} ${icon('chevRight')}</div>
              <button class="swipe-del" data-del="${n.id}" title="Delete">${icon('trash')}</button></div>`;
          }).join('')}</div>`).join('') || '<div class="card empty mt"><span class="emo">🔔</span>You\'re all caught up!</div>'}`;

      $$('[data-f]').forEach(c => c.addEventListener('click', () => { filter = c.dataset.f; renderList(); }));
      $('#readAll').addEventListener('click', () => { all.forEach(n => !n.read && DB.table('notifications').update(n.id, { read: true })); toast('All notifications marked as read', 'success'); renderList(); refreshBadge(); });
      $$('.n-item').forEach(el => el.addEventListener('click', (e) => {
        const del = e.target.closest('[data-del]');
        if (del) { e.stopPropagation(); el.classList.add('removing'); setTimeout(() => { DB.table('notifications').remove(del.dataset.del); renderList(); refreshBadge(); }, 380); return; }
        openDetail(el.dataset.id);
      }));
      App.reveal();
    }

    function openDetail(id) {
      const n = DB.table('notifications').find(id);
      if (!n) return renderList();
      DB.table('notifications').update(n.id, { read: true }); refreshBadge();
      history.replaceState(null, '', '?id=' + id);
      const p = n.pet_id && DB.table('pets').find(n.pet_id);
      const back = `<a class="view-all" href="#" id="backN" style="margin-bottom:14px">${icon('arrowLeft')} Back to Notifications</a>`;
      if (n.type === 'alert') {
        const b = DB.Q.activeBooking(user.id); const h = b && DB.Q.hotel(b.hotel_id);
        view.innerHTML = `${back}
          <section class="card alert-detail reveal" style="padding:30px">
            <div class="mega">${icon('megaphone')}</div>
            <h2>ATTENTION NEEDED!</h2>
            <p style="font-size:16px;margin-bottom:18px">We need your attention for ${esc(p ? p.name : 'your pet')}.</p>
            <div class="card" style="box-shadow:var(--shadow);text-align:left">
              <div class="kv"><span class="k">${icon('file')} Situation</span><span>${esc(n.detail || n.body)}</span></div>
              <div class="kv"><span class="k">${icon('clock')} Time</span><b>${App.fmtDate(n.at)} - ${fmtTime(n.at)}</b></div>
              <div class="kv"><span class="k">${icon('pin')} Location</span><span>${esc(n.location || (h ? h.name : '—'))}</span></div>
            </div>
            <button class="btn btn-danger btn-block mt" id="callHotel" style="padding:15px">${icon('phone')} Contact Hotel Now ${icon('arrowRight', 'arrow')}</button>
            <div class="row mt" style="justify-content:center"><a class="btn btn-ghost btn-sm" href="live.html${p ? '?pet=' + p.id : ''}">${icon('video')} Watch live</a><a class="btn btn-ghost btn-sm" href="chat.html">${icon('chat')} Message staff</a></div>
          </section>`;
        $('#callHotel').addEventListener('click', () => App.modal('Calling hotel…', `
          <div style="text-align:center;padding:10px 0 4px">
            <div class="alert-detail" style="background:none"><div class="mega" style="background:var(--green-bg)">${icon('phone')}</div></div>
            <h3>${esc(h ? h.name : 'Paw Paradise Hotel')}</h3><p class="soft" id="callState">Connecting…</p>
            <button class="btn btn-danger mt" data-close>${icon('x')} End call</button></div>`, {
          onOpen(root) { setTimeout(() => { const s = root.querySelector('#callState'); if (s) s.textContent = 'Connected • Dr. Sari (on-duty vet)'; }, 1800); }
        }));
      } else {
        view.innerHTML = `${back}
          <section class="card reveal" style="max-width:620px;margin:0 auto;text-align:center;padding:30px">
            ${p ? `<div style="display:flex;justify-content:center;margin-bottom:14px">${petPhoto(p, 'lg round')}</div>` : `<span class="tile lg ${n.type === 'promo' ? 't-orange' : 't-blue'}" style="margin:0 auto 14px">${icon(n.type === 'promo' ? 'sparkle' : 'file')}</span>`}
            <h2>${esc(n.title)}</h2>
            <p class="soft">${esc(n.body)}</p>
            <p class="muted mt">${App.fmtDate(n.at)} - ${fmtTime(n.at)}</p>
            <div class="row mt" style="justify-content:center;flex-wrap:wrap">
              ${p ? `<a class="btn btn-primary" href="live.html?pet=${p.id}">${icon('video')} Watch ${esc(p.name)} live</a><a class="btn btn-outline" href="activity.html?pet=${p.id}">${icon('chart')} Activity report</a>` : n.type === 'promo' ? `<a class="btn btn-primary" href="bookings.html?tab=find">${icon('calendar')} Book now</a>` : `<a class="btn btn-primary" href="activity.html">${icon('file')} View report</a>`}
            </div>
          </section>`;
      }
      $('#backN').addEventListener('click', (e) => { e.preventDefault(); history.replaceState(null, '', 'notifications.html'); renderList(); });
      App.reveal();
    }

    function refreshBadge() {
      const c = DB.Q.unread(user.id);
      const b = $('.nav-link[data-k=notifications] .nav-badge');
      if (b) { if (c) b.textContent = c; else b.remove(); }
      if (!c) $('.bell .dot')?.remove();
    }

    const id = App.params.get('id');
    id ? openDetail(id) : renderList();
  }
};
