/* Pet profiles: list, detail, add / edit / delete */
window.Page = {
  init({ user }) {
    const { $, $$, esc, petPhoto, fmtTime, fmtShort, toast } = App;
    const view = $('#view');
    let selected = App.params.get('pet');

    const render = () => {
      const pets = DB.Q.pets(user.id);
      const pet = pets.find(p => p.id === selected) || pets[0];
      selected = pet?.id;
      const stays = pet ? DB.table('booking_pets').where(x => x.pet_id === pet.id).map(x => DB.table('bookings').find(x.booking_id)).filter(Boolean) : [];
      const acts = pet ? DB.Q.activities(pet.id).slice(-5).reverse() : [];

      view.innerHTML = `
        <div class="row between" style="flex-wrap:wrap">
          <div><h1 class="page-title">Pet Profiles</h1><p class="page-sub">Keep your pets' details up to date so caretakers know exactly what they need.</p></div>
          <button class="btn btn-primary" id="addPet">${icon('plus')} Add Pet</button>
        </div>
        ${!pet ? `<div class="card empty"><span class="emo">🐾</span><h3>No pets yet</h3><p>Add your first furry friend to get started.</p></div>` : `
        <div class="pet-profile">
          <div class="pet-list">
            ${pets.map(p => `<div class="card pet-card hover-lift reveal ${p.id === pet.id ? 'active' : ''}" data-id="${p.id}">
              ${petPhoto(p, 'sm round')}<div class="info"><h4>${esc(p.name)}</h4><div class="status-line"><span class="live-dot" ${p.status !== 'At the hotel' ? 'style="background:var(--orange);animation:none"' : ''}></span>${esc(p.status)}</div></div>${icon('chevRight')}</div>`).join('')}
          </div>
          <div class="col">
            <section class="card reveal">
              <div class="profile-head">
                ${petPhoto(pet, '')}
                <div style="flex:1">
                  <div class="row between" style="align-items:flex-start">
                    <div><h2>${esc(pet.name)}</h2><div class="soft">${esc(pet.breed || pet.species)}</div></div>
                    <div class="row" style="gap:6px">
                      <button class="icon-btn" id="editPet" title="Edit">${icon('edit')}</button>
                      <button class="icon-btn" id="delPet" title="Delete" style="color:var(--red-soft)">${icon('trash')}</button>
                    </div>
                  </div>
                  <div class="row mt" style="gap:8px;flex-wrap:wrap">
                    <span class="badge badge-green"><span class="live-dot"></span>${esc(pet.status)}</span>
                    <span class="badge badge-blue">${esc(pet.mood || 'Happy')}</span>
                  </div>
                  <div class="row mt" style="gap:10px;flex-wrap:wrap">
                    <a class="btn btn-primary btn-sm" href="live.html?pet=${pet.id}">${icon('video')} Watch live</a>
                    <a class="btn btn-outline btn-sm" href="activity.html?pet=${pet.id}">${icon('chart')} Activity report</a>
                  </div>
                </div>
              </div>
              <div class="facts">
                <div class="fact"><small>Species</small><b>${esc(pet.species)}</b></div>
                <div class="fact"><small>Age</small><b>${pet.age} yrs</b></div>
                <div class="fact"><small>Gender</small><b>${esc(pet.gender)}</b></div>
                <div class="fact"><small>Weight</small><b>${pet.weight || '—'} kg</b></div>
              </div>
            </section>
            <div class="grid g-2">
              <section class="card reveal">
                <div class="card-title">Care notes ${icon('heart')}</div>
                <p class="soft">${esc(pet.notes || 'No notes yet. Add diet, allergies or habits so caretakers can follow them.')}</p>
                <div class="card-title mt">Stay history</div>
                ${stays.length ? stays.map(b => `<a class="kv" href="bookings.html?id=${b.id}"><span class="tile sm t-purple">${icon('calendar')}</span><div><b>${esc(DB.Q.hotel(b.hotel_id).name)}</b><br><small class="muted">${fmtShort(b.check_in)} – ${fmtShort(b.check_out)} • ${b.status}</small></div></a>`).join('') : '<p class="muted">No stays yet.</p>'}
              </section>
              <section class="card reveal">
                <div class="card-title">Recent activity</div>
                ${acts.length ? acts.map(a => `<div class="act-item"><span class="tile sm t-blue">${icon('paw')}</span><div><b style="font-weight:600">${esc(a.title)}</b><small>${fmtTime(a.occurred_at)} • ${esc(a.location)}</small></div></div>`).join('') : '<p class="muted">No activity yet.</p>'}
              </section>
            </div>
          </div>
        </div>`}`;

      $('#addPet').addEventListener('click', () => App.petForm(null, (p) => { selected = p.id; render(); App.reveal(); App.confetti(40); }));
      $$('.pet-list .pet-card').forEach(c => c.addEventListener('click', () => { selected = c.dataset.id; history.replaceState(null, '', '?pet=' + selected); render(); App.reveal(); }));
      if (!pet) return;
      $('#editPet').addEventListener('click', () => App.petForm(pet, () => { render(); App.reveal(); }));
      $('#delPet').addEventListener('click', () => App.modal(`Remove ${esc(pet.name)}?`, `<p class="soft">This deletes ${esc(pet.name)}'s profile and activity history. This cannot be undone.</p>
        <div class="row mt" style="justify-content:flex-end"><button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-danger" id="yesDel">${icon('trash')} Delete</button></div>`, {
        onOpen(root, close) {
          root.querySelector('#yesDel').addEventListener('click', () => {
            DB.table('pets').remove(pet.id);
            DB.table('booking_pets').removeWhere(x => x.pet_id === pet.id);
            DB.table('activities').removeWhere(x => x.pet_id === pet.id);
            close(); selected = null; toast(`${esc(pet.name)}'s profile was removed.`, 'success'); render(); App.reveal();
          });
        }
      }));
    };
    render();
    if (App.params.get('add')) App.petForm(null, (p) => { selected = p.id; render(); App.reveal(); });
  }
};
