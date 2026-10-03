// ROCIs Apps site behaviour.
// Security notes: no inline handlers, no globals, and no innerHTML with dynamic
// data — all user-visible text is written with textContent / createElement.
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const storage = {
    get(key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* storage blocked */ }
    }
  };

  // --- Theme ---------------------------------------------------------------
  const THEMES = ['light', 'dark', 'amoled'];
  const THEME_NAMES = { light: 'Light', dark: 'Dark', amoled: 'AMOLED black' };
  const themeToggle = $('#theme-toggle');
  const currentTheme = () => {
    const t = root.getAttribute('data-theme');
    return THEMES.includes(t) ? t : 'dark';
  };

  const labelThemeToggle = () => {
    if (!themeToggle) return;
    const t = currentTheme();
    const next = THEMES[(THEMES.indexOf(t) + 1) % THEMES.length];
    themeToggle.setAttribute('aria-label', `Theme: ${THEME_NAMES[t]}. Switch to ${THEME_NAMES[next]}`);
    themeToggle.title = `Theme: ${THEME_NAMES[t]}`;
  };

  // --- App simulator (declared early so the theme toggle can sync it) ------
  const simScreen = $('#sim-screen');
  const swatches = $$('.swatch[data-sim-theme]');
  let simThemePinned = false;

  const setSimTheme = (theme) => {
    if (!simScreen || !THEMES.includes(theme)) return;
    simScreen.setAttribute('data-theme', theme);
    swatches.forEach((s) => s.setAttribute('aria-pressed', String(s.dataset.simTheme === theme)));
  };

  if (themeToggle) {
    labelThemeToggle();
    themeToggle.addEventListener('click', () => {
      const next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
      root.setAttribute('data-theme', next);
      storage.set('theme', next);
      labelThemeToggle();
      if (!simThemePinned) setSimTheme(next);
    });
  }

  setSimTheme(currentTheme());
  swatches.forEach((s) => {
    s.addEventListener('click', () => {
      simThemePinned = true;
      setSimTheme(s.dataset.simTheme);
    });
  });

  const simTasks = $('#sim-tasks');
  const ring = $('.ring-value');
  const simPercent = $('#sim-percent');
  const simDone = $('#sim-done');
  const simLeft = $('#sim-left');
  const circumference = ring ? 2 * Math.PI * ring.r.baseVal.value : 0;

  const updateSimulator = () => {
    if (!simTasks) return;
    const items = $$('.check-row', simTasks);
    const done = items.filter((b) => b.getAttribute('aria-pressed') === 'true').length;
    const pct = items.length ? Math.round((done / items.length) * 100) : 0;
    if (simDone) simDone.textContent = String(done);
    if (simLeft) simLeft.textContent = String(items.length - done);
    if (simPercent) simPercent.textContent = String(pct);
    if (ring) {
      ring.style.strokeDasharray = `${circumference}`;
      ring.style.strokeDashoffset = `${circumference - (pct / 100) * circumference}`;
    }
  };

  const toggleCheck = (btn) => {
    btn.setAttribute('aria-pressed', String(btn.getAttribute('aria-pressed') !== 'true'));
  };

  if (simTasks) {
    simTasks.addEventListener('click', (e) => {
      const btn = e.target.closest('.check-row');
      if (!btn) return;
      toggleCheck(btn);
      updateSimulator();
    });
    updateSimulator();
  }

  // --- Mobile navigation ---------------------------------------------------
  const navToggle = $('#nav-toggle');
  const navLinks = $('#nav-links');

  const setNav = (open) => {
    if (!navToggle || !navLinks) return;
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => setNav(navToggle.getAttribute('aria-expanded') !== 'true'));
    navLinks.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setNav(false);
        navToggle.focus();
      }
    });
  }

  // --- Screenshot gallery: tabs ---------------------------------------------
  const tabs = $$('[role="tab"][data-app]');

  const selectTab = (tab, focus = false) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !selected;
    });
    if (focus) tab.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        selectTab(next, true);
      }
    });
  });

  $$('[data-show-gallery]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = tabs.find((t) => t.dataset.app === btn.dataset.showGallery);
      if (tab) selectTab(tab);
      const section = $('#screenshots');
      if (section) section.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  // --- Screenshot gallery: lightbox (native <dialog>) ------------------------
  const lightbox = $('#lightbox');
  const lbImg = $('#lb-img');
  const lbTitle = $('#lb-title');
  const lbDesc = $('#lb-desc');
  const lbCount = $('#lb-count');
  let lbItems = [];
  let lbIndex = 0;

  const showShot = (index) => {
    if (!lbItems.length) return;
    lbIndex = (index + lbItems.length) % lbItems.length;
    const shot = lbItems[lbIndex];
    const img = $('img', shot);
    lbImg.src = shot.dataset.full || img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbTitle.textContent = $('.shot-caption strong', shot)?.textContent || '';
    lbDesc.textContent = $('.shot-caption span', shot)?.textContent || '';
    lbCount.textContent = `${lbIndex + 1} / ${lbItems.length}`;
  };

  if (lightbox && typeof lightbox.showModal === 'function') {
    $$('.shot').forEach((shot) => {
      shot.addEventListener('click', () => {
        lbItems = $$('.shot', shot.closest('[role="tabpanel"]') || document);
        showShot(lbItems.indexOf(shot));
        lightbox.showModal();
      });
    });

    $('#lb-close')?.addEventListener('click', () => lightbox.close());
    $('#lb-prev')?.addEventListener('click', () => showShot(lbIndex - 1));
    $('#lb-next')?.addEventListener('click', () => showShot(lbIndex + 1));
    // Click on the backdrop (outside the figure) closes.
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
    lightbox.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') showShot(lbIndex - 1);
      else if (e.key === 'ArrowRight') showShot(lbIndex + 1);
    });
  }

  // --- Contact: copy email ---------------------------------------------------
  const copyBtn = $('#copy-email');
  const toast = $('#toast');
  let toastTimer;

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        if (toast) {
          toast.classList.add('is-visible');
          clearTimeout(toastTimer);
          toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
        }
      } catch (e) {
        // Clipboard refused — select the address so the user can copy it manually.
        const address = $('.email-address');
        if (address) window.getSelection()?.selectAllChildren(address);
      }
    });
  }

  // --- Side projects: copy a command ([data-copy]) ---------------------------
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        if (toast) {
          const label = $('span', toast);
          if (label && btn.dataset.copyDone) label.textContent = btn.dataset.copyDone;
          toast.classList.add('is-visible');
          clearTimeout(toastTimer);
          toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
        }
      } catch (e) {
        // Clipboard refused: select the command so it can be copied by hand.
        const cmd = btn.closest('.run-block')?.querySelector('.run-cmd');
        if (cmd) window.getSelection()?.selectAllChildren(cmd);
      }
    });
  });

  // --- Platform-aware hero CTAs ---------------------------------------------
  const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.rocisapps.tasks';
  const WEB_URL = 'https://tasks.rocisapps.com';
  const ctaPrimary = $('#cta-primary');
  const ctaSecondary = $('#cta-secondary');

  if (ctaPrimary && ctaSecondary && /Android/i.test(navigator.userAgent)) {
    ctaPrimary.href = PLAY_URL;
    $('.cta-label', ctaPrimary).textContent = 'Get it on Google Play';
    ctaSecondary.href = WEB_URL;
    $('.cta-label', ctaSecondary).textContent = 'Open the web app';
  }

  // --- Interactive demo: plain-language task parsing -------------------------
  const MAX_INPUT = 120;
  const demoInput = $('#demo-input');
  const demoTitle = $('#demo-title');
  const demoDue = $('#demo-due');
  const demoSubtasks = $('#demo-subtasks');
  const demoCta = $('#demo-cta');
  const chips = $$('.chip[data-sample]');
  const checkIcon = $('#tpl-check');

  const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const SUBTASKS = [
    { match: /\b(essay|paper|thesis|article)\b/, steps: [
      'Pick a thesis and gather sources',
      'Outline sections and topic sentences',
      'Write the full first draft',
      'Check citations, proofread and submit'
    ] },
    { match: /\b(lab|report|experiment)\b/, steps: [
      'Tabulate raw data and compute errors',
      'Plot figures and fit lines',
      'Write method, results and discussion',
      'Format appendix and submit'
    ] },
    { match: /\b(exam|midterm|final|quiz|test)\b/, steps: [
      'Summarise lecture slides and readings',
      'Do two past papers under time',
      'Build a one-page formula sheet',
      'Final active-recall review'
    ] },
    { match: /\b(problem set|pset|homework|math|algebra|calculus|physics)\b/, steps: [
      'Solve the theory questions',
      'Work through the applied problems',
      'Check answers against the solutions guide',
      'Scan pages into one PDF and submit'
    ] },
    { match: /\b(presentation|slides|talk)\b/, steps: [
      'Draft the storyline and key message',
      'Build the slides',
      'Rehearse twice with a timer',
      'Export and upload the final deck'
    ] }
  ];
  const DEFAULT_STEPS = [
    'Read the brief and grading rubric',
    'Split the work into milestones',
    'Finish a first draft',
    'Polish and hand in'
  ];

  const parseTask = (input) => {
    const raw = String(input || '').slice(0, MAX_INPUT).trim();
    if (!raw) return { title: 'Untitled task', due: 'Today, 11:59 PM', steps: DEFAULT_STEPS };

    let title = raw;
    let day = 'Tomorrow';
    let time = '11:59 PM';

    const timeMatch = raw.match(/\b(?:at\s+)?((?:1[0-2]|0?[1-9])(?::[0-5]\d)?\s*(?:am|pm)|(?:[01]?\d|2[0-3]):[0-5]\d)\b/i);
    if (timeMatch) {
      time = timeMatch[1].toUpperCase().replace(/\s+/g, '');
      if (/[AP]M$/.test(time)) {
        time = time.replace(/^(\d{1,2})(?::(\d{2}))?([AP]M)$/, (m, h, mm, ap) => `${h}:${mm || '00'} ${ap}`);
      }
      title = title.replace(timeMatch[0], ' ');
    }

    const dayPatterns = [
      [/\btoday\b/i, 'Today'],
      [/\btonight\b/i, 'Tonight'],
      [/\btomorrow\b/i, 'Tomorrow'],
      [/\bnext\s+week\b/i, 'Next week']
    ];
    WEEKDAYS.forEach((d) => {
      dayPatterns.push([new RegExp(`\\bnext\\s+${d}\\b`, 'i'), `Next ${cap(d)}`]);
      dayPatterns.push([new RegExp(`\\b(?:on\\s+)?${d}\\b`, 'i'), cap(d)]);
    });
    for (const [re, label] of dayPatterns) {
      if (re.test(title)) {
        day = label;
        title = title.replace(re, ' ');
        break;
      }
    }

    title = title
      .replace(/\s{2,}/g, ' ')
      .replace(/\b(at|on|due|by|for)\s*$/i, '')
      .trim();
    if (!title) title = raw;

    const lower = raw.toLowerCase();
    const found = SUBTASKS.find((s) => s.match.test(lower));
    return { title: cap(title), due: `${day}, ${time}`, steps: found ? found.steps : DEFAULT_STEPS };
  };

  const renderDemo = (task) => {
    if (demoTitle) demoTitle.textContent = task.title;
    if (demoDue) demoDue.textContent = task.due;

    if (demoSubtasks) {
      const items = task.steps.map((step) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'check-row';
        btn.setAttribute('aria-pressed', 'false');
        const box = document.createElement('span');
        box.className = 'check-box';
        box.setAttribute('aria-hidden', 'true');
        if (checkIcon) box.appendChild(checkIcon.content.cloneNode(true));
        const label = document.createElement('span');
        label.className = 'check-label';
        label.textContent = step;
        btn.append(box, label);
        li.appendChild(btn);
        return li;
      });
      demoSubtasks.replaceChildren(...items);
    }

    // Hand the draft to the web app via the URL (URLSearchParams encodes it safely).
    if (demoCta) {
      const params = new URLSearchParams({
        intent: 'academic_plan',
        draftTitle: task.title.slice(0, MAX_INPUT),
        draftDue: task.due,
        draftSubtasks: task.steps.join('||')
      });
      demoCta.href = `${WEB_URL}/?${params.toString()}`;
    }
  };

  if (demoInput) {
    demoInput.addEventListener('input', () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.sample === demoInput.value)));
      renderDemo(parseTask(demoInput.value));
    });

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        demoInput.value = chip.dataset.sample;
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        renderDemo(parseTask(chip.dataset.sample));
      });
    });

    if (demoSubtasks) {
      demoSubtasks.addEventListener('click', (e) => {
        const btn = e.target.closest('.check-row');
        if (btn) toggleCheck(btn);
      });
    }

    renderDemo(parseTask(demoInput.value));
  }
})();
