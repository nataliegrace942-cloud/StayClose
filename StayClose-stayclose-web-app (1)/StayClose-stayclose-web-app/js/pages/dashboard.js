window.Page = {
  init({ user }) {
    const { $, $$, esc, petPhoto, hotelPhoto, fmtShort, timeAgo } = App;
    const view = $('#view');

    const render = () => {
      const pets = DB.Q.pets(user.id);
      const active = DB.Q.activeBooking(user.id);
      const hotel = active && DB.Q.hotel(active.hotel_id);
      const bookings = DB.Q.bookings(user.id).filter(b => b.status !== 'cancelled');
      const notifs = DB.Q.notifications(user.id).filter(n => n.type !== 'promo').slice(0, 3);
      const atHotel = pets.filter(p => p.status === 'At the hotel');
      const dog = pets.find(p => p.species === 'Dog') || pets[0];
      const cat = pets.find(p => p.species === 'Cat');

      let progress = 0;
      if (active) {
        const s = new Date(active.check_in).getTime(), e = new Date(active.check_out).getTime() + 86400000;
        progress = Math.min(100, Math.max(4, (Date.now() - s) / (e - s) * 100));
      }

      view.innerHTML = `
      <div class="dash-top">
        <section class="card hero-card reveal">
          ${icon('paw', 'deco-paw" style="width:34px;height:34px;right:22px;top:20px')}
          ${icon('paw', 'deco-paw" style="width:26px;height:26px;right:52%;bottom:20px;animation-delay:-2s')}
          <div>
            <h2>${atHotel.length ? 'Your pets are safe<br>and happy today.' : 'Ready for the<br>next adventure?'} ${icon('heart')}</h2>
            <p>${atHotel.length ? 'Stay connected with your furry friends anytime, anywhere.' : 'Book a trusted pet hotel and watch your pets live while you are away.'}</p>
            <div class="today-status">
              <h4>Today's Status</h4>
              <div class="items">
                <div class="it"><span class="tile sm t-green">${icon('fork')}</span>Eating normally</div>
                <div class="it"><span class="tile sm t-blue">${icon('moon')}</span>Sleeping well</div>
                <div class="it"><span class="tile sm t-orange">${icon('paw')}</span>Playing happily</div>
              </div>
            </div>
          </div>
          <div class="mini-scene" id="miniScene">
            <div class="plant">🪴</div><div class="lamp">🧸</div>
            <div class="bed"></div>
            ${dog ? `<div class="dog" data-pet="${dog.id}" title="Pet ${esc(dog.name)}">${dog.emoji}</div>` : ''}
            ${cat ? `<div class="cat" data-pet="${cat.id}" title="Pet ${esc(cat.name)}">${cat.emoji}</div>` : ''}
          </div>
        </section>

        <section class="card booking-card reveal">
          <div class="card-title">Current Booking ${active ? '<span class="badge badge-green"><span class="live-dot"></span>Active</span>' : '<span class="badge badge-grey">None</span>'}</div>
          ${active ? `
            ${hotelPhoto(hotel)}
            <h3>${esc(hotel.name)}</h3>
            <div class="dates">${icon('calendar')} ${fmtShort(active.check_in)} – ${fmtShort(active.check_out)}</div>
            <div class="row between" style="font-size:12px"><span class="muted">Stay progress</span><b>${Math.round(progress)}%</b></div>
            <div class="progress"><span data-w="${progress}"></span></div>
            <a class="btn btn-primary btn-block" href="bookings.html?id=${active.id}">View Details ${icon('arrowRight', 'arrow')}</a>
          ` : `
            <div class="empty"><span class="emo">🏨</span>No active stay right now.</div>
            <a class="btn btn-primary btn-block" href="bookings.html?tab=find">Find a hotel ${icon('arrowRight', 'arrow')}</a>`}
        </section>
      </div>

      <div class="section-head"><h2>My Pets</h2><a class="view-all" href="pets.html">View All ${icon('arrowRight')}</a></div>
      <div class="grid g-3">
        ${pets.slice(0, 3).map(p => `
          <div class="card pet-card hover-lift reveal" data-quick="${p.id}">
            ${petPhoto(p, 'md')}
            <div class="info">
              <h4>${esc(p.name)}</h4>
              <div class="status-line"><span class="live-dot" ${p.status !== 'At the hotel' ? 'style="background:var(--orange);animation:none"' : ''}></span>${esc(p.status)}</div>
              <button class="btn btn-outline btn-sm">Quick View ${icon('arrowRight', 'arrow')}</button>
            </div>
          </div>`).join('')}
        ${pets.length < 3 ? `<button class="card add-pet reveal" id="addPet">${icon('plus')}<span>Add a pet</span></button>` : ''}
      </div>

      <div class="section-head"><h2>Quick Actions</h2></div>
      <div class="grid g-4">
        ${[
          ['live.html', 'video', 't-green', 'Live Camera', 'Watch now'],
          ['activity.html', 'chart', 't-orange', 'Activity Report', 'View report'],
          ['bookings.html?tab=find', 'search', 't-purple', 'Find Hotel', 'Book a stay'],
          ['chat.html', 'help', 't-blue', 'Chat Support', 'Get help']
        ].map(([href, ic, t, title, sub]) => `
          <a class="card qa hover-lift reveal" href="${href}">
            <span class="tile lg ${t}">${icon(ic)}</span>
            <div><h4>${title}</h4><small>${sub}</small></div>
            <span class="go">${icon('chevRight')}</span>
          </a>`).join('')}
      </div>

      <div class="grid g-2 mt-lg" style="align-items:start">
        <section>
          <div class="section-head" style="margin-top:0"><h2>My Bookings</h2><a class="view-all" href="bookings.html">View All ${icon('arrowRight')}</a></div>
          <div class="card reveal" style="padding:8px">
            ${bookings.slice(0, 3).map(b => {
              const h = DB.Q.hotel(b.hotel_id);
              const badge = { active: 'badge-green">Active', upcoming: 'badge-blue">Upcoming', completed: 'badge-grey">Completed' }[b.status];
              const bp = DB.Q.bookingPets(b.id);
              return `<a class="bk-row" href="bookings.html?id=${b.id}">
                ${hotelPhoto(h, '')}
                <div class="meta"><b>${esc(h.name)}</b><small>${fmtShort(b.check_in)} – ${fmtShort(b.check_out)} • ${bp.map(p => p.emoji).join(' ')}</small></div>
                <span class="badge ${badge}</span></a>`;
            }).join('') || '<div class="empty">No bookings yet.</div>'}
          </div>
        </section>
        <section>
          <div class="section-head" style="margin-top:0"><h2>Recent Notifications</h2><a class="view-all" href="notifications.html">View All ${icon('arrowRight')}</a></div>
          <div class="col">
            ${notifs.map(n => {
              const p = n.pet_id && DB.table('pets').find(n.pet_id);
              return `<a class="card notif-card hover-lift reveal" href="notifications.html?id=${n.id}">
                ${p ? petPhoto(p, 'sm round') : `<span class="tile t-blue">${icon('file')}</span>`}
                <div><b>${esc(n.title)}</b><small>${timeAgo(n.at)}</small></div>
                ${n.type === 'alert' ? '<span class="badge badge-red" style="margin-left:auto"><span class="live-dot"></span>Alert</span>' : icon('paw', 'paw-end')}
              </a>`;
            }).join('')}
          </div>
        </section>
      </div>`;

      // animate progress bar
      requestAnimationFrame(() => setTimeout(() => $$('[data-w]').forEach(el => el.style.width = el.dataset.w + '%'), 200));

      // quick view
      $$('[data-quick]').forEach(c => c.addEventListener('click', () => App.petQuickView(DB.table('pets').find(c.dataset.quick))));
      const add = $('#addPet');
      if (add) add.addEventListener('click', () => App.petForm(null, () => { render(); App.reveal(); }));

      // hearts on the mini scene, click to pet
      const scene = $('#miniScene');
      const heart = (x, y) => {
        scene.insertAdjacentHTML('beforeend', `<svg class="icon heart" style="left:${x}%;top:${y}%"><use href="#i-heart"></use></svg>`);
        const el = scene.lastElementChild; setTimeout(() => el.remove(), 3000);
      };
      clearInterval(Page._h);
      Page._h = setInterval(() => document.contains(scene) && heart(30 + Math.random() * 40, 20 + Math.random() * 20), 1600);
      $$('[data-pet]', scene).forEach(el => el.addEventListener('click', () => {
        for (let i = 0; i < 6; i++) setTimeout(() => heart(25 + Math.random() * 50, 15 + Math.random() * 25), i * 80);
        const p = DB.table('pets').find(el.dataset.pet);
        App.toast(`${esc(p.name)} felt that! 💛`, 'success', 1800);
      }));
      App.tilt($('.booking-card'), 4);
    };

    render();

    // simulate a live update arriving from the hotel
    setTimeout(() => {
      const pets = DB.Q.pets(user.id).filter(p => p.status === 'At the hotel');
      if (!pets.length) return;
      const p = pets[Math.floor(Math.random() * pets.length)];
      const msgs = [`${p.name} is drinking water 💧`, `${p.name} just woke up from a nap ☀️`, `${p.name} is playing with a toy 🎾`];
      App.toast(`<b>Live update</b><br>${esc(msgs[Math.floor(Math.random() * msgs.length)])}`, 'info', 4500);
    }, 6000);
  }
};
