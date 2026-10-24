/* My bookings, booking details and the 4-step "Book a Stay" flow */
window.Page = {
  init({ user }) {
    const { $, $$, esc, petPhoto, hotelPhoto, fmtRp, fmtRpPlain, fmtDate, fmtShort, nights, toast } = App;
    const view = $('#view');
    const SERVICE_FEE = 15000, TAX = 0.11;
    const PROMOS = { SPA20: 0.2, STAYCLOSE10: 0.1, PAWS15: 0.15 };
    const favKey = 'sc_favs_' + user.id;
    const favs = new Set(JSON.parse(localStorage.getItem(favKey) || '[]'));

    const statusBadge = (s) => ({ active: '<span class="badge badge-green"><span class="live-dot"></span>Checked in</span>', upcoming: '<span class="badge badge-blue">Upcoming</span>', completed: '<span class="badge badge-grey">Completed</span>', cancelled: '<span class="badge badge-red">Cancelled</span>' }[s]);
    const priceOf = (hotel, roomId, n, promo) => {
      const room = DB.Q.room(roomId);
      const base = hotel.price * room.multiplier * n;
      const discount = promo ? base * (PROMOS[promo] || 0) : 0;
      const sub = base - discount + SERVICE_FEE;
      const tax = Math.round(sub * TAX);
      return { base, discount, tax, total: sub + tax, room };
    };

    /* ================= LIST ================= */
    function renderList(tab = 'all') {
      const all = DB.Q.bookings(user.id);
      const filters = { all: () => true, active: b => b.status === 'active', upcoming: b => b.status === 'upcoming', past: b => b.status === 'completed' || b.status === 'cancelled' };
      const list = all.filter(filters[tab]).sort((a, b) => ({ active: 0, upcoming: 1, completed: 2, cancelled: 3 }[a.status] - { active: 0, upcoming: 1, completed: 2, cancelled: 3 }[b.status]));
      view.innerHTML = `
        <div class="row between" style="flex-wrap:wrap">
          <div><h1 class="page-title">My Bookings</h1><p class="page-sub">All your pets' stays in one place.</p></div>
          <button class="btn btn-primary" id="newBk">${icon('plus')} Book a Stay</button>
        </div>
        ${tabs([['all', 'All'], ['active', 'Active'], ['upcoming', 'Upcoming'], ['past', 'Past']], tab)}
        <div class="col">
          ${list.map(b => {
            const h = DB.Q.hotel(b.hotel_id), bp = DB.Q.bookingPets(b.id);
            return `<a class="card bk-list-item hover-lift reveal" href="?id=${b.id}">
              ${hotelPhoto(h, '')}
              <div>
                <div class="row" style="gap:8px;margin-bottom:4px">${statusBadge(b.status)}<small class="muted">#${b.code}</small></div>
                <h3 style="font-size:16px">${esc(h.name)}</h3>
                <div class="soft" style="font-size:13px">${icon('calendar')} ${fmtShort(b.check_in)} – ${fmtShort(b.check_out)} • ${DB.Q.room(b.room_type).name}</div>
                <div class="row mt" style="gap:8px"><div class="pet-stack">${bp.map(p => petPhoto(p, 'xs round')).join('')}</div><small class="muted">${esc(bp.map(p => p.name).join(', '))}</small></div>
              </div>
              <div style="text-align:right"><b style="font-size:16px">${fmtRpPlain(b.total)}</b><br><span class="view-all">Details ${icon('arrowRight')}</span></div>
            </a>`;
          }).join('') || `<div class="card empty"><span class="emo">🗓️</span>No bookings here yet.</div>`}
        </div>`;
      bindTabs((t) => renderList(t));
      $('#newBk').addEventListener('click', () => go('find'));
      App.reveal();
    }

    const tabs = (items, active) => `<div class="tabs" id="tabs"><span class="pill"></span>${items.map(([k, l]) => `<button data-t="${k}" class="${k === active ? 'active' : ''}">${l}</button>`).join('')}</div>`;
    function bindTabs(cb) {
      const wrap = $('#tabs'), pill = $('.pill', wrap);
      const place = (b) => { pill.style.left = b.offsetLeft + 'px'; pill.style.width = b.offsetWidth + 'px'; };
      requestAnimationFrame(() => place($('button.active', wrap)));
      $$('button', wrap).forEach(b => b.addEventListener('click', () => {
        $$('button', wrap).forEach(x => x.classList.toggle('active', x === b)); place(b);
        setTimeout(() => cb(b.dataset.t), 250);
      }));
    }

    /* ================= DETAILS ================= */
    function renderDetails(id) {
      const b = DB.table('bookings').find(id);
      if (!b || b.user_id !== user.id) { go('list'); return; }
      const h = DB.Q.hotel(b.hotel_id), bp = DB.Q.bookingPets(b.id);
      const latest = DB.Q.recentActivities(user.id, 10).find(a => a.booking_id === b.id);
      view.innerHTML = `
        <div class="soft" style="font-size:13px;margin-bottom:6px"><a href="dashboard.html">Dashboard</a> / <a href="bookings.html">My Bookings</a> / Booking Details</div>
        <h1 class="page-title" style="margin-bottom:16px">Booking Details</h1>
        <section class="card reveal">
          <div class="grid g-2" style="align-items:center">
            <div class="row" style="gap:18px;align-items:flex-start">
              ${petPhoto(bp[0] || { emoji: '🐾' }, 'lg')}
              <div>
                ${statusBadge(b.status)}
                <h2 style="font-size:24px;margin-top:6px">${esc(bp.map(p => p.name).join(', '))}</h2>
                <div class="soft">${esc(bp.map(p => p.breed).join(' • '))}</div>
                <div class="muted mt" style="font-size:12px">Booking ID</div><b>#${b.code}</b>
              </div>
            </div>
            <div class="row" style="gap:16px">
              <div style="flex:1"><div class="muted" style="font-size:12px">Hotel Information</div>
                ${hotelPhoto(h, 'height:100px;margin:6px 0')}
                <b style="font-size:16px">${esc(h.name)}</b>
                <div class="status-line">${icon('pin')} ${esc(h.address)}</div></div>
              <a class="btn btn-outline btn-sm" href="chat.html">${icon('phone')} Contact Hotel</a>
            </div>
          </div>
        </section>
        <div class="det-grid mt">
          <section class="card reveal">
            <div class="card-title"><span class="row" style="gap:10px"><span class="tile sm t-blue">${icon('calendar')}</span>Stay Information</span></div>
            <div class="kv"><span class="k">${icon('calendar')} Check-in</span><b>${fmtDate(b.check_in)}</b></div>
            <div class="kv"><span class="k">${icon('calendar')} Check-out</span><b>${fmtDate(b.check_out)}</b></div>
            <div class="kv"><span class="k">${icon('key')} Room Type</span><b>${DB.Q.room(b.room_type).name}</b></div>
            <div class="kv"><span class="k">${icon('wallet')} Total paid</span><b>${fmtRpPlain(b.total)}</b></div>
          </section>
          <section class="card reveal">
            <div class="card-title"><span class="row" style="gap:10px"><span class="tile sm t-orange">${icon('paw')}</span>Care Schedule</span></div>
            <div class="kv"><span class="tile sm t-blue">${icon('bowl')}</span><div><b>Feeding Schedule</b><br><small class="muted">07:00 AM • 12:00 PM • 06:00 PM</small></div></div>
            <div class="kv"><span class="tile sm t-green">${icon('walk')}</span><div><b>Walk Schedule</b><br><small class="muted">07:00 AM • 12:00 PM • 06:00 PM</small></div></div>
            <div class="kv"><span class="tile sm t-red">${icon('pill')}</span><div><b>Medication</b><br><small class="muted">${esc(bp.map(p => p.notes).find(n => /allerg|med/i.test(n)) || 'None')}</small></div></div>
          </section>
          <section class="card reveal">
            <div class="card-title"><span class="row" style="gap:10px"><span class="tile sm t-purple">${icon('file')}</span>Latest Update</span></div>
            ${latest ? `<div class="insight" style="background:var(--green-bg)"><span class="live-dot"></span><div><b>${esc(latest.title)}</b><br><small class="muted">${App.timeAgo(latest.occurred_at)}</small></div></div>` : '<p class="muted">No updates for this stay.</p>'}
            <a class="btn btn-outline btn-block mt" href="activity.html${bp[0] ? '?pet=' + bp[0].id : ''}">View All Updates ${icon('arrowRight', 'arrow')}</a>
          </section>
        </div>
        <div class="row mt-lg" style="justify-content:center;flex-wrap:wrap">
          ${b.status === 'active' ? `<a class="btn btn-primary" style="min-width:300px" href="live.html">${icon('video')} View Live Monitoring</a>` : ''}
          ${b.status === 'upcoming' ? `<button class="btn btn-danger" id="cancelBk">${icon('x')} Cancel booking</button>` : ''}
          ${b.status === 'completed' ? `<button class="btn btn-primary" id="rebook">${icon('calendar')} Book again</button>` : ''}
          <a class="btn btn-outline" href="bookings.html">${icon('arrowLeft')} Back to bookings</a>
        </div>`;
      const c = $('#cancelBk');
      if (c) c.addEventListener('click', () => App.modal('Cancel this booking?', `<p class="soft">Your stay at <b>${esc(h.name)}</b> on ${fmtShort(b.check_in)} will be cancelled and refunded within 3–5 business days.</p>
        <div class="row mt" style="justify-content:flex-end"><button class="btn btn-outline" data-close>Keep booking</button><button class="btn btn-danger" id="yesCancel">Yes, cancel</button></div>`, {
        onOpen(root, close) { root.querySelector('#yesCancel').addEventListener('click', () => { DB.table('bookings').update(b.id, { status: 'cancelled' }); close(); toast('Booking cancelled.', 'success'); renderDetails(b.id); }); }
      }));
      const r = $('#rebook');
      if (r) r.addEventListener('click', () => { flow.hotel = h; go('find'); });
      App.reveal();
    }

    /* ================= BOOK A STAY FLOW ================= */
    const pets = DB.Q.pets(user.id);
    const today = new Date().toISOString().slice(0, 10);
    const plus = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
    const flow = { step: 1, hotel: null, pets: new Set(pets.map(p => p.id)), checkIn: plus(today, 1), checkOut: plus(today, 2), room: 'premium', promo: '', pay: 'card', q: App.params.get('q') || '', city: 'All' };

    const stepper = (n) => `<div class="stepper">${['Choose Hotel', 'Booking Details', 'Payment', 'Confirmation'].map((t, i) =>
      `${i ? `<span class="line ${i < n ? 'done' : ''}"></span>` : ''}<div class="st ${i + 1 === n ? 'active' : i + 1 < n ? 'done' : ''}"><span class="n">${i + 1 < n ? icon('check') : i + 1}</span>${t}</div>`).join('')}</div>`;

    const summary = (btnLabel, btnId) => {
      const h = flow.hotel; const n = nights(flow.checkIn, flow.checkOut);
      if (!h) return `<div class="empty" style="padding:20px"><span class="emo">🏨</span>Pick a hotel to see your plan.</div>`;
      const p = priceOf(h, flow.room, n, flow.promo);
      return `
        <div class="row" style="gap:12px;margin-bottom:12px">${hotelPhoto(h, 'width:84px;height:64px;flex-shrink:0')}<div><b>${esc(h.name)}</b><div class="rate" style="font-size:12.5px;color:var(--text-soft)">⭐ ${h.rating} (${h.reviews})</div></div></div>
        <div class="sum-row"><span>Check-in</span><b>${fmtDate(flow.checkIn)}</b></div>
        <div class="sum-row"><span>Check-out</span><b>${fmtDate(flow.checkOut)}</b></div>
        <div class="sum-row"><span>Room type</span><b>${p.room.name}</b></div>
        <div class="sum-row"><span>Pets</span><b>${[...flow.pets].map(id => DB.table('pets').find(id)?.emoji).join(' ')}</b></div>
        <div style="border-top:1px dashed var(--border);margin:8px 0"></div>
        <div class="sum-row"><span>${p.room.name} (${n} night${n > 1 ? 's' : ''})</span><b>${fmtRpPlain(p.base)}</b></div>
        ${p.discount ? `<div class="sum-row" style="color:var(--green-text)"><span>Promo ${flow.promo}</span><b style="color:inherit">− ${fmtRpPlain(p.discount)}</b></div>` : ''}
        <div class="sum-row"><span>Service fee</span><b>${fmtRpPlain(SERVICE_FEE)}</b></div>
        <div class="sum-row"><span>Tax (11%)</span><b>${fmtRpPlain(p.tax)}</b></div>
        <div class="sum-total"><span>Total</span><b id="totalAmt">${fmtRpPlain(p.total)}</b></div>
        ${btnLabel ? `<button class="btn btn-primary btn-block mt" id="${btnId}">${btnLabel} ${icon('arrowRight', 'arrow')}</button>` : ''}`;
    };

    function renderFind() {
      flow.step = 1;
      const cities = ['All', ...new Set(DB.Q.hotels().map(h => h.city))];
      const q = flow.q.toLowerCase();
      const hotels = DB.Q.hotels().filter(h => (flow.city === 'All' || h.city === flow.city) && (!q || (h.name + h.address + h.city).toLowerCase().includes(q)));
      const n = nights(flow.checkIn, flow.checkOut);
      const est = flow.hotel ? priceOf(flow.hotel, flow.room, n).base : 0;
      view.innerHTML = `
        <h1 class="page-title">Book a Stay</h1><p class="page-sub">Find the perfect place for your furry friends.</p>
        ${stepper(1)}
        <div class="book-grid">
          <div>
            <div class="row" style="margin-bottom:12px">
              <div class="input-icon" style="flex:1">${icon('search')}<input class="input" id="hq" placeholder="Search pet hotel or location" value="${esc(flow.q)}"></div>
              <button class="icon-btn" style="background:var(--card);border:1px solid var(--border)" id="locBtn" title="Use my location">${icon('pin')}</button>
            </div>
            <div class="chips" style="margin-bottom:14px">${cities.map(c => `<button class="chip ${c === flow.city ? 'active' : ''}" data-city="${c}">${c}</button>`).join('')}</div>
            <div class="section-head" style="margin-top:0"><h2>Popular Pet Hotels</h2><span class="muted">${hotels.length} found</span></div>
            <div class="grid g-3" id="hotelGrid">
              ${hotels.map(h => `
                <div class="card hotel-card hover-lift reveal ${flow.hotel?.id === h.id ? 'selected' : ''}" data-h="${h.id}">
                  <button class="fav ${favs.has(h.id) ? 'on' : ''}" data-fav="${h.id}" aria-label="Favourite">${icon('heart')}</button>
                  ${hotelPhoto(h, '')}
                  <h4>${esc(h.name)}</h4>
                  <div class="rate">${icon('star')} ${h.rating} (${h.reviews}) • ${esc(h.city)}</div>
                  <div class="price"><b>${fmtRp(h.price)}</b> <small>/ night</small></div>
                  <button class="btn btn-outline btn-sm btn-block mt" data-detail="${h.id}">View Details ${icon('arrowRight', 'arrow')}</button>
                </div>`).join('') || '<div class="card empty" style="grid-column:1/-1"><span class="emo">🔍</span>No hotels match your search.</div>'}
            </div>
          </div>
          <aside class="card reveal" style="position:sticky;top:20px">
            <div class="card-title">Your Booking Plan</div>
            <small class="muted">Selected Pets</small>
            <div class="plan-pets mt" style="margin-top:8px">
              ${pets.map(p => `<div class="plan-pet ${flow.pets.has(p.id) ? 'on' : ''}" data-pp="${p.id}">${petPhoto(p, 'sm round')}<span class="chk">${icon('check')}</span>${esc(p.name)}</div>`).join('')}
              <a class="plan-pet on" href="pets.html?add=1" title="Add pet"><div class="pet-photo sm round" style="background:var(--active-bg)"><span class="emo" style="font-size:20px">＋</span></div>Add</a>
            </div>
            <div class="field mt"><label>Check-in</label><input class="input" type="date" id="ci" min="${today}" value="${flow.checkIn}"></div>
            <div class="field"><label>Check-out</label><input class="input" type="date" id="co" min="${plus(flow.checkIn, 1)}" value="${flow.checkOut}"></div>
            <div class="sum-total"><span>Estimated Total<br><small class="muted">(${n} night${n > 1 ? 's' : ''})</small></span><b id="estAmt">${flow.hotel ? fmtRp(est) : '—'}</b></div>
            <button class="btn btn-primary btn-block mt" id="cont">Continue ${icon('arrowRight', 'arrow')}</button>
          </aside>
        </div>`;

      let typing;
      $('#hq').addEventListener('input', (e) => { clearTimeout(typing); typing = setTimeout(() => { flow.q = e.target.value; renderFind(); const i = $('#hq'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }, 350); });
      $('#locBtn').addEventListener('click', () => { flow.city = 'Jakarta'; toast('Showing hotels near Jakarta 📍', 'info'); renderFind(); });
      $$('[data-city]').forEach(c => c.addEventListener('click', () => { flow.city = c.dataset.city; renderFind(); }));
      $$('[data-fav]').forEach(f => f.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = f.dataset.fav; favs.has(id) ? favs.delete(id) : favs.add(id);
        f.classList.toggle('on'); localStorage.setItem(favKey, JSON.stringify([...favs]));
        toast(favs.has(id) ? 'Added to favourites 💛' : 'Removed from favourites', 'info', 1500);
      }));
      $$('[data-h]').forEach(c => c.addEventListener('click', (e) => {
        if (e.target.closest('[data-detail]')) return;
        flow.hotel = DB.Q.hotel(c.dataset.h);
        $$('[data-h]').forEach(x => x.classList.toggle('selected', x === c));
        const el = $('#estAmt'); el.textContent = fmtRp(priceOf(flow.hotel, flow.room, nights(flow.checkIn, flow.checkOut)).base);
        el.animate([{ transform: 'scale(1.25)', color: 'var(--primary)' }, { transform: 'scale(1)' }], { duration: 450, easing: 'ease-out' });
      }));
      $$('[data-detail]').forEach(b => b.addEventListener('click', (e) => { e.stopPropagation(); hotelModal(DB.Q.hotel(b.dataset.detail)); }));
      $$('[data-pp]').forEach(p => p.addEventListener('click', () => {
        const id = p.dataset.pp; flow.pets.has(id) ? flow.pets.delete(id) : flow.pets.add(id); p.classList.toggle('on');
      }));
      $('#ci').addEventListener('change', (e) => { flow.checkIn = e.target.value; if (flow.checkOut <= flow.checkIn) flow.checkOut = plus(flow.checkIn, 1); renderFind(); });
      $('#co').addEventListener('change', (e) => { flow.checkOut = e.target.value; renderFind(); });
      $('#cont').addEventListener('click', () => {
        if (!flow.hotel) { App.shake($('#hotelGrid')); return toast('Please choose a hotel first.', 'warn'); }
        if (!flow.pets.size) return toast('Select at least one pet.', 'warn');
        if (flow.checkOut <= flow.checkIn) return toast('Check-out must be after check-in.', 'warn');
        renderDetailsStep();
      });
      App.reveal();
    }

    function hotelModal(h) {
      App.modal(esc(h.name), `${hotelPhoto(h, 'height:200px;margin-bottom:14px')}
        <div class="row between"><div class="status-line">${icon('pin')} ${esc(h.address)}</div><b>⭐ ${h.rating} <small class="muted">(${h.reviews} reviews)</small></b></div>
        <div class="chips mt">${h.amenities.map(a => `<span class="badge badge-blue">${icon('check')} ${esc(a)}</span>`).join('')}</div>
        <div class="grid g-3 mt">${DB.Q.roomTypes().map(r => `<div class="card" style="background:var(--card-2);box-shadow:none;padding:12px;text-align:center"><b>${r.name}</b><br><small class="muted">${fmtRpPlain(h.price * r.multiplier)} / night</small></div>`).join('')}</div>
        <button class="btn btn-primary btn-block mt" id="pickH">Choose this hotel ${icon('arrowRight', 'arrow')}</button>`, {
        wide: true,
        onOpen(root, close) { root.querySelector('#pickH').addEventListener('click', () => { flow.hotel = h; close(); renderFind(); }); }
      });
    }

    function renderDetailsStep() {
      flow.step = 2;
      const h = flow.hotel;
      view.innerHTML = `
        <h1 class="page-title">Booking Details</h1><p class="page-sub">Please review and complete your booking information.</p>
        ${stepper(2)}
        <div class="book-grid">
          <div class="card reveal">
            <div class="card-title">Selected Hotel</div>
            <div class="row card" style="background:var(--card-2);box-shadow:none;padding:12px">${hotelPhoto(h, 'width:110px;height:76px;flex-shrink:0')}<div><b style="font-size:16px">${esc(h.name)}</b><div class="soft">⭐ ${h.rating} (${h.reviews} reviews)</div><div class="status-line">${icon('pin')} ${esc(h.address)}</div></div></div>
            <div class="card-title mt">Pet Information</div>
            ${[...flow.pets].map(id => { const p = DB.table('pets').find(id); return `<div class="kv">${petPhoto(p, 'xs round')}<b>${esc(p.name)}</b><span class="muted">(${esc(p.breed)})</span><a class="link" style="margin-left:auto" href="pets.html?pet=${p.id}">Edit</a></div>`; }).join('')}
            <div class="card-title mt">Stay Details</div>
            <div class="grid g-2" style="gap:0 14px">
              <div class="field"><label>Check-in Date</label><input class="input" type="date" id="ci2" min="${today}" value="${flow.checkIn}"></div>
              <div class="field"><label>Check-out Date</label><input class="input" type="date" id="co2" min="${plus(flow.checkIn, 1)}" value="${flow.checkOut}"></div>
            </div>
            <div class="field"><label>Room Type</label><select class="input select" id="room">${DB.Q.roomTypes().map(r => `<option value="${r.id}" ${r.id === flow.room ? 'selected' : ''}>${r.name} — ${fmtRpPlain(h.price * r.multiplier)} / night</option>`).join('')}</select></div>
            <div class="field"><label>Promo Code (Optional)</label><div class="row"><input class="input" id="promo" placeholder="Try SPA20" value="${esc(flow.promo)}"><button class="btn btn-outline" id="applyPromo">Apply</button></div></div>
            <div class="card-title mt">Payment Method</div>
            <div class="col" style="gap:8px">
              ${[['card', 'card', 'Credit/Debit Card', 'VISA • Mastercard'], ['bank', 'bank', 'Bank Transfer', 'BCA • Mandiri • BNI'], ['ewallet', 'wallet', 'E-Wallet', 'GoPay • OVO • DANA • ShopeePay'], ['qris', 'qr', 'QRIS', 'Scan with any e-wallet']].map(([k, ic, t, s]) =>
                `<label class="kv card" style="cursor:pointer;padding:12px;border:1.5px solid ${flow.pay === k ? 'var(--primary)' : 'var(--border)'};box-shadow:none"><input type="radio" name="pay" value="${k}" ${flow.pay === k ? 'checked' : ''} style="accent-color:var(--primary)"><span class="tile sm t-blue">${icon(ic)}</span><b>${t}</b><small class="muted" style="margin-left:auto">${s}</small></label>`).join('')}
            </div>
          </div>
          <aside class="card reveal" style="position:sticky;top:20px"><div class="card-title">Booking Summary</div><div id="sum">${summary('Proceed to Payment', 'toPay')}</div>
            <button class="btn btn-ghost btn-block mt" id="back1">${icon('arrowLeft')} Back</button></aside>
        </div>`;
      const refresh = () => { $('#sum').innerHTML = summary('Proceed to Payment', 'toPay'); bindPay(); $('#totalAmt').animate([{ transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: 400 }); };
      const bindPay = () => $('#toPay').addEventListener('click', renderPayment);
      bindPay();
      $('#room').addEventListener('change', (e) => { flow.room = e.target.value; refresh(); });
      $('#ci2').addEventListener('change', (e) => { flow.checkIn = e.target.value; if (flow.checkOut <= flow.checkIn) { flow.checkOut = plus(flow.checkIn, 1); $('#co2').value = flow.checkOut; } $('#co2').min = plus(flow.checkIn, 1); refresh(); });
      $('#co2').addEventListener('change', (e) => { if (e.target.value > flow.checkIn) flow.checkOut = e.target.value; else e.target.value = flow.checkOut; refresh(); });
      $('#applyPromo').addEventListener('click', () => {
        const code = $('#promo').value.trim().toUpperCase();
        if (PROMOS[code]) { flow.promo = code; toast(`Promo ${code} applied: ${PROMOS[code] * 100}% off 🎉`, 'success'); }
        else { flow.promo = ''; App.shake($('#promo')); toast('That promo code is not valid.', 'error'); }
        refresh();
      });
      $$('input[name=pay]').forEach(r => r.addEventListener('change', () => { flow.pay = r.value; $$('input[name=pay]').forEach(x => x.closest('label').style.borderColor = x.checked ? 'var(--primary)' : 'var(--border)'); }));
      $('#back1').addEventListener('click', renderFind);
      App.reveal();
    }

    let payTimer;
    function renderPayment() {
      flow.step = 3;
      // a decorative QR pattern
      const r = (() => { let s = 7; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })();
      const finder = (x, y) => (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      const ring = (x, y) => { const fx = x > 13 ? x - 14 : x, fy = y > 13 ? y - 14 : y; return fx === 0 || fy === 0 || fx === 6 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4); };
      const cells = []; for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) cells.push(`<i class="${finder(x, y) ? (ring(x, y) ? '' : 'w') : (r() > .52 ? '' : 'w')}"></i>`);
      const methods = { qris: 'QRIS Payment', card: 'Credit/Debit Card', bank: 'Bank Transfer', ewallet: 'E-Wallet' };
      view.innerHTML = `
        <h1 class="page-title">Payment</h1><p class="page-sub">Complete your payment to confirm your booking.</p>
        ${stepper(3)}
        <div class="book-grid">
          <div class="col">
            <section class="card reveal">
              <div class="card-title">${methods[flow.pay]} ${flow.pay === 'qris' ? '<span class="badge badge-green">Recommended</span>' : ''}</div>
              <div id="payBody"></div>
            </section>
            <section class="card reveal">
              <div class="card-title">Other Payment Methods</div>
              <div class="pay-opts">${[['card', 'card', 'Credit/Debit Card'], ['bank', 'bank', 'Bank Transfer'], ['qris', 'qr', 'QRIS'], ['ewallet', 'wallet', 'E-Wallet']].map(([k, ic, t]) => `<button class="pay-opt ${flow.pay === k ? 'active' : ''}" data-pay="${k}">${icon(ic)}${t}</button>`).join('')}</div>
            </section>
            <button class="btn btn-primary btn-block" id="paid" style="padding:15px">I've Completed Payment</button>
            <div class="row" style="justify-content:center;font-size:12.5px"><span class="muted">Having trouble with payment?</span><a class="btn btn-outline btn-sm" href="chat.html">${icon('chat')} Contact Support</a></div>
          </div>
          <aside class="col">
            <section class="card reveal"><div class="card-title">Booking Summary</div>${summary()}</section>
            <section class="card reveal" style="background:var(--green-bg)"><div class="row">${icon('shield')}<div><b>Your booking is secure</b><br><small class="soft">Your payment info is encrypted and never stored on this device.</small></div></div></section>
          </aside>
        </div>`;
      const body = $('#payBody');
      if (flow.pay === 'qris') {
        body.innerHTML = `<div class="qr-box">
          <div><b>Scan QRIS to Pay</b><ol class="soft" style="font-size:13px;padding-left:18px;margin-top:8px;line-height:1.9"><li>Open your e-wallet app</li><li>Scan the QR code</li><li>Check the amount is correct</li><li>Wait for the confirmation</li></ol></div>
          <div style="text-align:center"><div class="qr"><div class="qr-grid">${cells.join('')}</div></div><small class="muted">Scan with any e-wallet</small></div>
          <div class="timer"><small style="color:#B45309;font-weight:600">Payment Time Remaining</small><b id="countdown">15:00</b><small class="soft">This booking is cancelled automatically if not paid in time.</small></div></div>`;
        let s = 15 * 60; clearInterval(payTimer);
        payTimer = setInterval(() => { s--; const el = $('#countdown'); if (!el) return clearInterval(payTimer); el.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; if (s <= 0) { clearInterval(payTimer); toast('Payment time expired.', 'error'); renderFind(); } }, 1000);
      } else if (flow.pay === 'card') {
        body.innerHTML = `<div class="grid g-2" style="gap:0 14px">
          <div class="field" style="grid-column:1/-1"><label>Card number</label><div class="input-icon">${icon('card')}<input class="input" id="cardNo" inputmode="numeric" placeholder="4242 4242 4242 4242" maxlength="19"></div></div>
          <div class="field"><label>Expiry</label><input class="input" id="exp" placeholder="MM/YY" maxlength="5"></div>
          <div class="field"><label>CVC</label><input class="input" id="cvc" placeholder="123" maxlength="4" inputmode="numeric"></div>
          <div class="field" style="grid-column:1/-1"><label>Name on card</label><input class="input" id="cardName" value="${esc(user.name)}"></div></div>`;
        $('#cardNo').addEventListener('input', (e) => e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim());
        $('#exp').addEventListener('input', (e) => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); e.target.value = v; });
      } else if (flow.pay === 'bank') {
        body.innerHTML = `<p class="soft">Transfer the exact amount to the virtual account below.</p>
          <div class="card mt" style="background:var(--card-2);box-shadow:none"><div class="sum-row"><span>Bank</span><b>BCA Virtual Account</b></div><div class="sum-row"><span>VA Number</span><b style="font-family:ui-monospace,monospace;font-size:16px">8808 ${String(Date.now()).slice(-8).replace(/(.{4})/, '$1 ')}</b></div><button class="btn btn-outline btn-sm mt" id="copyVa">${icon('file')} Copy number</button></div>`;
        $('#copyVa').addEventListener('click', () => { navigator.clipboard?.writeText($('#copyVa').previousElementSibling.querySelector('b').textContent); toast('VA number copied', 'success', 1500); });
      } else {
        body.innerHTML = `<div class="pay-opts">${['GoPay', 'OVO', 'DANA', 'ShopeePay'].map((w, i) => `<button class="pay-opt ${i === 0 ? 'active' : ''}" data-w>${icon('wallet')}${w}</button>`).join('')}</div><p class="soft mt">You'll be redirected to your e-wallet app to approve the payment.</p>`;
        $$('[data-w]').forEach(b => b.addEventListener('click', () => $$('[data-w]').forEach(x => x.classList.toggle('active', x === b))));
      }
      $$('[data-pay]').forEach(b => b.addEventListener('click', () => { flow.pay = b.dataset.pay; renderPayment(); }));
      $('#paid').addEventListener('click', async (e) => {
        if (flow.pay === 'card') {
          const no = $('#cardNo').value.replace(/\s/g, ''), exp = $('#exp').value, cvc = $('#cvc').value;
          if (no.length < 16 || !/^\d\d\/\d\d$/.test(exp) || cvc.length < 3) { App.shake(body); return toast('Please complete your card details.', 'error'); }
        }
        App.setLoading(e.currentTarget, true, 'Verifying payment…');
        await new Promise(r => setTimeout(r, 1400));
        clearInterval(payTimer);
        confirmBooking();
      });
      App.reveal();
    }

    function confirmBooking() {
      const h = flow.hotel, n = nights(flow.checkIn, flow.checkOut);
      const p = priceOf(h, flow.room, n, flow.promo);
      const status = flow.checkIn <= today ? 'active' : 'upcoming';
      const code = 'SC-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000);
      const b = DB.table('bookings').insert({ user_id: user.id, hotel_id: h.id, code, room_type: flow.room, check_in: flow.checkIn, check_out: flow.checkOut, status, total: p.total, promo_code: flow.promo || null });
      [...flow.pets].forEach(id => DB.table('booking_pets').insert({ booking_id: b.id, pet_id: id }));
      DB.table('payments').insert({ booking_id: b.id, method: flow.pay, amount: p.total, status: 'paid', paid_at: new Date().toISOString() });
      DB.table('notifications').insert({ user_id: user.id, type: 'update', title: `Booking confirmed at ${h.name}`, body: `${fmtShort(flow.checkIn)} – ${fmtShort(flow.checkOut)} • #${code}`, at: new Date().toISOString(), read: false });
      const bp = DB.Q.bookingPets(b.id);

      view.innerHTML = `
        ${stepper(4)}
        <section class="card reveal" style="max-width:720px;margin:0 auto">
          <div class="confirm-art">
            <div class="pets-row">${bp.slice(0, 1).map(x => `<span>${x.emoji}</span>`).join('')}<div class="big-check"><svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></div>${bp.slice(1, 2).map(x => `<span>${x.emoji}</span>`).join('')}</div>
            <h2 style="font-size:28px;margin-top:10px">Booking Confirmed!</h2>
            <p class="soft">Your pets' stay has been successfully booked.</p>
          </div>
          <div class="card" style="background:var(--card-2);box-shadow:none">
            <div class="row between">${hotelPhoto(h, 'width:84px;height:60px;flex-shrink:0')}<div style="flex:1"><b>${esc(h.name)}</b><br><small class="muted">${esc(h.address)}</small></div><span class="badge badge-grey">Booking ID<br>${code}</span></div>
            <div class="sum-row mt"><span>Pet</span><b>${esc(bp.map(x => x.name).join(', '))}</b></div>
            <div class="sum-row"><span>Check-in</span><b>${fmtDate(flow.checkIn)}</b></div>
            <div class="sum-row"><span>Check-out</span><b>${fmtDate(flow.checkOut)}</b></div>
            <div class="sum-row"><span>Room type</span><b>${p.room.name}</b></div>
            <div class="sum-total"><span>Total Payment</span><b>${fmtRpPlain(p.total)}</b></div>
          </div>
          <a class="btn btn-primary btn-block mt" href="${status === 'active' ? 'live.html' : 'bookings.html?id=' + b.id}">${icon(status === 'active' ? 'video' : 'calendar')} ${status === 'active' ? 'View Live Monitoring' : 'View Booking'} ${icon('arrowRight', 'arrow')}</a>
          <a class="btn btn-outline btn-block mt" href="dashboard.html">Return to Dashboard</a>
        </section>`;
      App.confetti(90);
      App.reveal();
      toast('Payment received. See you at check-in! 🐾', 'success');
    }

    /* ================= ROUTING ================= */
    function go(where) {
      if (where === 'find') { history.replaceState(null, '', '?tab=find'); renderFind(); }
      else { history.replaceState(null, '', 'bookings.html'); renderList(); }
      scrollTo({ top: 0, behavior: 'smooth' });
    }
    const id = App.params.get('id');
    if (id) renderDetails(id);
    else if (App.params.get('tab') === 'find') renderFind();
    else renderList();
  }
};
