(() => {
  'use strict';

  // ---------- Mobile nav toggle ----------
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      navToggle.setAttribute('aria-expanded', String(!open));
    });
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.setAttribute('data-open', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Header Gala dropdown (hover on desktop, click on all) ----------
  document.querySelectorAll('[data-nav-gala]').forEach((wrap) => {
    const trigger = wrap.querySelector('.nav-gala__trigger');
    const open = () => { wrap.setAttribute('data-open', 'true'); trigger.setAttribute('aria-expanded', 'true'); };
    const close = () => { wrap.setAttribute('data-open', 'false'); trigger.setAttribute('aria-expanded', 'false'); };
    const toggle = () => wrap.getAttribute('data-open') === 'true' ? close() : open();

    wrap.addEventListener('mouseenter', open);
    wrap.addEventListener('mouseleave', close);
    trigger.addEventListener('click', (e) => { e.preventDefault(); toggle(); });
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { close(); trigger.focus(); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(); });
  });

  // ---------- Hero slideshow ----------
  document.querySelectorAll('[data-slideshow]').forEach((root) => {
    const scenes = Array.from(root.querySelectorAll('.slideshow__scene'));
    const dots = Array.from(root.querySelectorAll('.slideshow__dot'));
    const prev = root.querySelector('[data-slide-prev]');
    const next = root.querySelector('[data-slide-next]');
    const interval = parseInt(root.getAttribute('data-interval') || '5000', 10);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = 0;
    let timer = null;

    const show = (i) => {
      index = (i + scenes.length) % scenes.length;
      scenes.forEach((s, si) => s.setAttribute('data-active', si === index ? 'true' : 'false'));
      dots.forEach((d, di) => d.setAttribute('aria-current', di === index ? 'true' : 'false'));
    };
    const advance = () => show(index + 1);
    const start = () => { if (prefersReduced || scenes.length < 2) return; stop(); timer = setInterval(advance, interval); };
    const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
    const manual = (i) => { stop(); show(i); start(); };

    if (prev) prev.addEventListener('click', () => manual(index - 1));
    if (next) next.addEventListener('click', () => manual(index + 1));
    dots.forEach((d) => d.addEventListener('click', () => manual(parseInt(d.getAttribute('data-slide-goto'), 10))));

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);

    show(0);
    start();
  });

  // ---------- Gala past-events dropdown ----------
  document.querySelectorAll('[data-years]').forEach((wrap) => {
    const trigger = wrap.querySelector('[data-years-toggle]');
    const caret = wrap.querySelector('[data-years-caret]');
    trigger.addEventListener('click', () => {
      const open = wrap.getAttribute('data-open') === 'true';
      wrap.setAttribute('data-open', String(!open));
      trigger.setAttribute('aria-expanded', String(!open));
      if (caret) caret.textContent = open ? '▼' : '▲';
    });
  });

  // ---------- Wednesday-only date input ----------
  document.querySelectorAll('input[data-wednesday-only]').forEach((input) => {
    // Set min to today (or next Wednesday) so the picker doesn't offer past dates.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const min = today.toISOString().slice(0, 10);
    input.setAttribute('min', min);
    input.addEventListener('change', () => {
      if (!input.value) return;
      const d = new Date(input.value + 'T00:00:00');
      if (d.getDay() !== 3) {
        // Snap to the next Wednesday.
        const days = (3 - d.getDay() + 7) % 7 || 7;
        d.setDate(d.getDate() + days);
        input.value = d.toISOString().slice(0, 10);
      }
    });
  });

  // ---------- Guest form ----------
  document.querySelectorAll('[data-guest-form]').forEach((form) => {
    const submit = form.querySelector('[data-guest-submit]');
    const status = form.querySelector('[data-guest-status]');
    const setStatus = (msg, kind) => {
      if (!status) return;
      status.textContent = msg || '';
      if (kind) status.setAttribute('data-kind', kind); else status.removeAttribute('data-kind');
    };
    const setError = (name, shown) => {
      const el = form.querySelector(`[data-error-for="${name}"]`);
      if (el) el.setAttribute('data-shown', shown ? 'true' : 'false');
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot
      if (form.querySelector('[name="_gotcha"]').value) return;

      // Validate
      let valid = true;
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const date = form.date.value;
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      setError('name', !name); if (!name) valid = false;
      setError('email', !emailRe.test(email)); if (!emailRe.test(email)) valid = false;
      let dateOk = !!date;
      if (date) {
        const d = new Date(date + 'T00:00:00');
        dateOk = d.getDay() === 3;
      }
      setError('date', !dateOk); if (!dateOk) valid = false;

      if (!valid) { setStatus('Please fix the highlighted fields.', 'error'); return; }

      submit.disabled = true;
      const original = submit.textContent;
      submit.textContent = 'Sending…';
      setStatus('', null);

      const endpoint = form.getAttribute('data-endpoint');
      try {
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ name, email, date, notes: form.notes.value.trim() })
          });
          if (!res.ok) throw new Error('Request failed');
        } else {
          // Fallback: open the user's mail client with a pre-filled message.
          const subject = encodeURIComponent(`New guest for ${date}`);
          const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\nDate: ${date}\n\nNotes:\n${form.notes.value.trim() || '(none)'}`
          );
          window.location.href = `mailto:${form.getAttribute('action').replace('mailto:', '')}?subject=${subject}&body=${body}`;
        }
        submit.textContent = 'Thanks — see you Wednesday';
        setStatus(`We'll meet you at the door on ${new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. Winners Community Room, Metropolis at Metrotown.`, 'success');
        form.reset();
      } catch (err) {
        submit.textContent = original;
        submit.disabled = false;
        setStatus('Something went wrong. Please try again or email us directly.', 'error');
      }
    });
  });
})();
