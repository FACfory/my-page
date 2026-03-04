/* ══════════════════════════════════════════
   FAC 4U — Future Apps Company  |  main.js v3
══════════════════════════════════════════ */

const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;

/* ══════════════════════════════════════════
   1. STARFIELD
   — Desktop: canvas animado con parpadeo en loop
   — Mobile:  canvas estático pintado UNA SOLA VEZ
══════════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  const COLORS = [
    'rgba(255,255,255,',
    'rgba(225,205,255,',   // tinte lila
    'rgba(200,218,255,',   // tinte azul
    'rgba(255,210,240,',   // tinte rosa
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function genStars() {
    stars = [];
    /* Menos estrellas en mobile → menos trabajo de pintura */
    const density = IS_TOUCH ? 5500 : 2800;
    const count   = Math.floor((W * H) / density);

    for (let i = 0; i < count; i++) {
      stars.push({
        x:      Math.random() * W,
        y:      Math.random() * H,
        r:      Math.random() * (IS_TOUCH ? 1.2 : 1.6) + 0.25,
        baseOp: 0.3 + Math.random() * 0.7,
        speed:  Math.random() * 1.2 + 0.4,
        phase:  Math.random() * Math.PI * 2,
        color:  COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
  }

  /* ── MOBILE: pinta una vez, sin loop ── */
  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color + s.baseOp + ')';
      ctx.fill();
    });
  }

  /* ── DESKTOP: loop con parpadeo ── */
  let t = 0;
  let rafId = null;

  function drawAnimated() {
    ctx.clearRect(0, 0, W, H);
    t += 0.025;

    stars.forEach(s => {
      const flicker = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      const alpha   = s.baseOp * flicker;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color + alpha + ')';
      ctx.fill();

      /* halo suave para estrellas grandes */
      if (s.r > 1.1) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = s.color + (alpha * 0.14) + ')';
        ctx.fill();
      }
    });

    rafId = requestAnimationFrame(drawAnimated);
  }

  function init() {
    resize();
    genStars();
    if (IS_TOUCH) {
      drawStatic();
    } else {
      if (rafId) cancelAnimationFrame(rafId);
      drawAnimated();
    }
  }

  init();
  window.addEventListener('resize', init);
})();


/* ══════════════════════════════════════════
   2. INTERACCIÓN AL TOCAR / CLICK
   — Desktop: cursor sparkle + partículas al click
   — Mobile:  ripple circular en el punto de toque
══════════════════════════════════════════ */
(function () {
  if (!IS_TOUCH) {
    /* ── Desktop cursor ── */
    const dot = document.getElementById('cursor');
    if (dot) {
      dot.style.display = 'block';
      document.addEventListener('mousemove', e => {
        dot.style.left = (e.clientX - 4) + 'px';
        dot.style.top  = (e.clientY - 4) + 'px';
      });
    }

    /* Partículas al hacer click */
    document.addEventListener('click', e => {
      for (let i = 0; i < 8; i++) {
        const p   = document.createElement('div');
        const hue = Math.floor(Math.random() * 80 + 260);
        p.style.cssText = `
          position:fixed;width:5px;height:5px;border-radius:50%;
          background:hsl(${hue},100%,75%);
          left:${e.clientX}px;top:${e.clientY}px;
          pointer-events:none;z-index:9998;
          transition:transform .65s cubic-bezier(0,.9,.57,1),opacity .65s ease;
          mix-blend-mode:screen;
        `;
        document.body.appendChild(p);
        const angle = (i / 8) * Math.PI * 2;
        const dist  = 28 + Math.random() * 36;
        requestAnimationFrame(() => {
          p.style.transform = `translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px) scale(0)`;
          p.style.opacity   = '0';
        });
        setTimeout(() => p.remove(), 750);
      }
    });

  } else {
    /* ── Mobile ripple ── */
    document.addEventListener('touchstart', e => {
      const touch = e.touches[0];
      const size  = 80;
      const r = document.createElement('div');
      r.className = 'touch-ripple';
      r.style.cssText = `
        width:${size}px;height:${size}px;
        left:${touch.clientX - size/2}px;
        top:${touch.clientY  - size/2}px;
      `;
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 650);
    }, { passive: true });
  }
})();


/* ══════════════════════════════════════════
   3. MOBILE NAV
══════════════════════════════════════════ */
function toggleMenu() {
  const nav = document.getElementById('mobileNav');
  const ham = document.getElementById('hamburger');
  if (!nav || !ham) return;
  nav.classList.toggle('open');
  ham.classList.toggle('active');
}

document.querySelectorAll('.mobile-nav a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('mobileNav')?.classList.remove('open');
    document.getElementById('hamburger')?.classList.remove('active');
  });
});


/* ══════════════════════════════════════════
   4. SCROLL REVEAL
   Usa IntersectionObserver — cero impacto en rendimiento
══════════════════════════════════════════ */
(function () {
  const targets = document.querySelectorAll(
    '.about-text, .about-visual, .contact-inner, .projects-header, .section-label'
  );

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity  = '1';
        entry.target.style.animation = 'fadeUp 0.75s ease forwards';
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach(el => {
    el.style.opacity = '0';
    io.observe(el);
  });
})();


/* ══════════════════════════════════════════
   5. SECTION VEIL — efecto de luz/oscuridad entre secciones
   Cuando haces scroll el fondo se oscurece levemente
   y al llegar a una sección "ilumina" sutilmente.
   Usa throttle para no ejecutarse en cada px.
══════════════════════════════════════════ */
(function () {
  const veil = document.getElementById('sectionVeil');
  if (!veil) return;

  const sections = document.querySelectorAll('section');
  let lastActive = null;
  let ticking    = false;

  function getSectionProgress() {
    const scrollY  = window.scrollY;
    const winH     = window.innerHeight;
    let   active   = null;
    let   progress = 0; // 0 = center, ±1 = edge

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      /* Si el centro de la sección está dentro de la ventana */
      if (rect.top < winH * 0.65 && rect.bottom > winH * 0.35) {
        active = sec;
        /* Qué tan centrada está (0 = perfecta, 1 = borde) */
        const center = rect.top + rect.height / 2;
        progress = Math.abs(center - winH / 2) / (winH / 2);
      }
    });

    return { active, progress };
  }

  function update() {
    const { active, progress } = getSectionProgress();

    if (active !== lastActive) {
      /* Transición entre secciones → oscurecer momentáneamente */
      veil.classList.add('dim');
      setTimeout(() => {
        veil.classList.remove('dim');
        veil.classList.add('glow');
        setTimeout(() => veil.classList.remove('glow'), 700);
      }, 350);
      lastActive = active;
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();
