/* ══════════════════════════════════════════
   FAC 4U — Future Apps Company
   main.js
══════════════════════════════════════════ */

/* ── 1. STARFIELD CON PARPADEO ORGÁNICO ── */
(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function genStars() {
    stars = [];
    // Más estrellas, distribuidas en todo el documento
    const count = Math.floor((W * H) / 2800);
    for (let i = 0; i < count; i++) {
      const baseOp = 0.25 + Math.random() * 0.75; // más brillantes
      stars.push({
        x:      Math.random() * W,
        y:      Math.random() * H,
        r:      Math.random() * 1.6 + 0.3,
        baseOp,
        speed:  Math.random() * 1.5 + 0.5,   // más rápidas para parpadeo visible
        phase:  Math.random() * Math.PI * 2,
        color:  starColor()
      });
    }
  }

  function starColor() {
    const palette = [
      'rgba(255,255,255,',
      'rgba(220,200,255,',  // tinte morado
      'rgba(200,215,255,',  // tinte azul
      'rgba(255,210,240,',  // tinte rosado
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.025; // más rápido → parpadeo claramente visible

    stars.forEach(s => {
      // Parpadeo senoidal con rango amplio
      const flicker = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      const alpha   = s.baseOp * flicker;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color + alpha + ')';
      ctx.fill();

      // Halo suave para estrellas grandes
      if (s.r > 1.2) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = s.color + (alpha * 0.15) + ')';
        ctx.fill();
      }
    });

    requestAnimationFrame(draw);
  }

  resize();
  genStars();
  draw();
  window.addEventListener('resize', () => { resize(); genStars(); });
})();


/* ── 2. CURSOR SPARKLE (solo desktop) ── */
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip en touch

  const dot = document.getElementById('cursor');
  if (!dot) return;

  document.addEventListener('mousemove', e => {
    dot.style.left = (e.clientX - 4) + 'px';
    dot.style.top  = (e.clientY - 4) + 'px';
  });

  document.addEventListener('click', e => {
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      const hue = Math.floor(Math.random() * 80 + 260); // púrpura-rosa
      p.style.cssText = `
        position:fixed; width:5px; height:5px; border-radius:50%;
        background: hsl(${hue},100%,75%);
        left:${e.clientX}px; top:${e.clientY}px;
        pointer-events:none; z-index:9998;
        transition: transform 0.65s cubic-bezier(0,0.9,0.57,1), opacity 0.65s ease;
        mix-blend-mode: screen;
      `;
      document.body.appendChild(p);
      const angle = (i / 8) * Math.PI * 2;
      const dist  = 28 + Math.random() * 36;
      requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px) scale(0)`;
        p.style.opacity   = '0';
      });
      setTimeout(() => p.remove(), 750);
    }
  });
})();


/* ── 3. MOBILE NAV ── */
function toggleMenu() {
  const nav = document.getElementById('mobileNav');
  const ham = document.getElementById('hamburger');
  nav.classList.toggle('open');
  ham.classList.toggle('active');
}

// Cerrar al hacer clic en un link
document.querySelectorAll('.mobile-nav a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('mobileNav').classList.remove('open');
    document.getElementById('hamburger').classList.remove('active');
  });
});


/* ── 4. SCROLL REVEAL ── */
(function () {
  const targets = document.querySelectorAll(
    '.card, .about-text, .about-visual, .contact-inner, .projects-header'
  );

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.animation = 'fadeUp 0.75s ease forwards';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach(el => {
    if (!el.classList.contains('card')) { // cards ya tienen su propia animación CSS
      el.style.opacity = '0';
    }
    io.observe(el);
  });
})();
