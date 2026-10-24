/* Daily activity report per pet */
window.Page = {
  init({ user }) {
    const { $, $$, esc, petPhoto, fmtTime, countUp } = App;
    const view = $('#view');
    const pets = DB.Q.pets(user.id);
    if (!pets.length) { view.innerHTML = `<div class="card empty"><span class="emo">🐾</span>Add a pet to see activity reports.<br><a class="btn btn-primary mt" href="pets.html">Add pet</a></div>`; return; }

    let pet = pets.find(p => p.id === App.params.get('pet')) || pets[0];
    let dayOffset = 0;

    // deterministic pseudo-random numbers so a given pet/day always shows the same data
    const rand = (seed) => { let h = 0; for (const c of seed) h = Math.imul(31, h) + c.charCodeAt(0) | 0; return () => { h = Math.imul(h ^ h >>> 15, 2246822507); h = Math.imul(h ^ h >>> 13, 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; };
    const ic = { meal: ['fork', 't-green', '🥣'], play: ['ball', 't-orange', '🎾'], sleep: ['moon', 't-blue', '😴'], walk: ['walk', 't-purple', '🌳'], snack: ['snack', 't-orange', '🦴'], rest: ['home', 't-navy', '🛏️'] };

    const dayData = () => {
      const date = new Date(); date.setDate(date.getDate() + dayOffset); date.setHours(0, 0, 0, 0);
      const r = rand(pet.id + date.toDateString());
      let acts;
      if (dayOffset === 0) acts = DB.Q.activities(pet.id).filter(a => new Date(a.occurred_at).toDateString() === date.toDateString());
      else {
        const base = [['meal', 'Breakfast completed', 'Finished breakfast', 480], ['play', 'Morning playtime', 'Played with other pets', 600], ['sleep', 'Nap time', 'Rested in the nap zone', 720], ['walk', 'Afternoon walk', 'Outdoor time', 900], ['meal', 'Dinner', 'Ate dinner', 1080]];
        acts = base.filter(() => r() > .15).map(([type, title, description, m]) => ({ type, title, description, location: '', occurred_at: new Date(date.getTime() + (m + Math.floor(r() * 40)) * 60000).toISOString() }));
      }
      const meals = acts.filter(a => a.type === 'meal' || a.type === 'snack').length || Math.floor(r() * 2) + 2;
      const play = 3 + r() * 4, sleep = 8 + r() * 5;
      const energy = play > 5 ? 'High' : play > 4 ? 'Good' : 'Calm';
      const week = Array.from({ length: 7 }, (_, i) => { const rr = rand(pet.id + 'w' + (i + dayOffset)); return +(2 + rr() * 5).toFixed(1); });
      week[6] = +play.toFixed(1);
      const score = Math.round(78 + r() * 20);
      return { date, acts, meals, play, sleep, energy, week, score };
    };

    const render = () => {
      const d = dayData();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const max = Math.max(...d.week);
      const isToday = dayOffset === 0;
      view.innerHTML = `
        <div class="row between" style="flex-wrap:wrap;margin-bottom:14px">
          <div class="row"><h1 class="page-title">Activity Report</h1></div>
          <div class="row">
            <button class="icon-btn" id="prevDay" aria-label="Previous day">${icon('chevLeft')}</button>
            <span class="badge badge-grey" style="font-size:13px;padding:7px 14px">${icon('calendar')} ${App.fmtDate(d.date)}</span>
            <button class="icon-btn" id="nextDay" aria-label="Next day" ${isToday ? 'disabled style="opacity:.3"' : ''}>${icon('chevRight')}</button>
            <button class="btn btn-outline btn-sm" id="dl">${icon('download')} Download</button>
          </div>
        </div>
        <div class="pet-tabs" style="margin-bottom:16px">${pets.map(p => `<button class="pet-tab ${p === pet ? 'active' : ''}" data-id="${p.id}">${petPhoto(p, 'xs round')}${esc(p.name)}</button>`).join('')}</div>

        <section class="card report-hero reveal">
          ${petPhoto(pet, 'lg')}
          <div>
            <h2>${esc(pet.name)}</h2>
            <div class="soft">${esc(pet.breed)}</div>
            <span class="badge badge-green" style="margin:8px 0"><span class="live-dot"></span>Healthy and Happy</span>
            <p class="soft">${esc(pet.name)} had a ${d.energy === 'High' ? 'wonderful and active' : 'calm and cozy'} day with regular meals, playtime and good rest.</p>
          </div>
          <div class="ring" title="Wellness score">
            <svg width="120" height="120"><circle class="bg" cx="60" cy="60" r="50"/><circle class="fg" id="ringFg" cx="60" cy="60" r="50" stroke-dasharray="314" stroke-dashoffset="314"/></svg>
            <b><span id="score">0</span></b>
          </div>
        </section>

        <div class="grid g-4 mt">
          <div class="card metric hover-lift reveal"><span class="tile lg t-green">${icon('fork')}</span><div><small>Meals ${isToday ? 'Today' : ''}</small><b data-n="${d.meals}">0</b> <b style="font-size:16px">meals</b><div class="sub">completed</div></div></div>
          <div class="card metric hover-lift reveal"><span class="tile lg t-orange">${icon('ball')}</span><div><small>Play Time</small><b>${Math.floor(d.play)}h ${Math.round(d.play % 1 * 60)}m</b><div class="sub">active minutes</div></div></div>
          <div class="card metric hover-lift reveal"><span class="tile lg t-blue">${icon('moon')}</span><div><small>Sleep Time</small><b>${Math.floor(d.sleep)}h ${Math.round(d.sleep % 1 * 60)}m</b><div class="sub">restful sleep</div></div></div>
          <div class="card metric hover-lift reveal"><span class="tile lg t-red">${icon('heart')}</span><div><small>Energy Level</small><b>${d.energy}</b><div class="sub">${d.energy === 'High' ? 'very active today' : 'relaxed mood'}</div></div></div>
        </div>

        <div class="grid mt split">
          <section class="card reveal">
            <div class="card-title">${isToday ? "Today's" : 'Daily'} Timeline <span class="badge badge-blue">${d.acts.length} events</span></div>
            <div class="timeline">
              ${d.acts.length ? d.acts.map((a, i) => { const c = ic[a.type] || ic.rest; return `
                <div class="tl-item" style="animation-delay:${i * .08}s">
                  <span class="time">${fmtTime(a.occurred_at)}</span><span class="dot"></span>
                  <div class="what"><span class="tile sm ${c[1]}">${icon(c[0])}</span><div><b>${esc(a.title)}</b><small>${esc(a.description)}</small></div></div>
                  <div class="tl-thumb" style="background:${pet.color}">${pet.emoji}${c[2]}</div>
                </div>`; }).join('') : '<div class="empty"><span class="emo">📝</span>No activity logged for this day.</div>'}
            </div>
          </section>
          <div class="col">
            <section class="card reveal">
              <div class="card-title">Daily Insight</div>
              <div class="insight"><span class="tile t-blue">${icon('paw')}</span><div><b>${d.energy === 'High' ? 'Great day!' : 'Nice and steady'}</b><p class="soft" style="font-size:13px">${esc(pet.name)} has been active, eating well and enjoying the stay.</p></div></div>
            </section>
            <section class="card reveal">
              <div class="card-title">Play time this week <small class="muted">hours</small></div>
              <div class="chart">${d.week.map((v, i) => { const dd = new Date(d.date); dd.setDate(dd.getDate() - 6 + i); return `<div class="bar ${i === 6 ? 'today' : ''}"><i data-v="${v}h" style="height:${v / max * 100}%;animation-delay:${i * .07}s"></i><small>${days[dd.getDay()]}</small></div>`; }).join('')}</div>
            </section>
            <section class="card reveal">
              <div class="card-title">${isToday ? "Today's" : 'Daily'} Moments <a class="view-all" href="live.html?pet=${pet.id}">Live ${icon('arrowRight')}</a></div>
              <div class="moments">
                ${[['🎾', 'Playing happily', '08:30'], ['😴', 'Nap time', '11:45'], ['🦴', 'Snack time', '15:10']].map(([e, t, tm]) => `<div class="moment" style="background:${pet.color}" title="${t}"><span>${pet.emoji}${e}</span><small>${t}<br>${tm}</small></div>`).join('')}
              </div>
            </section>
          </div>
        </div>`;

      $$('.pet-tab').forEach(b => b.addEventListener('click', () => { pet = pets.find(p => p.id === b.dataset.id); history.replaceState(null, '', '?pet=' + pet.id); render(); App.reveal(); }));
      $('#prevDay').addEventListener('click', () => { dayOffset--; render(); App.reveal(); });
      $('#nextDay').addEventListener('click', () => { if (dayOffset < 0) { dayOffset++; render(); App.reveal(); } });
      $$('[data-n]').forEach(el => countUp(el, +el.dataset.n, { dur: 900 }));
      countUp($('#score'), d.score, { dur: 1400 });
      setTimeout(() => $('#ringFg').style.strokeDashoffset = 314 - 314 * d.score / 100, 150);
      $$('.moment').forEach(m => m.addEventListener('click', () => App.modal(m.title, `<div class="moment" style="background:${pet.color};font-size:120px;aspect-ratio:16/10">${m.querySelector('span').textContent}</div>`)));
      $('#dl').addEventListener('click', () => {
        const txt = [`StayClose Activity Report`, `Pet: ${pet.name} (${pet.breed})`, `Date: ${App.fmtDate(d.date)}`, ``,
          `Meals: ${d.meals}`, `Play time: ${d.play.toFixed(1)} h`, `Sleep: ${d.sleep.toFixed(1)} h`, `Energy: ${d.energy}`, `Wellness score: ${d.score}`, ``, `Timeline:`,
          ...d.acts.map(a => `  ${fmtTime(a.occurred_at)}  ${a.title} - ${a.description}`)].join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }));
        a.download = `stayclose-${pet.name.toLowerCase()}-${d.date.toISOString().slice(0, 10)}.txt`;
        a.click();
        App.toast('Report downloaded 📄', 'success');
      });
    };
    render();
  }
};
