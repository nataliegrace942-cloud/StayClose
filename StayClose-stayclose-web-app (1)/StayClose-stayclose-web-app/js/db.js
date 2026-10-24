/* ============================================================
   STAYCLOSE — Client-side database (localStorage)
   Mirrors the tables defined in /database/schema.sql so the
   front-end works with no server. Swap these calls for fetch()
   requests to a real API when a backend is added.
   ============================================================ */
(function () {
  const KEY = 'stayclose_db_v1';
  const SESSION_KEY = 'stayclose_session';
  const TABLES = ['users', 'pets', 'hotels', 'bookings', 'booking_pets', 'cameras',
    'activities', 'notifications', 'messages', 'user_settings', 'password_resets', 'payments'];

  const now = () => new Date().toISOString();
  const uid = (p) => p + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const daysFrom = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const minsAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

  /* ---------- password hashing (demo only, salted SHA-256) ---------- */
  async function hash(pw, salt) {
    const data = new TextEncoder().encode(salt + ':' + pw);
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', data);
      return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // fallback for non-secure contexts (file://)
    let h = 2166136261;
    for (const b of data) { h ^= b; h = Math.imul(h, 16777619); }
    return 'fnv_' + (h >>> 0).toString(16);
  }

  /* ---------- storage ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
  }
  let db = load();
  function save() { localStorage.setItem(KEY, JSON.stringify(db)); }

  function table(name) {
    if (!db[name]) db[name] = [];
    return {
      all: () => [...db[name]],
      where: (fn) => db[name].filter(fn),
      find: (id) => db[name].find(r => r.id === id) || null,
      first: (fn) => db[name].find(fn) || null,
      insert(row) {
        const r = { id: row.id || uid(name.slice(0, 3)), created_at: now(), ...row };
        db[name].push(r); save(); emit(name); return r;
      },
      update(id, patch) {
        const r = db[name].find(x => x.id === id);
        if (r) { Object.assign(r, patch, { updated_at: now() }); save(); emit(name); }
        return r;
      },
      remove(id) { db[name] = db[name].filter(r => r.id !== id); save(); emit(name); },
      removeWhere(fn) { db[name] = db[name].filter(r => !fn(r)); save(); emit(name); }
    };
  }

  const listeners = {};
  function emit(t) { (listeners[t] || []).forEach(fn => fn()); }
  function on(t, fn) { (listeners[t] = listeners[t] || []).push(fn); }

  /* ---------- seed ---------- */
  const HOTELS = [
    { id: 'hot_paw', name: 'Paw Paradise Hotel', address: 'Jl. Paws Avenue No. 10, Jakarta Selatan', city: 'Jakarta', rating: 4.9, reviews: 120, price: 120000, tint: '#A9C9B0', amenities: ['24/7 CCTV', 'Vet on call', 'Play area', 'Grooming'] },
    { id: 'hot_tail', name: 'Happy Tails Retreat', address: 'Jl. Kemang Raya No. 21, Jakarta Selatan', city: 'Jakarta', rating: 4.8, reviews: 97, price: 90000, tint: '#D9C4A5', amenities: ['24/7 CCTV', 'Garden', 'Pool'] },
    { id: 'hot_fur', name: 'Furry Friends Inn', address: 'Jl. Dago No. 88, Bandung', city: 'Bandung', rating: 4.7, reviews: 84, price: 110000, tint: '#B9CBD9', amenities: ['24/7 CCTV', 'Cat lounge', 'Daily report'] },
    { id: 'hot_wag', name: 'Wag & Whisker Lodge', address: 'Jl. Sunset Road No. 5, Bali', city: 'Bali', rating: 4.9, reviews: 156, price: 150000, tint: '#C8D9B9', amenities: ['24/7 CCTV', 'Beach walks', 'Spa'] },
    { id: 'hot_cozy', name: 'Cozy Paws Suites', address: 'Jl. Pemuda No. 12, Surabaya', city: 'Surabaya', rating: 4.6, reviews: 63, price: 85000, tint: '#E3CDB8', amenities: ['24/7 CCTV', 'Quiet rooms'] },
    { id: 'hot_bark', name: 'Barkingham Palace', address: 'Jl. Malioboro No. 3, Yogyakarta', city: 'Yogyakarta', rating: 4.8, reviews: 110, price: 135000, tint: '#BFD3CF', amenities: ['24/7 CCTV', 'Agility park', 'Vet on call'] }
  ];
  const ROOM_TYPES = [
    { id: 'standard', name: 'Standard Room', multiplier: 1 },
    { id: 'deluxe', name: 'Deluxe Room', multiplier: 1.25 },
    { id: 'premium', name: 'Premium Suite', multiplier: 1.5 }
  ];

  function seedUserData(userId) {
    const pets = [
      { name: 'Brownie', species: 'Dog', breed: 'Golden Retriever', age: 2, gender: 'Male', weight: 28, emoji: '🐶', color: 'linear-gradient(135deg,#F6D7A7,#E9B872)', notes: 'Loves tennis balls. Allergic to chicken.', mood: 'Playing happily' },
      { name: 'Luna', species: 'Cat', breed: 'Domestic Shorthair', age: 3, gender: 'Female', weight: 4.2, emoji: '🐱', color: 'linear-gradient(135deg,#E8E4DE,#C9C2B8)', notes: 'Shy with strangers, likes window seats.', mood: 'Sleeping well' },
      { name: 'Blacky', species: 'Cat', breed: 'Bombay', age: 4, gender: 'Male', weight: 5, emoji: '🐈‍⬛', color: 'linear-gradient(135deg,#B8B2A8,#857D73)', notes: 'Napping champion.', mood: 'Taking a nap' }
    ].map(p => table('pets').insert({ ...p, user_id: userId, status: 'At the hotel' }));

    const b1 = table('bookings').insert({
      user_id: userId, hotel_id: 'hot_paw', code: 'SC-2026-0321', room_type: 'premium',
      check_in: daysFrom(-1), check_out: daysFrom(2), status: 'active', total: 149850
    });
    const b2 = table('bookings').insert({
      user_id: userId, hotel_id: 'hot_wag', code: 'SC-2026-0410', room_type: 'deluxe',
      check_in: daysFrom(20), check_out: daysFrom(23), status: 'upcoming', total: 416250
    });
    const b3 = table('bookings').insert({
      user_id: userId, hotel_id: 'hot_tail', code: 'SC-2026-0118', room_type: 'standard',
      check_in: daysFrom(-60), check_out: daysFrom(-57), status: 'completed', total: 299700
    });
    pets.forEach(p => table('booking_pets').insert({ booking_id: b1.id, pet_id: p.id }));
    table('booking_pets').insert({ booking_id: b2.id, pet_id: pets[0].id });
    table('booking_pets').insert({ booking_id: b3.id, pet_id: pets[1].id });

    const [brownie, luna, blacky] = pets;
    const acts = [
      [brownie, 'meal', 'Breakfast completed', 'Brownie finished all his food', 480, 'Dining Area'],
      [brownie, 'play', 'Morning playtime', 'Played in the yard with other pets', 600, 'Play Area'],
      [brownie, 'sleep', 'Nap time', 'Took a nap in the nap zone', 705, 'Nap Zone'],
      [brownie, 'walk', 'Afternoon walk', 'Short walk and outdoor time', 900, 'Garden'],
      [brownie, 'snack', 'Snack time', 'Had some treats and water', 1020, 'Dining Area'],
      [brownie, 'rest', 'Resting', 'Now resting comfortably', 1140, 'Nap Zone'],
      [luna, 'meal', 'Breakfast completed', 'Luna finished breakfast', 490, 'Dining Area'],
      [luna, 'play', 'Played outside', 'Chased a feather toy', 760, 'Play Area'],
      [luna, 'sleep', 'Window nap', 'Sleeping in the sun', 840, 'Cat Lounge'],
      [blacky, 'meal', 'Breakfast completed', 'Ate half, finished later', 500, 'Dining Area'],
      [blacky, 'sleep', 'Taking a nap', 'Curled up in his bed', 780, 'Nap Zone']
    ];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    acts.forEach(([pet, type, title, desc, minute, loc]) => table('activities').insert({
      pet_id: pet.id, booking_id: b1.id, type, title, description: desc, location: loc,
      occurred_at: new Date(today.getTime() + minute * 60000).toISOString()
    }));

    const notifs = [
      { type: 'alert', title: 'Emergency Alert', body: 'Brownie needs immediate attention', detail: 'Brownie has a minor irritation. Our team is monitoring and providing care.', location: 'Paw Paradise Veterinary', pet_id: brownie.id, at: minsAgo(2) },
      { type: 'update', title: 'Brownie is playing happily!', body: 'Play Area', pet_id: brownie.id, at: minsAgo(55) },
      { type: 'update', title: 'Brownie finished breakfast!', body: 'Dining Area', pet_id: brownie.id, at: minsAgo(120) },
      { type: 'update', title: 'Luna played outside.', body: 'Play Area', pet_id: luna.id, at: minsAgo(240) },
      { type: 'update', title: 'Blacky is taking a nap.', body: 'Nap Zone', pet_id: blacky.id, at: minsAgo(360) },
      { type: 'update', title: "Staff uploaded today's activity report.", body: 'You can now view the full report.', at: minsAgo(60 * 22), read: true },
      { type: 'promo', title: '20% off grooming this weekend 🎉', body: 'Use code SPA20 at Paw Paradise Hotel.', at: minsAgo(60 * 26), read: true }
    ];
    notifs.forEach(n => table('notifications').insert({ user_id: userId, read: false, ...n }));

    table('messages').insert({ user_id: userId, sender: 'staff', body: 'Hi! 👋 This is Rina from Paw Paradise. How can we help you today?', at: minsAgo(30) });
    table('user_settings').insert({ id: 'set_' + userId, user_id: userId, theme: 'light', language: 'en', notify_push: true, notify_email: true, notify_alerts: true, notify_promos: false, reduced_motion: false, paw_trail: true, two_factor: false });
  }

  async function init() {
    if (db && db.__version === 1) return;
    db = { __version: 1 };
    TABLES.forEach(t => db[t] = []);
    HOTELS.forEach(h => db.hotels.push({ ...h, created_at: now() }));
    ['Play Area', 'Nap Zone', 'Dining Area', 'Garden', 'Cat Lounge'].forEach((name, i) =>
      db.cameras.push({ id: 'cam_' + i, hotel_id: 'hot_paw', name, scene: ['play', 'nap', 'dining', 'garden', 'lounge'][i], status: 'live' }));
    save();
    const salt = uid('s');
    const u = table('users').insert({
      id: 'usr_demo', name: 'Gwen Stacy', first_name: 'Gwen', email: 'gwen@stayclose.com',
      phone: '+62 812 3456 7890', avatar: '👩🏻', salt, password_hash: await hash('password123', salt)
    });
    seedUserData(u.id);
  }

  /* ---------- auth ---------- */
  const Auth = {
    current() {
      const id = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      return id ? table('users').find(id) : null;
    },
    async signup({ name, email, password, phone }) {
      email = email.trim().toLowerCase();
      if (table('users').first(u => u.email === email)) throw new Error('An account with this email already exists.');
      const salt = uid('s');
      const u = table('users').insert({
        name: name.trim(), first_name: name.trim().split(' ')[0], email, phone: phone || '',
        avatar: '🙂', salt, password_hash: await hash(password, salt)
      });
      seedUserData(u.id);
      localStorage.setItem(SESSION_KEY, u.id);
      return u;
    },
    async login(email, password, remember = true) {
      email = email.trim().toLowerCase();
      const u = table('users').first(x => x.email === email);
      if (!u || (await hash(password, u.salt)) !== u.password_hash) throw new Error('Incorrect email or password.');
      (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, u.id);
      table('users').update(u.id, { last_login: now() });
      return u;
    },
    logout() { localStorage.removeItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); },
    requestReset(email) {
      email = email.trim().toLowerCase();
      const u = table('users').first(x => x.email === email);
      if (!u) throw new Error('We could not find an account with that email.');
      const code = String(Math.floor(1000 + Math.random() * 9000));
      table('password_resets').removeWhere(r => r.user_id === u.id);
      table('password_resets').insert({ user_id: u.id, code, expires_at: new Date(Date.now() + 15 * 60000).toISOString() });
      return code; // in production this is emailed, never returned
    },
    verifyReset(email, code) {
      const u = table('users').first(x => x.email === email.trim().toLowerCase());
      const r = u && table('password_resets').first(x => x.user_id === u.id && x.code === code);
      if (!r || new Date(r.expires_at) < new Date()) throw new Error('That code is invalid or expired.');
      return true;
    },
    async resetPassword(email, code, password) {
      Auth.verifyReset(email, code);
      const u = table('users').first(x => x.email === email.trim().toLowerCase());
      const salt = uid('s');
      table('users').update(u.id, { salt, password_hash: await hash(password, salt) });
      table('password_resets').removeWhere(r => r.user_id === u.id);
    },
    async changePassword(userId, oldPw, newPw) {
      const u = table('users').find(userId);
      if ((await hash(oldPw, u.salt)) !== u.password_hash) throw new Error('Current password is incorrect.');
      const salt = uid('s');
      table('users').update(userId, { salt, password_hash: await hash(newPw, salt) });
    }
  };

  /* ---------- query helpers ---------- */
  const Q = {
    pets: (userId) => table('pets').where(p => p.user_id === userId),
    hotel: (id) => table('hotels').find(id),
    hotels: () => table('hotels').all(),
    roomTypes: () => ROOM_TYPES,
    room: (id) => ROOM_TYPES.find(r => r.id === id) || ROOM_TYPES[0],
    bookings: (userId) => table('bookings').where(b => b.user_id === userId)
      .sort((a, b) => a.check_in.localeCompare(b.check_in)),
    activeBooking: (userId) => table('bookings').first(b => b.user_id === userId && b.status === 'active'),
    bookingPets: (bookingId) => table('booking_pets').where(x => x.booking_id === bookingId)
      .map(x => table('pets').find(x.pet_id)).filter(Boolean),
    activities: (petId) => table('activities').where(a => a.pet_id === petId)
      .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at)),
    recentActivities: (userId, n = 6) => {
      const ids = new Set(Q.pets(userId).map(p => p.id));
      return table('activities').where(a => ids.has(a.pet_id))
        .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)).slice(0, n);
    },
    notifications: (userId) => table('notifications').where(n => n.user_id === userId)
      .sort((a, b) => b.at.localeCompare(a.at)),
    unread: (userId) => table('notifications').where(n => n.user_id === userId && !n.read).length,
    messages: (userId) => table('messages').where(m => m.user_id === userId)
      .sort((a, b) => a.at.localeCompare(b.at)),
    cameras: (hotelId) => table('cameras').where(c => c.hotel_id === hotelId),
    settings: (userId) => table('user_settings').first(s => s.user_id === userId)
  };

  window.DB = { init, table, on, Auth, Q, uid, reset() { localStorage.removeItem(KEY); Auth.logout(); location.href = 'index.html'; } };
})();
