/* ============================================================
   STAYCLOSE — SVG icon sprite
   Usage: icon('home')  ->  <svg class="icon"><use href="#i-home"></use></svg>
   ============================================================ */
(function () {
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-5h4v5"/>',
    video: '<rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="m15.5 10 6-3.5v11l-6-3.5"/>',
    chart: '<path d="M4 20V10"/><path d="M9.3 20V4"/><path d="M14.6 20v-7"/><path d="M20 20V8"/><path d="M2.5 20.5h19"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    chat: '<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.1A8.5 8.5 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    chevDown: '<path d="m6 9 6 6 6-6"/>',
    chevRight: '<path d="m9 6 6 6-6 6"/>',
    chevLeft: '<path d="m15 6-6 6 6 6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    paw: '<g class="pf"><ellipse cx="6" cy="9.5" rx="2.1" ry="2.7"/><ellipse cx="10" cy="5.6" rx="2.1" ry="2.8"/><ellipse cx="14.6" cy="5.6" rx="2.1" ry="2.8"/><ellipse cx="18.4" cy="9.6" rx="2.1" ry="2.7"/><path d="M12.3 11c-3 0-6.3 4.6-6.3 7.1 0 1.8 1.4 2.6 3 2.6 1.4 0 2.2-.8 3.3-.8s1.9.8 3.3.8c1.6 0 3-.8 3-2.6 0-2.5-3.3-7.1-6.3-7.1Z"/></g>',
    logo: '<path d="M4 13.5 16 3.5l12 10" stroke-width="2.4"/><path d="M7 11.5V27h18V11.5" stroke-width="2.4"/><g fill="currentColor" stroke="none"><ellipse cx="12.2" cy="16" rx="1.5" ry="1.9"/><ellipse cx="15" cy="13.6" rx="1.4" ry="1.9"/><ellipse cx="18" cy="13.6" rx="1.4" ry="1.9"/><ellipse cx="20.6" cy="16" rx="1.5" ry="1.9"/><path d="M16.4 17.2c-2 0-4.2 3-4.2 4.7 0 1.2.9 1.7 2 1.7.9 0 1.5-.5 2.2-.5s1.3.5 2.2.5c1.1 0 2-.5 2-1.7 0-1.7-2.2-4.7-4.2-4.7Z"/></g><path d="M27 23c2.5-1 3.5-3.4 3-6-2.4.3-4.2 2-4.4 4.6M26.5 26c1.8.2 3.4-.6 4.2-2.2" stroke="#7FA88A" stroke-width="1.8"/>',
    fork: '<path d="M7 3v7a2 2 0 0 0 2 2v9M11 3v7a2 2 0 0 1-2 2M9 3v6"/><path d="M17 21V3c-2 1.5-3 4-3 7v3h3"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
    heart: '<path d="M12 20.5s-8-4.7-8-11A4.5 4.5 0 0 1 12 6.8a4.5 4.5 0 0 1 8 2.7c0 6.3-8 11-8 11Z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.8-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.8Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16.2 9.6"/>',
    volume: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    mute: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
    camera: '<path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h2l1.5-2h6l1.5 2h2A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z"/><circle cx="12" cy="13" r="3.6"/>',
    record: '<rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="m15.5 10 6-3.5v11l-6-3.5"/><circle cx="9" cy="12" r="2.2" fill="currentColor"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
    phone: '<path d="M21 16.5v3a2 2 0 0 1-2.2 2A19 19 0 0 1 2.5 5.2 2 2 0 0 1 4.5 3h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L8 10.9a16 16 0 0 0 5.1 5.1l1.4-1.4a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z"/>',
    megaphone: '<path d="M3 10v4a1 1 0 0 0 1 1h3l9 5V4L7 9H4a1 1 0 0 0-1 1Z"/><path d="M7 15l1.5 5h2.5L10 15.5M19 9.5a3 3 0 0 1 0 5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
    file: '<path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8Z"/><path d="M14 3v5h5M8.5 13h7M8.5 16.5h5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7a9.9 9.9 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    shield: '<path d="M12 21s-8-3.5-8-10V5l8-2.5L20 5v6c0 6.5-8 10-8 10Z"/><path d="m8.5 12 2.4 2.4 4.6-4.8"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    send: '<path d="m21.5 2.5-9.8 19-2.4-8.3L1 10.8Z"/><path d="m21.5 2.5-12.2 10.7"/>',
    sparkle: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4Z"/><path d="M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"/>',
    bolt: '<path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12Z"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>',
    bank: '<path d="M3 9.5 12 4l9 5.5M4.5 10v8M9 10v8M15 10v8M19.5 10v8M3 20.5h18"/>',
    wallet: '<path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4h-12A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20H19a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2H5.5"/><circle cx="16.5" cy="13.5" r="1.3" fill="currentColor"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v1M14 20h1M17 17h4v4h-4"/>',
    edit: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-4-4L4 16Z"/><path d="m14 6 4 4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 12.5A1.5 1.5 0 0 0 8 21h8a1.5 1.5 0 0 0 1.5-1.5L18.5 7M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="9.5" r="1.8"/><path d="m21 16-5-5-9 9"/>',
    pill: '<rect x="2.6" y="8.2" width="18.8" height="7.6" rx="3.8" transform="rotate(-45 12 12)"/><path d="m8.5 8.5 7 7"/>',
    walk: '<circle cx="13" cy="4" r="1.8"/><path d="m9 20 2.5-6 3 3V21M7 12l2.5-4.5 4 1 2.5 3.5M11.5 14 13 8.5"/>',
    bowl: '<path d="M3 11h18a9 9 0 0 1-18 0Z"/><path d="M8 7c0-1 1-1.5 1-2.5M12 7c0-1 1-1.5 1-2.5M16 7c0-1 1-1.5 1-2.5"/>',
    play: '<path d="M7 4.5v15l12.5-7.5Z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.3-2.5 3.8M12 17.2h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8h.01"/>',
    alert: '<path d="M10.3 4 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4a2 2 0 0 0-3.4 0Z"/><path d="M12 9.5v4M12 17h.01"/>',
    ball: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6c3.5 3.5 3.5 9.3 0 12.8M18.4 5.6c-3.5 3.5-3.5 9.3 0 12.8"/>',
    bone: '<path d="M8 15.5 15.5 8a2.5 2.5 0 1 1 3.2-3.2A2.5 2.5 0 1 1 16 8.4L8.4 16a2.5 2.5 0 1 1-3.2 3.2A2.5 2.5 0 1 1 8 15.5Z"/>',
    snack: '<path d="M5 8h14l-1.5 11.5a1.5 1.5 0 0 1-1.5 1.5H8a1.5 1.5 0 0 1-1.5-1.5Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
    room: '<path d="M3 21V8l9-5 9 5v13"/><path d="M8 21v-7h8v7M3 21h18"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m11 12 9.5-9.5M17 6l2.5 2.5M14.5 8.5 17 11"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
    filter: '<path d="M3 5h18l-7 8.5V20l-4-2v-4.5Z"/>',
    dots: '<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    wifi: '<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10.5 10.5 0 0 1 14 0M8.5 15.5a5.5 5.5 0 0 1 7 0M12 19h.01"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    attach: '<path d="m20 11.5-8.4 8.4a5 5 0 0 1-7-7L13 4.5a3.4 3.4 0 0 1 4.8 4.8l-8.4 8.4a1.7 1.7 0 0 1-2.4-2.4L14.5 7.8"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>'
  };

  const svg = ['<svg xmlns="http://www.w3.org/2000/svg" style="display:none">'];
  for (const k in P) {
    const vb = k === 'logo' ? '0 0 32 32' : '0 0 24 24';
    svg.push(`<symbol id="i-${k}" viewBox="${vb}">${P[k]}</symbol>`);
  }
  svg.push('</svg>');
  const inject = () => document.body.insertAdjacentHTML('afterbegin', svg.join(''));
  if (document.body) inject(); else document.addEventListener('DOMContentLoaded', inject);

  // paw and filled shapes need fill instead of stroke
  const style = document.createElement('style');
  style.textContent = 'symbol#i-paw .pf, #i-paw .pf { fill: currentColor; stroke: none; } .icon use[href="#i-paw"] { fill: currentColor; stroke: none; } .icon.paw { fill: currentColor; stroke: none; }';
  document.head.appendChild(style);

  window.icon = (name, cls = '') =>
    `<svg class="icon ${name === 'paw' ? 'paw' : ''} ${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
})();
