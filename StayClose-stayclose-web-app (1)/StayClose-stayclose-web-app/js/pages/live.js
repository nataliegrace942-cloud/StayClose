/* Live monitoring: simulated CCTV feed with interactive controls */
window.Page = {
  init({ user }) {
    const { $, $$, esc, petPhoto, toast, timeAgo } = App;
    const view = $('#view');
    const booking = DB.Q.activeBooking(user.id);
    const hotel = DB.Q.hotel(booking ? booking.hotel_id : 'hot_paw');
    let cams = DB.Q.cameras(hotel.id);
    if (!cams.length) cams = DB.Q.cameras('hot_paw');
    const pets = booking ? DB.Q.bookingPets(booking.id) : [];

    if (!booking || !pets.length) {
      view.innerHTML = `<h1 class="page-title">Live Monitoring</h1><p class="page-sub">Check on your furry friends anytime, anywhere.</p>
        <div class="card empty reveal"><span class="emo">📹</span><h3>No live stay right now</h3><p>Cameras become available once your pet checks in at a partner hotel.</p>
        <a class="btn btn-primary mt" href="bookings.html?tab=find">Find a hotel ${icon('arrowRight', 'arrow')}</a></div>`;
      return;
    }

    // which pets appear in which camera
    const sceneCfg = {
      play: { mood: 'Playing happily', props: [['🎾', 62, 12, 28], ['🧸', 80, 10, 40], ['🪴', 3, 30, 70]], win: [8, 60] },
      nap: { mood: 'Sleeping peacefully', props: [['🛏️', 30, 4, 120], ['🪴', 86, 26, 60]], win: [60] },
      dining: { mood: 'Enjoying a meal', props: [['🥣', 36, 8, 40], ['🥣', 58, 8, 40], ['💧', 72, 10, 30]], win: [10] },
      garden: { mood: 'Exploring outside', props: [['🌳', 2, 30, 110], ['🌷', 70, 8, 34], ['🌼', 84, 6, 30], ['🦋', 50, 62, 26]], win: [] },
      lounge: { mood: 'Relaxing', props: [['🛋️', 10, 10, 110], ['🪟', 74, 50, 70]], win: [] }
    };
    const petIn = (cam) => {
      const i = cams.indexOf(cam);
      if (cam.scene === 'play') return pets;
      if (cam.scene === 'nap') return pets.filter((_, j) => j !== 0);
      if (cam.scene === 'lounge') return pets.filter(p => p.species === 'Cat');
      return pets.filter((_, j) => (j + i) % 2 === 0);
    };

    let current = cams.find(c => App.params.get('cam') === c.id) || cams[0];
    const focusPet = pets.find(p => p.id === App.params.get('pet')) || pets[0];
    if (App.params.get('pet')) current = cams.find(c => petIn(c).includes(focusPet)) || current;

    view.innerHTML = `
      <h1 class="page-title">Live Monitoring</h1>
      <p class="page-sub">Check on your furry friends anytime, anywhere. Streaming from <b>${esc(hotel.name)}</b>.</p>
      <div class="live-grid">
        <div class="col">
          <section class="card player reveal">
            <div class="player-head"><h3 id="camTitle"></h3><div class="row" style="gap:8px"><span class="badge badge-green">${icon('wifi')} Strong signal</span><span class="badge badge-grey" id="viewers">1 watching</span></div></div>
            <div class="screen" id="screen">
              <div class="room" id="room"></div>
              <div class="static"></div><div class="scan"></div><div class="vignette"></div><div class="flash" id="flash"></div>
              <div class="hud"><span class="live"><span class="live-dot" style="background:#fff"></span>LIVE</span><span id="quality">1080p</span><span class="rec"><span class="live-dot red"></span>REC <b id="recTime">00:00</b></span></div>
              <button class="fs-btn" id="fsBtn" aria-label="Fullscreen">${icon('expand')}</button>
              <div class="ts" id="ts"></div>
              <div class="talk-wave"><i></i><i style="animation-delay:.1s"></i><i style="animation-delay:.2s"></i><i style="animation-delay:.3s"></i><i style="animation-delay:.15s"></i></div>
            </div>
            <div class="controls">
              <button class="ctrl" id="cVolume">${icon('volume')}<span>Volume</span></button>
              <button class="ctrl" id="cTalk">${icon('mic')}<span>Talk to Staff</span></button>
              <button class="ctrl" id="cSnap">${icon('camera')}<span>Take Snapshot</span></button>
              <button class="ctrl" id="cRec">${icon('record')}<span>Record Clip</span></button>
            </div>
          </section>
          <section class="card reveal">
            <div class="card-title">Snapshots & clips <span class="muted" style="font-size:12px;font-weight:400" id="snapCount"></span></div>
            <div class="snaps" id="snaps"></div>
          </section>
        </div>

        <aside class="col">
          <section class="card reveal">
            <div class="card-title">Currently Viewing <button class="icon-btn" style="width:30px;height:30px" id="moreBtn">${icon('dots')}</button></div>
            <div class="viewing" id="viewing"></div>
          </section>
          <section class="card reveal">
            <div class="card-title">Camera List <span class="badge badge-red"><span class="live-dot"></span>${cams.length} live</span></div>
            <div class="col" style="gap:6px" id="camList"></div>
          </section>
          <section class="card reveal">
            <div class="card-title">Recent Activity <a class="view-all" href="activity.html">View All ${icon('arrowRight')}</a></div>
            <div id="feed"></div>
          </section>
        </aside>
      </div>`;

    const screen = $('#screen'), room = $('#room');
    let viewingPet = focusPet;
    let moveTimer;

    const drawRoom = () => {
      const cfg = sceneCfg[current.scene] || sceneCfg.play;
      const here = petIn(current);
      room.className = 'room ' + current.scene;
      room.innerHTML = `
        ${cfg.win.map(x => `<div class="win" style="left:${x}%"></div>`).join('')}
        <div class="sunbeam" style="left:${cfg.win[0] ?? 30}%"></div>
        ${cfg.props.map(([e, x, y, s]) => `<div class="prop" style="left:${x}%;bottom:${y}%;font-size:${s}px">${e}</div>`).join('')}
        ${here.map((p, i) => `<div class="actor ${current.scene === 'nap' ? 'breathe' : ''}" data-id="${p.id}" style="left:${18 + i * 22}%;bottom:${current.scene === 'nap' ? 18 : 10 + (i % 2) * 6}%;font-size:${p.species === 'Dog' ? 92 : 70}px">${p.emoji}</div>`).join('')}
        ${current.scene === 'nap' ? '<div class="zz" style="left:52%;top:30%">z</div><div class="zz" style="left:56%;top:26%;animation-delay:1s">Z</div>' : ''}
        ${!here.length ? '<div style="position:absolute;inset:0;display:grid;place-items:center;color:rgba(26,43,74,.5);font-weight:600">No pets in this room right now</div>' : ''}`;
      $('#camTitle').textContent = `${current.name} - Live Camera`;
      if (here.length && !here.includes(viewingPet)) viewingPet = here[0];
      drawViewing();
      drawCams();
      // pets wander around in active rooms
      clearInterval(moveTimer);
      if (current.scene !== 'nap') {
        moveTimer = setInterval(() => $$('.actor', room).forEach(a => {
          a.style.left = 6 + Math.random() * 70 + '%';
          a.style.bottom = 6 + Math.random() * 14 + '%';
          a.classList.toggle('wag', Math.random() > .5);
        }), 3200);
      }
      $$('.actor', room).forEach(a => a.addEventListener('click', () => {
        viewingPet = pets.find(p => p.id === a.dataset.id); drawViewing();
        a.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-30px)' }, { transform: 'translateY(0)' }], { duration: 500, easing: 'ease-out' });
      }));
    };

    const drawViewing = () => {
      const cfg = sceneCfg[current.scene] || sceneCfg.play;
      $('#viewing').innerHTML = `${petPhoto(viewingPet, 'md')}
        <div><h4>${esc(viewingPet.name)}</h4>
          <div class="status-line"><span class="live-dot"></span>${cfg.mood}</div>
          <div class="status-line" style="margin-top:4px">${icon('pin')}<span>${esc(hotel.name)}<br><small class="muted">${esc(current.name)}</small></span></div></div>`;
    };

    const drawCams = () => {
      $('#camList').innerHTML = cams.map(c => {
        const here = petIn(c);
        const cfg = sceneCfg[c.scene] || sceneCfg.play;
        return `<div class="cam-item ${c === current ? 'active' : ''}" data-cam="${c.id}">
          <div class="cam-thumb room ${c.scene}">${here.map(p => p.emoji).join('') || '🪴'}</div>
          <div class="meta"><b><span class="tag-live">LIVE</span>${esc(c.name)}</b><small>${here.length ? esc(here.map(p => p.name).join(', ')) + ' • ' + cfg.mood.toLowerCase() : 'Empty right now'}</small></div>
          ${icon('chevRight')}</div>`;
      }).join('');
      $$('.cam-item').forEach(el => el.addEventListener('click', () => switchCam(cams.find(c => c.id === el.dataset.cam))));
    };

    const switchCam = (cam) => {
      if (cam === current) return;
      screen.classList.add('switching');
      setTimeout(() => { current = cam; drawRoom(); screen.classList.remove('switching'); }, 450);
    };

    drawRoom();

    // timestamp
    const ts = $('#ts');
    const tick = () => ts.textContent = `${current.name.toUpperCase()} • ${new Date().toLocaleString('en-GB', { hour12: false }).replace(',', '')}`;
    tick(); const tsT = setInterval(tick, 1000);

    // controls
    let muted = true;
    const vol = $('#cVolume');
    vol.addEventListener('click', () => {
      muted = !muted;
      vol.classList.toggle('on', !muted);
      vol.innerHTML = `${icon(muted ? 'mute' : 'volume')}<span>${muted ? 'Muted' : 'Sound on'}</span>`;
      toast(muted ? 'Audio muted' : 'Listening to the room 🔊', 'info', 1600);
    });
    vol.innerHTML = `${icon('mute')}<span>Muted</span>`;

    const talk = $('#cTalk');
    talk.addEventListener('click', () => {
      const on = !screen.classList.contains('talking');
      screen.classList.toggle('talking', on);
      talk.classList.toggle('on', on);
      talk.querySelector('span').textContent = on ? 'Talking…' : 'Talk to Staff';
      if (on) toast('Connected to staff intercom. Say hi! 🎙️', 'success', 2000);
    });

    const snaps = JSON.parse(localStorage.getItem('sc_snaps_' + user.id) || '[]');
    const drawSnaps = () => {
      $('#snaps').innerHTML = snaps.length ? snaps.slice().reverse().map(s => `<div class="snap room ${s.scene}" title="${esc(s.cam)} • ${new Date(s.at).toLocaleString()}">${s.emojis}${s.clip ? '<small>▶ ' + s.clip + '</small>' : '<small>' + App.fmtTime(s.at) + '</small>'}</div>`).join('') : '<p class="muted">Snapshots and recorded clips will appear here.</p>';
      $('#snapCount').textContent = snaps.length ? `${snaps.length} saved` : '';
    };
    const addSnap = (clip) => {
      snaps.push({ scene: current.scene, cam: current.name, emojis: petIn(current).map(p => p.emoji).join(''), at: new Date().toISOString(), clip });
      if (snaps.length > 20) snaps.shift();
      localStorage.setItem('sc_snaps_' + user.id, JSON.stringify(snaps));
      drawSnaps();
    };
    drawSnaps();
    $('#cSnap').addEventListener('click', () => {
      const f = $('#flash'); f.classList.remove('go'); f.offsetWidth; f.classList.add('go');
      addSnap(); toast('Snapshot saved 📸', 'success', 1800);
    });

    let recT, recS = 0;
    const rec = $('#cRec');
    rec.addEventListener('click', () => {
      const on = !screen.classList.contains('recording');
      screen.classList.toggle('recording', on);
      rec.classList.toggle('rec-on', on);
      rec.querySelector('span').textContent = on ? 'Stop' : 'Record Clip';
      if (on) {
        recS = 0; $('#recTime').textContent = '00:00';
        recT = setInterval(() => { recS++; $('#recTime').textContent = `${String(Math.floor(recS / 60)).padStart(2, '0')}:${String(recS % 60).padStart(2, '0')}`; if (recS >= 60) rec.click(); }, 1000);
      } else {
        clearInterval(recT);
        addSnap(`0:${String(Math.max(1, recS)).padStart(2, '0')}`);
        toast(`Clip saved (${recS}s) 🎬`, 'success', 1800);
      }
    });

    $('#fsBtn').addEventListener('click', () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else screen.requestFullscreen?.().catch(() => toast('Fullscreen is not available in this browser.', 'warn'));
    });

    $('#moreBtn').addEventListener('click', () => App.petQuickView(viewingPet));

    // quality toggles with a click on the badge
    $('#quality').style.cursor = 'pointer';
    $('#quality').addEventListener('click', () => { const q = $('#quality'); q.textContent = q.textContent === '1080p' ? '720p' : '1080p'; });

    // live viewers counter
    setInterval(() => $('#viewers') && ($('#viewers').textContent = `${1 + Math.floor(Math.random() * 3)} watching`), 7000);

    // activity feed with simulated live events
    const feed = $('#feed');
    const ic = { meal: ['bowl', 't-green'], play: ['ball', 't-orange'], sleep: ['moon', 't-blue'], walk: ['walk', 't-purple'], snack: ['snack', 't-orange'], rest: ['home', 't-navy'], report: ['file', 't-orange'] };
    const items = DB.Q.recentActivities(user.id, 4).map(a => ({ ...a, pet: DB.table('pets').find(a.pet_id) }));
    const drawFeed = () => {
      feed.innerHTML = items.slice(0, 4).map(a => `<div class="act-item">
        <span class="tile sm ${(ic[a.type] || ic.rest)[1]}">${icon((ic[a.type] || ic.rest)[0])}</span>
        ${a.pet ? petPhoto(a.pet, 'xs round') : ''}
        <div><b style="font-weight:600">${esc(a.title.includes(a.pet?.name) ? a.title : (a.pet ? a.pet.name + ': ' : '') + a.title)}</b><small>${timeAgo(a.occurred_at)}</small></div></div>`).join('');
    };
    drawFeed();
    const events = [['play', 'is chasing a ball', 'Play Area'], ['meal', 'drank some water', 'Dining Area'], ['sleep', 'is taking a quick nap', 'Nap Zone'], ['rest', 'is resting by the window', 'Cat Lounge'], ['walk', 'is exploring the garden', 'Garden']];
    const evT = setInterval(() => {
      const p = pets[Math.floor(Math.random() * pets.length)];
      const [type, txt, loc] = events[Math.floor(Math.random() * events.length)];
      const a = DB.table('activities').insert({ pet_id: p.id, booking_id: booking.id, type, title: `${p.name} ${txt}`, description: `Logged by camera AI`, location: loc, occurred_at: new Date().toISOString() });
      items.unshift({ ...a, pet: p });
      drawFeed();
    }, 12000);

    addEventListener('pagehide', () => { clearInterval(tsT); clearInterval(evT); clearInterval(moveTimer); clearInterval(recT); });
  }
};
