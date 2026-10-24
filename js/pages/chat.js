/* Chat support with the hotel team (simulated replies) */
window.Page = {
  init({ user }) {
    const { $, $$, esc, fmtTime } = App;
    const view = $('#view');
    const booking = DB.Q.activeBooking(user.id);
    const hotel = DB.Q.hotel(booking ? booking.hotel_id : 'hot_paw');
    const pets = DB.Q.pets(user.id);
    const pet = pets[0];

    view.innerHTML = `
      <h1 class="page-title">Chat Support</h1><p class="page-sub">Talk to the caretakers at ${esc(hotel.name)} or the StayClose help team.</p>
      <div class="chat-wrap">
        <aside class="card chat-list reveal">
          <div class="input-icon" style="margin-bottom:10px">${icon('search')}<input class="input" placeholder="Search chats"></div>
          <div class="chat-contact active"><div class="avatar" style="width:42px;height:42px;font-size:20px">👩🏻‍⚕️</div><div><b>Rina • ${esc(hotel.name)}</b><small id="lastMsg">Online</small></div></div>
          <div class="chat-contact" data-soon><div class="avatar" style="width:42px;height:42px;font-size:20px;background:var(--blue-bg)">🐾</div><div><b>StayClose Help</b><small>Billing, account & app help</small></div></div>
          <div class="chat-contact" data-soon><div class="avatar" style="width:42px;height:42px;font-size:20px;background:var(--green-bg)">🩺</div><div><b>Paw Paradise Vet</b><small>Medical questions</small></div></div>
        </aside>
        <section class="card chat-main reveal">
          <div class="chat-head">
            <div class="avatar" style="width:42px;height:42px;font-size:20px">👩🏻‍⚕️</div>
            <div><b>Rina — Caretaker</b><div class="status-line"><span class="live-dot"></span>Online • replies in ~1 min</div></div>
            <a class="btn btn-outline btn-sm" style="margin-left:auto" href="live.html">${icon('video')} Live</a>
          </div>
          <div class="chat-body" id="body"></div>
          <div class="quick-replies" id="qr">
            ${['How is ' + (pet ? pet.name : 'my pet') + ' doing?', 'Can you send a photo?', 'What time is dinner?', 'Please give extra cuddles 💛'].map(q => `<button>${esc(q)}</button>`).join('')}
          </div>
          <form class="chat-input" id="form">
            <button type="button" class="icon-btn" id="attach" title="Send a photo">${icon('attach')}</button>
            <input class="input" id="msg" placeholder="Type a message…" autocomplete="off">
            <button class="send-btn" aria-label="Send">${icon('send')}</button>
          </form>
        </section>
      </div>`;

    const body = $('#body');
    const draw = () => {
      body.innerHTML = DB.Q.messages(user.id).map(m => `<div class="msg ${m.sender}">${m.attachment ? `<span class="att">${m.attachment}</span>` : ''}${esc(m.body)}<time>${fmtTime(m.at)}</time></div>`).join('');
      body.scrollTop = body.scrollHeight;
    };
    draw();

    const replyFor = (t) => {
      const name = pet ? pet.name : 'your pet';
      t = t.toLowerCase();
      if (/photo|picture|pic|foto/.test(t)) return { body: `Here's ${name} right now! 📸`, attachment: (pet ? pet.emoji : '🐾') + '🎾' };
      if (/dinner|food|eat|meal|makan/.test(t)) return { body: `Dinner is served at 6:00 PM. ${name} finished breakfast this morning with a big appetite 🥣` };
      if (/how|doing|ok|okay|kabar/.test(t)) return { body: `${name} is doing great! Played in the yard this morning and is resting comfortably now 😊` };
      if (/cuddle|love|hug/.test(t)) return { body: `Of course! Extra belly rubs coming right up 💛` };
      if (/medic|vet|sick|allerg/.test(t)) return { body: `Our on-duty vet is checking in every few hours. I'll send you an update after the next check.` };
      if (/thank/.test(t)) return { body: `You're welcome! We're here 24/7 if you need anything 🐾` };
      return { body: `Thanks for your message! I'll pass that on to the team and update you shortly.` };
    };

    const send = (text, attachment) => {
      if (!text.trim() && !attachment) return;
      DB.table('messages').insert({ user_id: user.id, sender: 'user', body: text.trim(), attachment, at: new Date().toISOString() });
      draw();
      const typing = document.createElement('div');
      typing.className = 'typing'; typing.innerHTML = '<i></i><i></i><i></i>';
      setTimeout(() => { body.appendChild(typing); body.scrollTop = body.scrollHeight; }, 400);
      setTimeout(() => {
        typing.remove();
        const r = replyFor(text);
        DB.table('messages').insert({ user_id: user.id, sender: 'staff', ...r, at: new Date().toISOString() });
        draw();
        $('#lastMsg').textContent = r.body;
      }, 1600 + Math.random() * 800);
    };

    $('#form').addEventListener('submit', (e) => { e.preventDefault(); const i = $('#msg'); send(i.value); i.value = ''; });
    $$('#qr button').forEach(b => b.addEventListener('click', () => send(b.textContent)));
    $('#attach').addEventListener('click', () => send('Sending you my pet\'s favourite toy photo!', '🧸'));
    $$('[data-soon]').forEach(c => c.addEventListener('click', () => App.toast('This channel opens when a backend is connected. Rina can help for now!', 'info')));
  }
};
