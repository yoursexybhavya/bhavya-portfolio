/**
 * Bhavya Jangid — Portfolio Client Application
 * Architected for fluid physical interactions & interactive workbench simulations
 */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initAudioSynthesizer();
  initMotionReveals();
  initWorkbench();
  initWayfinder();
  initSpiEngine();
  initTerminal();
  initContactCopy();
  initMobileNav();
});

/* ==========================================================================
   1. Live Indian Standard Time (IST / UTC+05:30) Clock
   ========================================================================== */
function initClock() {
  const clockEl = document.getElementById('istClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    // Format to Asia/Kolkata timezone
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    const timeStr = new Intl.DateTimeFormat('en-GB', options).format(now);
    clockEl.textContent = `${timeStr} IST`;
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. Tactile Synthetic Web Audio Feedback
   ========================================================================== */
let audioCtx = null;

function initAudioSynthesizer() {
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  window.playHapticTone = (freq = 640, duration = 0.04) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(200, freq * 0.5), ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Attach tactile response on all active controls
  document.querySelectorAll('button, .btn-primary, .btn-secondary, .nav-link, .nav-cta, .quick-cmd-btn').forEach(el => {
    el.addEventListener('pointerdown', () => {
      window.playHapticTone(720, 0.035);
    });
  });
}

/* ==========================================================================
   3. Motion Reveal Layer (Apple-Style Staggered Entrances)
   ========================================================================== */
function initMotionReveals() {
  const items = document.querySelectorAll('.reveal-item');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  });

  items.forEach(item => observer.observe(item));
}

/* ==========================================================================
   4. Interactive Workbench Navigation Tabs
   ========================================================================== */
function initWorkbench() {
  const tabs = [
    { btn: document.getElementById('tabBtnWayfinder'), panel: document.getElementById('panelWayfinder') },
    { btn: document.getElementById('tabBtnSpi'), panel: document.getElementById('panelSpi') },
    { btn: document.getElementById('tabBtnTerminal'), panel: document.getElementById('panelTerminal') }
  ];

  tabs.forEach(({ btn, panel }) => {
    if (!btn || !panel) return;
    btn.addEventListener('click', () => {
      tabs.forEach(t => {
        t.btn.classList.remove('is-active');
        t.btn.setAttribute('aria-selected', 'false');
        t.panel.classList.remove('is-active');
      });

      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      panel.classList.add('is-active');
      window.playHapticTone(840, 0.04);
    });
  });
}

/* ==========================================================================
   5. Mode 1: Topological Campus Wayfinder Simulation
   ========================================================================== */
function initWayfinder() {
  const selectOrigin = document.getElementById('selectOrigin');
  const selectDest = document.getElementById('selectDest');
  const routeDistEl = document.getElementById('routeDistance');
  const routeTimeEl = document.getElementById('routeTime');
  const routeStairsEl = document.getElementById('routeStairs');
  const turnListEl = document.getElementById('turnStepList');
  const ribbonPath = document.getElementById('svgRibbonPath');
  const originDot = document.getElementById('svgOriginDot');
  const destDot = document.getElementById('svgDestDot');

  if (!selectOrigin || !selectDest || !ribbonPath) return;

  // Node coordinates inside the 540x380 SVG
  const nodeMap = {
    entrance: { x: 90, y: 80, label: 'Main Campus Gate', floor: 'GF' },
    idea_lab: { x: 210, y: 80, label: 'Idea Lab & Maker Space', floor: 'GF' },
    amphitheater: { x: 270, y: 270, label: 'Amphitheater Courtyard', floor: 'GF' },
    drawing_hall: { x: 100, y: 300, label: 'Engineering Drawing Hall', floor: 'GF' },
    library: { x: 450, y: 80, label: 'Central Library F-36', floor: '1F' },
    hod_office: { x: 450, y: 300, label: 'HOD AI Research Suite', floor: '1F' },
    computer_lab: { x: 330, y: 80, label: 'Computer Science Lab 4', floor: '1F' },
    lecture_hall: { x: 330, y: 80, label: 'Lecture Theater 9', floor: 'GF' }
  };

  function recalculateRoute() {
    const origKey = selectOrigin.value;
    const destKey = selectDest.value;
    const orig = nodeMap[origKey] || nodeMap.entrance;
    const dest = nodeMap[destKey] || nodeMap.library;

    // Reposition dots
    originDot.setAttribute('cx', orig.x);
    originDot.setAttribute('cy', orig.y);
    destDot.setAttribute('cx', dest.x);
    destDot.setAttribute('cy', dest.y);

    // Calculate topological waypoint path along covered veranda centerline (|x|=130/410, |y|=90/290)
    let d = '';
    const needsStairs = orig.floor !== dest.floor;

    if (orig.x === dest.x && orig.y === dest.y) {
      d = `M ${orig.x} ${orig.y} L ${dest.x} ${dest.y}`;
    } else {
      // Waypoint path snapped to colonnade centerline
      d = `M ${orig.x} ${orig.y} L ${orig.x} 90 L ${Math.max(130, Math.min(410, (orig.x + dest.x) / 2))} 190 L ${dest.x} 90 L ${dest.x} ${dest.y}`;
    }

    ribbonPath.setAttribute('d', d);

    // Animate path stroke
    ribbonPath.style.strokeDasharray = '400';
    ribbonPath.style.strokeDashoffset = '400';
    requestAnimationFrame(() => {
      ribbonPath.style.transition = 'stroke-dashoffset 480ms cubic-bezier(0.16, 1, 0.3, 1)';
      ribbonPath.style.strokeDashoffset = '0';
    });

    // Approximate Euclidean + Manhattan campus distance
    const distMeters = Math.round(Math.hypot(dest.x - orig.x, dest.y - orig.y) * 0.28 + (needsStairs ? 18.5 : 4.0));
    const transitSeconds = Math.round(distMeters * 0.85);

    routeDistEl.textContent = `${distMeters}.2 meters`;
    routeTimeEl.textContent = `${transitSeconds} seconds`;
    routeStairsEl.textContent = needsStairs ? 'Twin Library Helical Staircase' : 'Single Level Corridor Transit';

    // Detailed Turn by Turn Directions
    const steps = [
      `Depart ${orig.label} along the covered colonnade veranda centerline`,
      `Advance across the central quadrangle axis toward the eastern corridor`,
      needsStairs ? 'Transition floor level via Twin Central Library helical staircase (22 spiral steps)' : 'Maintain level traversal along the covered veranda ground slab',
      `Arrive safely at destination doorway: ${dest.label}`
    ];

    turnListEl.innerHTML = steps.map(s => `<li class="turn-step-item">${s}</li>`).join('');
  }

  selectOrigin.addEventListener('change', () => {
    recalculateRoute();
    window.playHapticTone(680, 0.03);
  });

  selectDest.addEventListener('change', () => {
    recalculateRoute();
    window.playHapticTone(720, 0.03);
  });

  recalculateRoute();
}

/* ==========================================================================
   6. Mode 2: Clinical Cognitive SPI Simulator
   ========================================================================== */
function initSpiEngine() {
  const sliderAccuracy = document.getElementById('sliderAccuracy');
  const sliderLatency = document.getElementById('sliderLatency');
  const sliderVoice = document.getElementById('sliderVoice');

  const readoutAccuracy = document.getElementById('readoutAccuracy');
  const readoutLatency = document.getElementById('readoutLatency');
  const readoutVoice = document.getElementById('readoutVoice');

  const spiScoreEl = document.getElementById('spiScoreDisplay');
  const verdictBadge = document.getElementById('verdictBadge');
  const explanationEl = document.getElementById('spiClinicalExplanation');
  const dispatchStatusEl = document.getElementById('dispatchStatus');
  const syncFrequencyEl = document.getElementById('syncFrequency');

  const triggerScaffoldBtn = document.getElementById('triggerScaffoldBtn');
  const scaffoldStatusText = document.getElementById('scaffoldStatusText');

  if (!sliderAccuracy || !sliderLatency || !sliderVoice) return;

  const voiceLabels = {
    1: 'Level 1 (Neutral Synthesized)',
    2: 'Level 2 (Regional Voice)',
    3: 'Level 3 (ASHA Worker Voice)',
    4: 'Level 4 (Daughter / Son Voice)',
    5: 'Level 5 (Grandchild Voice Anchor)'
  };

  function updateSpi() {
    const accuracy = parseFloat(sliderAccuracy.value);
    const latencyMs = parseFloat(sliderLatency.value);
    const voiceLvl = parseInt(sliderVoice.value, 10);

    readoutAccuracy.textContent = `${Math.round(accuracy)}%`;
    readoutLatency.textContent = `${latencyMs.toLocaleString()} ms`;
    readoutVoice.textContent = voiceLabels[voiceLvl] || `Level ${voiceLvl}`;

    // Clinical SPI Calculation:
    // Accuracy holds 50%, Normalized Response Speed holds 35%, Familiar Voice anchors 15%
    const normalizedSpeed = Math.max(0, (4500 - latencyMs) / 4100);
    const spiRaw = (accuracy * 0.50) + (normalizedSpeed * 35) + (voiceLvl * 3.0);
    const spi = Math.min(99.4, Math.max(12.0, Math.round(spiRaw * 10) / 10));

    spiScoreEl.textContent = spi.toFixed(1);

    if (spi >= 75) {
      verdictBadge.textContent = 'STABLE TRAJECTORY';
      verdictBadge.className = 'verdict-badge status-stable';
      explanationEl.textContent = 'Cognitive recall latency remains within therapeutic baseline. The 14-session median trajectory indicates stable memory retention without accelerated regression.';
      dispatchStatusEl.textContent = 'Routine Weekly Family Digest';
      syncFrequencyEl.textContent = 'Normal 14-day PHC medical review cycle';
    } else if (spi >= 50) {
      verdictBadge.textContent = 'ELEVATED MONITORING';
      verdictBadge.className = 'verdict-badge status-monitor';
      explanationEl.textContent = 'Mild hesitation patterns observed in recent sessions. The adaptive engine has increased voice anchor repetition and auto-adjusted task difficulty down by one level.';
      dispatchStatusEl.textContent = 'Bi-Weekly Guardian Advisory';
      syncFrequencyEl.textContent = 'Accelerated 7-day ASHA community check-in';
    } else {
      verdictBadge.textContent = 'CLINICAL ALERT';
      verdictBadge.className = 'verdict-badge status-alert';
      explanationEl.textContent = 'Marked latency drop detected across cognitive sessions. System triggers 1-tap automated WhatsApp triage alert to registered family guardian and schedules priority PHC review.';
      dispatchStatusEl.textContent = 'Immediate Priority Guardian Alert';
      syncFrequencyEl.textContent = 'Urgent ASHA home visit dispatch';
    }
  }

  [sliderAccuracy, sliderLatency, sliderVoice].forEach(input => {
    input.addEventListener('input', () => {
      updateSpi();
    });
  });

  // 3-Second Errorless Scaffolding Protocol Simulation
  if (triggerScaffoldBtn && scaffoldStatusText) {
    let timer = null;
    triggerScaffoldBtn.addEventListener('click', () => {
      if (timer) clearTimeout(timer);
      scaffoldStatusText.textContent = 'Elder hesitation detected. Auto-scaffolding countdown active: 3.0s remaining...';
      scaffoldStatusText.style.color = 'var(--accent-amber)';
      window.playHapticTone(540, 0.05);

      timer = setTimeout(() => {
        scaffoldStatusText.textContent = 'Scaffolding deployed: UI simplified to 2 large high-contrast options. Zero red error states displayed. Voice prompt played.';
        scaffoldStatusText.style.color = 'var(--status-active)';
        window.playHapticTone(880, 0.06);
      }, 1600);
    });
  }

  updateSpi();
}

/* ==========================================================================
   7. Mode 3: Solar Ember Terminal Console
   ========================================================================== */
function initTerminal() {
  const terminalInput = document.getElementById('terminalInput');
  const terminalOutput = document.getElementById('terminalOutput');
  const terminalBody = document.getElementById('terminalBody');
  const quickCmdBtns = document.querySelectorAll('.quick-cmd-btn');

  if (!terminalInput || !terminalOutput || !terminalBody) return;

  const history = [];
  let historyIdx = -1;

  const commands = {
    help: `Available System Directives:
  whoami   - Developer biography and academic track
  repos    - Summary of active repositories and architectures
  skills   - Technical arsenal and systems competencies
  tests    - Automated verification scoreboards
  blaze    - Inspect Blaze pixel companion status
  contact  - Communication coordinates and links
  clear    - Flush terminal console screen`,

    whoami: `Bhavya Jangid (@yoursexybhavya)
Discipline : Full-Stack Developer & AI Systems Explorer
Undergrad  : B.Tech Computer Science (AI & ML) @ JIET Group of Institutions, Jodhpur (2026-2030)
Location   : Jodhpur, Rajasthan, India (UTC+05:30)
Mission    : Engineering spatial 3D twins, local-first healthcare, and resilient systems.`,

    repos: `Active System Repositories:
1. yoursexybhavya/campus-room-finder
   Description: UNIPATH 3D Digital Twin & Turn-by-Turn Indoor Wayfinding System
   Stack      : Blender 5.2, React Three Fiber, Three.js, Zustand, SQL.js WASM
   Tests      : 359/359 Passing (100%)
   Live       : https://campusroomfinder.vercel.app

2. yoursexybhavya/smriti-sathi
   Description: Multilingual Cognitive Care & Dementia Companion (SIH26003)
   Stack      : Bhashini AI, IndexedDB AES-256 Vault, BLE Mesh Sync, WCAG AAA
   Tests      : 285/285 Passing (100%)
   Live       : https://smriti-sathi.onrender.com

3. yoursexybhavya/yoursexybhavya
   Description: Solar Ember Engineering Profile & Telemetry Matrix`,

    skills: `Technical Arsenal Matrix:
Languages : TypeScript, Python, C, C++, Java, Rust, Go, JavaScript, SQL
Frontend  : React 19, Next.js, Three.js, React Three Fiber, Tailwind CSS, Leaflet
Backend   : Node.js, FastAPI, PostgreSQL, MongoDB, SQLite / SQL.js WASM, BigQuery
Systems   : Docker, Linux / macOS Shell, Git, Vercel, Render, Android APK`,

    tests: `Verification Scoreboard:
- UNIPATH 3D Campus Twin : 359 / 359 Passing (Vitest)
- Smriti Sathi E2E Track : 285 / 285 Passing (Jest / Vitest)
- Route Graph Geometry   : 3,721 Verified Collision-Free Pairs
- Accessibility Rating   : WCAG AAA Contrast Verified
- Aggregate Checks       : 644 / 644 Automated Passing Checks (100%)`,

    blaze: `  /\\_/\\  
 ( o.o )  Blaze: Living Pixel Cat Companion
  > ^ <   Status: Purring on Solar Ember Core. Guarding system architecture.`,

    contact: `Direct Communication Coordinates:
Email    : Krishnajangid6781@gmail.com
GitHub   : https://github.com/yoursexybhavya
LinkedIn : https://www.linkedin.com/in/bhavya-jangid-329371362/
Location : Jodhpur, Rajasthan, India`
  };

  function executeCommand(cmdRaw) {
    const cmd = cmdRaw.trim().toLowerCase();
    history.push(cmdRaw);
    historyIdx = history.length;

    let response = '';

    if (cmd === 'clear') {
      terminalOutput.textContent = '';
      return;
    } else if (commands[cmd]) {
      response = commands[cmd];
    } else if (cmd === 'cat blaze' || cmd === 'cat') {
      response = commands.blaze;
    } else if (cmd === '') {
      response = '';
    } else {
      response = `solarember: command not found: ${cmdRaw}. Type 'help' for valid directives.`;
    }

    terminalOutput.textContent += `\nbhavya@solarember:~$ ${cmdRaw}\n${response}`;
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = terminalInput.value;
      terminalInput.value = '';
      executeCommand(val);
      window.playHapticTone(600, 0.03);
    } else if (e.key === 'ArrowUp') {
      if (historyIdx > 0) {
        historyIdx--;
        terminalInput.value = history[historyIdx];
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIdx < history.length - 1) {
        historyIdx++;
        terminalInput.value = history[historyIdx];
      } else {
        historyIdx = history.length;
        terminalInput.value = '';
      }
    }
  });

  quickCmdBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) {
        executeCommand(cmd);
        window.playHapticTone(700, 0.035);
      }
    });
  });
}

/* ==========================================================================
   8. One-Click Email Copy with Tactile Acknowledgment
   ========================================================================== */
function initContactCopy() {
  const copyBtn = document.getElementById('copyEmailBtn');
  const emailText = 'Krishnajangid6781@gmail.com';

  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(emailText);
      } else {
        const temp = document.createElement('textarea');
        temp.value = emailText;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }

      copyBtn.textContent = 'Copied to Clipboard!';
      copyBtn.style.backgroundColor = 'var(--status-active)';
      window.playHapticTone(960, 0.06);

      setTimeout(() => {
        copyBtn.textContent = 'Copy Email Address';
        copyBtn.style.backgroundColor = 'var(--accent-ember)';
      }, 2400);
    } catch {
      copyBtn.textContent = 'Email: Krishnajangid6781@gmail.com';
    }
  });
}

/* ==========================================================================
   9. Mobile Menu Navigation
   ========================================================================== */
function initMobileNav() {
  const header = document.getElementById('header');
  const toggleBtn = document.getElementById('menuToggle');
  const navLinks = document.querySelectorAll('.nav-link, .nav-cta');

  if (!header || !toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-open');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    toggleBtn.textContent = isOpen ? 'Close' : 'Menu';
    window.playHapticTone(680, 0.03);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      header.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.textContent = 'Menu';
    });
  });
}
