/* Shared widgets used by several in-app pages */
(function () {
  const EMOJIS = ['🐶', '🐕', '🐩', '🦮', '🐱', '🐈', '🐈‍⬛', '🐰', '🐹', '🦜', '🐢', '🦎'];
  const COLORS = ['linear-gradient(135deg,#F6D7A7,#E9B872)', 'linear-gradient(135deg,#E8E4DE,#C9C2B8)', 'linear-gradient(135deg,#B8B2A8,#857D73)',
    'linear-gradient(135deg,#D6E3EF,#A9C2DB)', 'linear-gradient(135deg,#F7D6D0,#E9A99C)', 'linear-gradient(135deg,#D8EBD3,#A9CFA0)'];

  App.petQuickView = function (pet) {
    const acts = DB.Q.activities(pet.id).slice(-3).reverse();
    const ic = { meal: ['fork', 't-green'], play: ['ball', 't-orange'], sleep: ['moon', 't-blue'], walk: ['walk', 't-purple'], snack: ['snack', 't-orange'], rest: ['home', 't-navy'] };
    App.modal(`${App.esc(pet.name)}'s quick view`, `
      <div class="row" style="gap:18px;margin-bottom:16px">
        ${App.petPhoto(pet, 'lg')}
        <div>
          <h3 style="font-size:22px">${App.esc(pet.name)}</h3>
          <div class="soft">${App.esc(pet.breed)} • ${pet.age} yrs • ${App.esc(pet.gender)}</div>
          <div class="row mt" style="gap:8px;flex-wrap:wrap">
            <span class="badge badge-green"><span class="live-dot"></span>${App.esc(pet.status)}</span>
            <span class="badge badge-blue">${App.esc(pet.mood || 'Happy')}</span>
          </div>
        </div>
      </div>
      <div class="card" style="background:var(--card-2);box-shadow:none;padding:14px;margin-bottom:14px">
        <b style="font-size:13px">Care notes</b><p class="soft" style="font-size:13px">${App.esc(pet.notes || 'No notes yet.')}</p>
      </div>
      <b style="font-size:13px">Latest activity</b>
      ${acts.length ? acts.map(a => `<div class="act-item"><span class="tile sm ${(ic[a.type] || ic.rest)[1]}">${icon((ic[a.type] || ic.rest)[0])}</span><div><b style="font-weight:600">${App.esc(a.title)}</b><small>${App.fmtTime(a.occurred_at)} • ${App.esc(a.location)}</small></div></div>`).join('') : '<p class="muted">No activity yet.</p>'}
      <div class="grid g-3 mt">
        <a class="btn btn-primary btn-sm" href="live.html?pet=${pet.id}">${icon('video')} Watch live</a>
        <a class="btn btn-outline btn-sm" href="activity.html?pet=${pet.id}">${icon('chart')} Report</a>
        <a class="btn btn-outline btn-sm" href="pets.html?pet=${pet.id}">${icon('paw')} Profile</a>
      </div>`);
  };

  App.petForm = function (pet, onSave) {
    const p = pet || { name: '', species: 'Dog', breed: '', age: 1, gender: 'Male', weight: '', emoji: '🐶', color: COLORS[0], notes: '' };
    App.modal(pet ? `Edit ${App.esc(pet.name)}` : 'Add a new pet', `
      <form id="petForm">
        <div class="row" style="gap:16px;margin-bottom:14px">
          <div id="petPrev">${App.petPhoto(p, 'lg')}</div>
          <div style="flex:1">
            <label class="soft" style="font-size:12.5px;font-weight:600">Avatar</label>
            <div class="emoji-pick" id="emojiPick">${EMOJIS.map(e => `<button type="button" class="${e === p.emoji ? 'on' : ''}" data-e="${e}">${e}</button>`).join('')}</div>
            <div class="emoji-pick mt" id="colorPick">${COLORS.map(c => `<button type="button" class="${c === p.color ? 'on' : ''}" data-c="${c}" style="background:${c}"></button>`).join('')}</div>
          </div>
        </div>
        <div class="grid g-2" style="gap:0 14px">
          <div class="field"><label>Name</label><input class="input" name="name" required value="${App.esc(p.name)}" placeholder="e.g. Brownie"></div>
          <div class="field"><label>Species</label><select class="input select" name="species">${['Dog', 'Cat', 'Rabbit', 'Bird', 'Other'].map(s => `<option ${s === p.species ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
          <div class="field"><label>Breed</label><input class="input" name="breed" value="${App.esc(p.breed)}" placeholder="e.g. Golden Retriever"></div>
          <div class="field"><label>Gender</label><select class="input select" name="gender">${['Male', 'Female'].map(s => `<option ${s === p.gender ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
          <div class="field"><label>Age (years)</label><input class="input" name="age" type="number" min="0" max="40" step="0.5" value="${p.age}"></div>
          <div class="field"><label>Weight (kg)</label><input class="input" name="weight" type="number" min="0" step="0.1" value="${p.weight}"></div>
        </div>
        <div class="field"><label>Care notes (diet, allergies, habits)</label><textarea class="input" name="notes" rows="3">${App.esc(p.notes)}</textarea></div>
        <div class="row" style="justify-content:flex-end">
          <button type="button" class="btn btn-outline" data-close>Cancel</button>
          <button class="btn btn-primary" type="submit">${icon('check')} ${pet ? 'Save changes' : 'Add pet'}</button>
        </div>
      </form>`, {
      onOpen(root, close) {
        const form = root.querySelector('#petForm');
        const draw = () => root.querySelector('#petPrev').innerHTML = App.petPhoto(p, 'lg');
        root.querySelector('#emojiPick').addEventListener('click', e => {
          const b = e.target.closest('button'); if (!b) return;
          p.emoji = b.dataset.e; root.querySelectorAll('#emojiPick button').forEach(x => x.classList.toggle('on', x === b)); draw();
        });
        root.querySelector('#colorPick').addEventListener('click', e => {
          const b = e.target.closest('button'); if (!b) return;
          p.color = b.dataset.c; root.querySelectorAll('#colorPick button').forEach(x => x.classList.toggle('on', x === b)); draw();
        });
        form.addEventListener('submit', e => {
          e.preventDefault();
          const d = Object.fromEntries(new FormData(form));
          if (!d.name.trim()) { App.shake(form); return App.toast('Please give your pet a name.', 'error'); }
          const row = { ...d, name: d.name.trim(), age: +d.age || 0, weight: +d.weight || 0, emoji: p.emoji, color: p.color };
          let saved;
          if (pet) saved = DB.table('pets').update(pet.id, row);
          else saved = DB.table('pets').insert({ ...row, user_id: App.user.id, status: 'At home', mood: 'Happy' });
          App.toast(pet ? 'Pet profile updated.' : `${App.esc(saved.name)} joined the family! 🎉`, 'success');
          close(); onSave && onSave(saved);
        });
      }
    });
  };
})();
