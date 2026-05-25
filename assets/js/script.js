const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuBtn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    });
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll('.reveal').forEach((section) => {
  observer.observe(section);
});

// Touch-friendly flip toggle for tool cards
function attachToolCardListener(card) {
  card.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target.closest('.tool-card')) {
      card.classList.toggle('is-flipped');
    }
  });
}

document.querySelectorAll('.tool-card').forEach((card) => {
  attachToolCardListener(card);
});

function initAssistantCalendar() {
  const calendars = document.querySelectorAll('[data-assistant-calendar]');
  if (!calendars.length) {
    return;
  }

  calendars.forEach((calendar) => {
    const monthLabel = calendar.querySelector('[data-calendar-month]');
    const todayLabel = calendar.querySelector('[data-calendar-today]');
    const grid = calendar.querySelector('[data-calendar-grid]');
    if (!monthLabel || !todayLabel || !grid) {
      return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

    monthLabel.textContent = now.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
    todayLabel.textContent = String(today);

    const dayCells = [];

    for (let i = 0; i < firstDayIndex; i += 1) {
      dayCells.push(`<span class="assistant-calendar-day is-muted">${daysInPrevMonth - firstDayIndex + i + 1}</span>`);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const todayClass = day === today ? ' is-today' : '';
      dayCells.push(`<span class="assistant-calendar-day${todayClass}">${day}</span>`);
    }

    let nextMonthDay = 1;
    while (dayCells.length < totalCells) {
      dayCells.push(`<span class="assistant-calendar-day is-muted">${nextMonthDay}</span>`);
      nextMonthDay += 1;
    }

    grid.innerHTML = dayCells.join('');
  });
}

initAssistantCalendar();

function initDinoGame() {
  const gameScenes = document.querySelectorAll('[data-dino-game]');
  if (!gameScenes.length) {
    return;
  }

  gameScenes.forEach((scene) => {
    const card = scene.closest('.dino-game-card');
    const scoreEl = card ? card.querySelector('[data-dino-score]') : null;
    const restartButton = card ? card.querySelector('[data-dino-restart]') : null;
    const messageEl = scene.querySelector('[data-dino-message]');
    const characterEl = scene.querySelector('[data-dino-character]');
    const obstacleLayer = scene.querySelector('[data-dino-obstacles]');

    if (!scoreEl || !restartButton || !messageEl || !characterEl || !obstacleLayer) {
      return;
    }

    const state = {
      running: false,
      gameOver: false,
      score: 0,
      speed: 260,
      jumpVelocity: 610,
      gravity: 1700,
      y: 0,
      vy: 0,
      lastTime: 0,
      obstacleTimer: 0,
      groundOffset: 0,
      obstacles: []
    };

    const dinoMetrics = {
      x: 28,
      width: 40,
      height: 30,
      groundBottom: 21
    };

    function updateScore() {
      scoreEl.textContent = Math.floor(state.score).toString().padStart(5, '0');
    }

    function clearObstacles() {
      state.obstacles.forEach((obstacle) => obstacle.el.remove());
      state.obstacles = [];
    }

    function resetGame() {
      state.running = false;
      state.gameOver = false;
      state.score = 0;
      state.speed = 260;
      state.y = 0;
      state.vy = 0;
      state.lastTime = 0;
      state.obstacleTimer = 700;
      state.groundOffset = 0;
      clearObstacles();
      characterEl.style.transform = 'translateY(0px)';
      characterEl.classList.remove('is-running');
      scene.style.setProperty('--ground-offset', '0px');
      messageEl.hidden = false;
      messageEl.textContent = 'Press Space / Tap to Start';
      restartButton.hidden = true;
      updateScore();
    }

    function spawnObstacle() {
      const obstacle = document.createElement('span');
      obstacle.className = 'dino-obstacle';

      const tall = Math.random() > 0.45;
      const width = tall ? 11 : 17;
      const height = tall ? 25 : 18;

      obstacle.style.width = `${width}px`;
      obstacle.style.height = `${height}px`;

      const x = scene.clientWidth + 12;
      obstacle.style.left = `${x}px`;

      obstacleLayer.appendChild(obstacle);
      state.obstacles.push({ el: obstacle, x, width, height });
    }

    function setMessage(text) {
      messageEl.hidden = false;
      messageEl.textContent = text;
    }

    function startGame() {
      if (state.running || state.gameOver) {
        return;
      }

      state.running = true;
      messageEl.hidden = true;
      characterEl.classList.add('is-running');
    }

    function jump() {
      if (state.gameOver) {
        return;
      }

      startGame();

      if (state.y <= 0.5) {
        state.vy = state.jumpVelocity;
      }
    }

    function endGame() {
      state.running = false;
      state.gameOver = true;
      characterEl.classList.remove('is-running');
      setMessage('Game Over');
      restartButton.hidden = false;
    }

    function collidesWithDino(obstacle) {
      const sceneHeight = scene.clientHeight;
      const dinoLeft = dinoMetrics.x + 3;
      const dinoRight = dinoMetrics.x + dinoMetrics.width - 3;
      const dinoTop = sceneHeight - (dinoMetrics.groundBottom + state.y + dinoMetrics.height) + 2;
      const dinoBottom = sceneHeight - (dinoMetrics.groundBottom + state.y) - 1;

      const obsLeft = obstacle.x + 1;
      const obsRight = obstacle.x + obstacle.width - 1;
      const obsTop = sceneHeight - (dinoMetrics.groundBottom + obstacle.height);
      const obsBottom = sceneHeight - dinoMetrics.groundBottom;

      return dinoLeft < obsRight && dinoRight > obsLeft && dinoTop < obsBottom && dinoBottom > obsTop;
    }

    function updateFrame(timestamp) {
      if (!state.lastTime) {
        state.lastTime = timestamp;
      }

      const delta = Math.min((timestamp - state.lastTime) / 1000, 0.04);
      state.lastTime = timestamp;

      if (state.running) {
        state.score += delta * 70;
        state.speed = Math.min(520, state.speed + delta * 5);
        updateScore();

        state.groundOffset -= state.speed * delta;
        scene.style.setProperty('--ground-offset', `${state.groundOffset}px`);

        state.vy -= state.gravity * delta;
        state.y += state.vy * delta;
        if (state.y <= 0) {
          state.y = 0;
          state.vy = 0;
          characterEl.classList.add('is-running');
        } else {
          characterEl.classList.remove('is-running');
        }

        characterEl.style.transform = `translateY(${-state.y}px)`;

        state.obstacleTimer -= delta * 1000;
        if (state.obstacleTimer <= 0) {
          spawnObstacle();
          const spawnBase = Math.max(500, 1200 - state.speed);
          state.obstacleTimer = spawnBase + Math.random() * 420;
        }

        state.obstacles.forEach((obstacle) => {
          obstacle.x -= state.speed * delta;
          obstacle.el.style.left = `${obstacle.x}px`;
        });

        state.obstacles = state.obstacles.filter((obstacle) => {
          if (obstacle.x + obstacle.width < -8) {
            obstacle.el.remove();
            return false;
          }

          if (!state.gameOver && collidesWithDino(obstacle)) {
            endGame();
          }

          return true;
        });
      }

      requestAnimationFrame(updateFrame);
    }

    function handleGameControl(event) {
      if (!['Space', 'ArrowUp'].includes(event.code)) {
        return;
      }

      const panel = document.querySelector('#panel-development');
      const isDevelopmentPanelActive = panel && panel.classList.contains('active');
      if (!isDevelopmentPanelActive) {
        return;
      }

      const targetTag = (event.target && event.target.tagName) || '';
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') {
        return;
      }

      event.preventDefault();
      jump();
    }

    scene.addEventListener('click', () => {
      scene.focus();
      jump();
    });

    scene.addEventListener('keydown', (event) => {
      if (!['Space', 'ArrowUp'].includes(event.code)) {
        return;
      }

      event.preventDefault();
      jump();
    });

    restartButton.addEventListener('click', () => {
      resetGame();
      startGame();
      jump();
    });

    document.addEventListener('keydown', handleGameControl);

    resetGame();
    requestAnimationFrame(updateFrame);
  });
}

initDinoGame();

const panelLinks = document.querySelectorAll('.nav a[data-panel]');
const panels = document.querySelectorAll('.main-panel');
const mainBox = document.querySelector('#main-box');

function activatePanel(panelName) {
  if (mainBox) {
    mainBox.setAttribute('data-active-panel', panelName);
  }

  panels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === `panel-${panelName}`);
  });

  panelLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.panel === panelName);
  });

  if (panelName === 'assistant') {
    document.querySelectorAll('#panel-assistant .assistant-chart-fill').forEach((fill) => {
      fill.style.animation = 'none';
      fill.offsetHeight; // force reflow
      fill.style.animation = '';
    });
  }
}

if (panelLinks.length && panels.length && mainBox) {
  activatePanel('overview');

  panelLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const panelName = link.dataset.panel;
      if (!panelName) {
        return;
      }

      activatePanel(panelName);
      mainBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('[data-panel-jump]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const panelName = link.getAttribute('data-panel-jump');
      if (!panelName) {
        return;
      }

      activatePanel(panelName);
      mainBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

const repoLanguageLogos = {
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  HTML: 'html5',
  CSS: 'css',
  PHP: 'php',
  Python: 'python',
  Dart: 'dart',
  Vue: 'vuedotjs',
  'C#': 'csharp',
  Java: 'openjdk',
  Shell: 'gnubash',
  'C++': 'cplusplus',
  C: 'c',
  Go: 'go',
  Kotlin: 'kotlin',
  Swift: 'swift',
  Ruby: 'ruby',
  Rust: 'rust'
};

const repoLanguageColors = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  HTML:       '#e34f26',
  CSS:        '#264de4',
  PHP:        '#777bb4',
  Python:     '#3776ab',
  Dart:       '#00b4ab',
  Vue:        '#42b883',
  'C#':       '#239120',
  Java:       '#f89820',
  Shell:      '#4eaa25',
  'C++':      '#00599c',
  C:          '#a8b9cc',
  Go:         '#00add8',
  Kotlin:     '#7f52ff',
  Swift:      '#f05138',
  Ruby:       '#cc342d',
  Rust:       '#dea584'
};

function getRepoLanguageLogo(language) {
  if (!language) {
    return 'https://cdn.simpleicons.org/git';
  }

  const slug = repoLanguageLogos[language];
  if (!slug) {
    return 'https://cdn.simpleicons.org/codeforces';
  }

  return `https://cdn.simpleicons.org/${slug}`;
}

function buildRepoCard(repo, languages) {
  const description = repo.description || 'No description provided.';
  const langs = (languages && Object.keys(languages).length ? Object.keys(languages) : (repo.language ? [repo.language] : [])).slice(0, 3);
  const primaryLang = langs[0] || null;
  const langColor = repoLanguageColors[primaryLang] || '#1a1a1a';

  const langChips = langs.map(lang => {
    const color = repoLanguageColors[lang] || '#888';
    return `<span class="repo-lang-chip" style="--chip-color:${color}">${lang}</span>`;
  }).join('');

  return `
    <a class="repo-card" href="${repo.html_url}" target="_blank" rel="noreferrer" style="--lang-color:${langColor}" data-repo-name="${repo.name}">
      <strong>${repo.name}</strong>
      <span>${description}</span>
      ${langChips ? `<small class="repo-lang-chips">${langChips}</small>` : ''}
    </a>
  `;
}

const REPO_CACHE_TTL  = 30 * 60 * 1000;      // 30 min
const LANG_CACHE_TTL  = 24 * 60 * 60 * 1000; // 24 h

function cacheGet(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function cacheSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

async function fetchAllRepos(username) {
  const key = `gh_repos_${username}`;
  const cached = cacheGet(key);
  if (cached && Date.now() - cached.ts < REPO_CACHE_TTL) return cached.repos;

  const repos = [];
  let page = 1;
  while (true) {
    const r = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100&page=${page}&direction=desc`);
    if (r.status === 403 || r.status === 429) throw new Error('rate_limit');
    if (!r.ok) throw new Error('api_error');
    const batch = await r.json();
    repos.push(...batch);
    if (batch.length < 100) break;
    page++;
  }

  cacheSet(`gh_repos_${username}`, { ts: Date.now(), repos });
  return repos;
}

async function fetchRepoLanguages(username, repos) {
  const key = `gh_langs_${username}`;
  const cached = cacheGet(key);
  if (cached && Date.now() - cached.ts < LANG_CACHE_TTL) return cached.langs;

  const langMap = {};
  const BATCH = 8;
  for (let i = 0; i < repos.length; i += BATCH) {
    const batch = repos.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(repo =>
        fetch(repo.languages_url)
          .then(r => r.ok ? r.json() : null)
          .catch(() => null)
      )
    );
    let rateLimited = false;
    results.forEach((langs, j) => {
      if (langs === null) { rateLimited = true; return; }
      langMap[batch[j].name] = langs;
    });
    if (rateLimited) break; // stop fetching if rate limited, use what we have
  }

  cacheSet(key, { ts: Date.now(), langs: langMap });
  return langMap;
}

async function loadGitHubRepos() {
  const repoContainers = document.querySelectorAll('[data-github-repos]');

  // Group containers by username so we only fetch once per account
  const byUsername = {};
  repoContainers.forEach(c => {
    const u = c.getAttribute('data-github-username');
    if (u) (byUsername[u] = byUsername[u] || []).push(c);
  });

  for (const [username, containers] of Object.entries(byUsername)) {
    containers.forEach(c => { c.innerHTML = '<p class="github-note">Loading repositories...</p>'; });

    let repos = [];
    try {
      repos = await fetchAllRepos(username);
    } catch (err) {
      const msg = err.message === 'rate_limit'
        ? 'GitHub rate limit reached — try again in an hour.'
        : 'Repositories could not be loaded right now.';
      containers.forEach(c => { c.innerHTML = `<p class="github-note">${msg}</p>`; });
      continue;
    }

    if (!repos.length) {
      containers.forEach(c => { c.innerHTML = '<p class="github-note">No public repositories found.</p>'; });
      continue;
    }

    // Render immediately with primary language only
    const initialCards = repos.map(repo => buildRepoCard(repo, null)).join('');
    containers.forEach(c => {
      c.innerHTML = `<div class="repos-track">${initialCards}${initialCards}</div>`;
      initRepoDrag(c);
    });

    // Fetch all languages (cached 24h) and update cards
    const langMap = await fetchRepoLanguages(username, repos).catch(() => ({}));
    repos.forEach(repo => {
      const langs = langMap[repo.name];
      if (!langs || !Object.keys(langs).length) return;
      const newCard = buildRepoCard(repo, langs);
      containers.forEach(c => {
        c.querySelectorAll(`[data-repo-name="${repo.name}"]`).forEach(el => {
          el.outerHTML = newCard;
        });
      });
    });
  }
}

function initRepoDrag(grid) {
  const track = grid.querySelector('.repos-track');
  if (!track) return;

  grid.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
  grid.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
}

loadGitHubRepos();

const resumeModal = document.querySelector('[data-resume-modal]');
const resumeModalOpenButtons = document.querySelectorAll('[data-open-resume-modal]');
const resumeModalCloseButtons = document.querySelectorAll('[data-resume-modal-close]');
const galleryModal = document.querySelector('[data-gallery-modal]');
const galleryModalImage = document.querySelector('[data-gallery-modal-image]');
const galleryModalTitle = document.querySelector('[data-gallery-modal-title]');
const galleryModalCount = document.querySelector('[data-gallery-modal-count]');
const galleryOpenButtons = document.querySelectorAll('[data-gallery-open]');
const galleryCloseButtons = document.querySelectorAll('[data-gallery-modal-close]');
const galleryPrevButton = document.querySelector('[data-gallery-modal-prev]');
const galleryNextButton = document.querySelector('[data-gallery-modal-next]');

const galleryCollections = {
  brand: [
    {
      src: 'assets/images/brand/logo.png',
      alt: 'Kamangyan Chili Garlic logo',
      title: 'Kamangyan Chili Garlic',
      moodboard: true,
      subtitle: 'Food & Condiment Brand',
      description: 'Bold and fiery identity for a local Filipino chili garlic brand — warm earthy tones and energetic character that puts the heat front and center.',
      colors: ['#cc1515', '#3a8c1e', '#f5c425', '#1a1a1a'],
      colorRoles: ['Chili Red', 'Garlic Green', 'Spice Gold', 'Outline'],
      tags: ['Food Brand', 'Packaging', 'Local Brand']
    },
    {
      src: 'assets/images/brand/logo1.png',
      alt: 'Cello-IT cellphone store logo',
      title: 'Cello-IT',
      moodboard: true,
      subtitle: 'Cellphone Retail Store',
      description: 'Modern and trustworthy identity for a cellphone retail store — clean tech aesthetics that communicate reliability and cutting-edge service.',
      colors: ['#f7a520', '#29b5e8', '#e8f6fc', '#ffffff'],
      colorRoles: ['Brand Orange', 'Sky Blue', 'Tint', 'White'],
      tags: ['Retail', 'Technology', 'Store Brand']
    },
    {
      src: 'assets/images/brand/logo4.png',
      alt: 'uBeequitous tech company logo',
      title: 'uBeequitous',
      moodboard: true,
      subtitle: 'Technology Company',
      description: 'Forward-thinking identity for a tech company bridging innovation and accessibility — vibrant and energetic with a playful mascot spirit.',
      colors: ['#f5b72a', '#00c8d4', '#e91e8c', '#1a1a1a'],
      colorRoles: ['Bee Amber', 'Cyber Cyan', 'Neon Pink', 'Black'],
      tags: ['Tech Company', 'Software', 'Innovation']
    },
    {
      src: 'assets/images/brand/icon.png',
      alt: 'Hey Enterprises ecommerce logo',
      title: 'Hey Enterprises',
      moodboard: true,
      subtitle: 'E-Commerce Company',
      description: 'Friendly and approachable identity for an e-commerce brand — warm golden tones paired with sky blue convey energy, trust, and forward momentum.',
      colors: ['#f5aa00', '#29abe2', '#1a7bbf', '#ffffff'],
      colorRoles: ['Brand Gold', 'Sky Blue', 'Deep Blue', 'White'],
      tags: ['E-Commerce', 'Retail', 'Online Store']
    },
    {
      src: 'assets/images/brand/ikun.png',
      alt: 'Metari ecommerce logo',
      title: 'Metari',
      moodboard: true,
      subtitle: 'E-Commerce Marketplace',
      description: 'Partnership-driven identity symbolised by a handshake — bold blue and golden amber represent trust, collaboration, and commerce working hand in hand.',
      colors: ['#2980d4', '#f5aa22', '#1a5fa0', '#ffffff'],
      colorRoles: ['Brand Blue', 'Brand Gold', 'Deep Blue', 'White'],
      tags: ['E-Commerce', 'Marketplace', 'Partnership']
    },
    {
      src: 'assets/images/brand/logouuu.png',
      alt: 'Mathew Water Refilling Station logo',
      title: 'Mathew Water',
      moodboard: true,
      subtitle: 'Water Refilling Station',
      description: 'Pure and refreshing identity for a local water refilling station — fluid blues and a golden crown communicate premium quality and everyday trust.',
      colors: ['#29abe2', '#f5c030', '#7fd3f0', '#ffffff'],
      colorRoles: ['Wave Blue', 'Crown Gold', 'Aqua Tint', 'White'],
      tags: ['Water Station', 'Local Brand', 'Service']
    }
  ],
  social: [
    {
      src: 'assets/images/social/fbsample1.jpg',
      alt: 'BulletproofZone ballistic helmet product ad',
      title: 'Ballistic Helmet Ad',
      type: 'social',
      subtitle: 'Product Campaign',
      platform: 'Facebook · Instagram',
      format: '1080 × 1080 · Square',
      description: 'High-impact product ad for BulletproofZone — tactical bold typography and diagonal stripe layouts drive urgency for a premium tactical helmet.',
      colors: ['#1a1a1a', '#c84b0a', '#ffffff', '#e8e0d8'],
      colorRoles: ['Black', 'Brand Orange', 'White', 'Light'],
      tags: ['Product Ad', 'E-Commerce', 'Tactical']
    },
    {
      src: 'assets/images/social/budangposter.jpg',
      alt: 'Bistro Pares franchise recruitment poster',
      title: 'Bistro Pares',
      type: 'social',
      subtitle: 'Franchise Campaign',
      platform: 'Facebook',
      format: '1080 × 1350 · Portrait',
      description: 'Franchise recruitment poster for Bistro Pares — personality-led design spotlights the owner to build trust and drive co-franchise sign-ups.',
      colors: ['#8b1a1a', '#1a1a1a', '#ffffff', '#c0c0c0'],
      colorRoles: ['Brand Red', 'Dark', 'White', 'Silver'],
      tags: ['Franchise', 'Food & Dining', 'Local Brand']
    },
    {
      src: 'assets/images/social/fb.jpg',
      alt: 'Morning Brew coffee product launch ad',
      title: 'Morning Brew',
      type: 'social',
      subtitle: 'Product Launch',
      platform: 'Facebook · Instagram',
      format: '1080 × 1080 · Square',
      description: 'Vibrant product launch post for Morning Brew — dynamic coffee splash photography paired with warm amber tones captures freshness and energy.',
      colors: ['#f5a800', '#5c3d11', '#3a7d2c', '#e84040'],
      colorRoles: ['Amber', 'Coffee Brown', 'Leaf Green', 'Red Accent'],
      tags: ['Food & Beverage', 'Product Launch', 'Photography']
    },
    {
      src: 'assets/images/social/outANGMAHALAGA copy.jpg',
      alt: 'Ang Mahalaga music single release announcement',
      title: 'Ang Mahalaga',
      type: 'social',
      subtitle: 'Music Release',
      platform: 'Spotify · YouTube Music · Apple Music',
      format: '1080 × 1080 · Square',
      description: 'Single release announcement — soft floral cover art set against vivid sunshine yellow creates an uplifting, scroll-stopping launch moment.',
      colors: ['#f5e200', '#1a1a1a', '#e91e8c', '#00bcd4'],
      colorRoles: ['Sunshine Yellow', 'Black', 'Hot Pink', 'Cyan'],
      tags: ['Music Release', 'Out Now', 'Digital Media']
    },
    {
      src: 'assets/images/social/opening poster.jpg',
      alt: 'Vince Maris Basketball Cup Season 2 event poster',
      title: 'Vince Maris Cup',
      type: 'social',
      subtitle: 'Sports Event',
      platform: 'Facebook',
      format: '1080 × 1350 · Portrait',
      description: 'Event promotional poster for Vince Maris Basketball Cup Season 2 — arena atmosphere and glowing purple gradients build hype for the inter-barangay league.',
      colors: ['#1a237e', '#7b1fa2', '#f5a800', '#ffffff'],
      colorRoles: ['Deep Navy', 'Purple', 'Gold', 'White'],
      tags: ['Sports Event', 'Basketball', 'Community']
    },
    {
      src: 'assets/images/social/investnow.jpg',
      alt: 'Konektado Invest Now 2023 campaign poster',
      title: 'Konektado — Invest Now',
      type: 'social',
      subtitle: 'Investment Campaign',
      platform: 'Facebook',
      format: '1080 × 1080 · Square',
      description: 'High-conviction investment recruitment poster for Konektado — bold 49% ROI headline paired with real operations photography drives credibility and urgency.',
      colors: ['#1a5c1a', '#c89600', '#c01515', '#1a1a1a'],
      colorRoles: ['Brand Green', 'Gold', 'Action Red', 'Dark'],
      tags: ['Investment', 'Franchise', 'Finance']
    }
  ],
  illustration: [
    {
      src: 'assets/images/illustrations/eyes FRONT.png',
      alt: 'Eyes Front zombie soda can character illustration',
      title: 'Eyes Front', type: 'illustration',
      subtitle: 'Character Design',
      description: 'Zombie soda can gone feral — oozing eyes, overflowing foam, and graffiti-style detailing in a signature green-and-gold palette.',
      colors: ['#1d5214', '#2e8c1a', '#5ab828', '#f0c800', '#f5f0d8'],
      colorRoles: ['Dark Green', 'Can Green', 'Slime', 'Gold Drip', 'Cream'],
      tags: ['Character', 'Zombie', 'Graffiti Art']
    },
    {
      src: 'assets/images/illustrations/skekeshit.png',
      alt: 'Skeke street art character illustration',
      title: 'Skeke', type: 'illustration',
      subtitle: 'Street Art Character',
      description: 'Raw street-art character with zombie energy — layered greens and gritty line work channel underground graffiti culture.',
      colors: ['#1d4a0a', '#4a8c14', '#8cc81e', '#c8d41a', '#f5e8a0'],
      colorRoles: ['Dark Green', 'Mid Green', 'Slime', 'Acid', 'Highlight'],
      tags: ['Character', 'Street Art', 'Zombie']
    },
    {
      src: 'assets/images/illustrations/flyyy.png',
      alt: 'Fly character illustration',
      title: 'Fly Guy', type: 'illustration',
      subtitle: 'Character Design',
      description: 'Buzzing with attitude — an insect character redrawn with swagger, dark exoskeleton contrasted against vivid chartreuse.',
      colors: ['#1a1a1a', '#2d5a0a', '#7aaa14', '#d4e840', '#f0f4d8'],
      colorRoles: ['Black', 'Moss', 'Bug Green', 'Chartreuse', 'Pale'],
      tags: ['Character', 'Insect', 'Grunge']
    },
    {
      src: 'assets/images/illustrations/dj.png',
      alt: 'DJ character illustration',
      title: 'DJ Character', type: 'illustration',
      subtitle: 'Character Design',
      description: 'High-energy DJ character bursting with neon personality — bold strokes and electric palette capture the pulse of the dancefloor.',
      colors: ['#1a1a1a', '#e91e8c', '#00e5ff', '#f5a800', '#ffffff'],
      colorRoles: ['Ink Black', 'Hot Pink', 'Cyan', 'Amber', 'White'],
      tags: ['Character', 'Music', 'Nightlife']
    },
    {
      src: 'assets/images/illustrations/dogshark.png',
      alt: 'Dog-Shark hybrid character illustration',
      title: 'Dog-Shark', type: 'illustration',
      subtitle: 'Character Design',
      description: 'A fearsome yet goofy hybrid of man\'s best friend and ocean predator — bold outlines and oceanic hues with a street-art energy.',
      colors: ['#1a4d80', '#2e8bc0', '#b8d4e8', '#f5e8c0', '#ffffff'],
      colorRoles: ['Deep Ocean', 'Wave Blue', 'Sky Tint', 'Sandy', 'White'],
      tags: ['Character', 'Creature', 'Grunge']
    },
    {
      src: 'assets/images/illustrations/hungryyy.png',
      alt: 'Hungry character illustration',
      title: 'Hungryyy', type: 'illustration',
      subtitle: 'Character Design',
      description: 'A perpetually ravenous creature — expressive line work and warm hunger tones make this character impossible not to feel.',
      colors: ['#c84a14', '#f5a814', '#f0d84a', '#e8f0d8', '#ffffff'],
      colorRoles: ['Hunger Red', 'Warm Orange', 'Mustard', 'Pale Green', 'White'],
      tags: ['Character', 'Expression', 'Fun']
    },
    {
      src: 'assets/images/illustrations/bunnyvampire.png',
      alt: 'Bunny Vampire character illustration',
      title: 'Bunny Vampire', type: 'illustration',
      subtitle: 'Character Design',
      description: 'Cute meets creepy — a gothic bunny vampire dripping with dark charm, soft pastels clashing against bloodred shadows.',
      colors: ['#2d0a3d', '#8b0000', '#d4a8e0', '#f5c8d8', '#ffffff'],
      colorRoles: ['Dark Purple', 'Blood Red', 'Lavender', 'Blush', 'White'],
      tags: ['Character', 'Halloween', 'Cute Horror']
    },
    {
      src: 'assets/images/illustrations/taco.png',
      alt: 'Taco monster character illustration',
      title: 'Taco Monster', type: 'illustration',
      subtitle: 'Character Design',
      description: 'A rowdy taco that bites back — warm spice tones, dripping textures, and an attitude as big as the filling.',
      colors: ['#c84a14', '#f5c80a', '#4a8c1a', '#e8a060', '#f5f0e8'],
      colorRoles: ['Chili Red', 'Cheese Gold', 'Salsa Green', 'Tortilla', 'Cream'],
      tags: ['Character', 'Food', 'Fun']
    },
    {
      src: 'assets/images/illustrations/doodle2.png',
      alt: 'Doodle series illustration',
      title: 'Doodle Series', type: 'illustration',
      subtitle: 'Doodle Art',
      description: 'Free-form doodle exploration — layered sketches and playful mark-making that celebrate spontaneity over structure.',
      colors: ['#1a1a1a', '#ffb3c6', '#a8d8ea', '#ffeaa7', '#ffffff'],
      colorRoles: ['Ink', 'Blush Pink', 'Baby Blue', 'Butter', 'White'],
      tags: ['Doodle', 'Sketch', 'Freeform']
    },
    {
      src: 'assets/images/illustrations/2.png',
      alt: 'Character illustration no. 2',
      title: 'Character No.2', type: 'illustration',
      subtitle: 'Character Design',
      description: 'A bold standalone character study — strong silhouette, punchy accent colors, and attitude packed into a tight composition.',
      colors: ['#1a1a1a', '#e83c3c', '#f5a800', '#a8d8ff', '#ffffff'],
      colorRoles: ['Black', 'Red', 'Amber', 'Ice Blue', 'White'],
      tags: ['Character', 'Digital Art', 'Bold']
    },
    {
      src: 'assets/images/illustrations/Asset 20.png',
      alt: 'Asset 20 design illustration',
      title: 'Asset 20', type: 'illustration',
      subtitle: 'Digital Illustration',
      description: 'Conceptual digital illustration — clean vector approach with layered depth, designed as a modular visual asset.',
      colors: ['#1a1a1a', '#4a90e2', '#f5d485', '#90d4a0', '#ffffff'],
      colorRoles: ['Black', 'Blue', 'Gold', 'Mint', 'White'],
      tags: ['Digital Art', 'Vector', 'Asset']
    }
  ],
  print: [
    {
      src: 'assets/images/print/book1.jpg',
      alt: 'Book cover design print layout',
      title: 'Book Cover Vol.1', type: 'print',
      subtitle: 'Book Design',
      description: 'Professional book cover layout — clean typographic hierarchy and structured composition designed for print production.',
      colors: ['#1a1a1a', '#4a6080', '#c8d4e0', '#f5f0e8', '#ffffff'],
      colorRoles: ['Ink', 'Slate Blue', 'Cool Tint', 'Cream', 'White'],
      tags: ['Book Design', 'Print', 'Layout']
    },
    {
      src: 'assets/images/print/book_2.jpg',
      alt: 'Book cover design variant print layout',
      title: 'Book Cover Vol.2', type: 'print',
      subtitle: 'Book Design',
      description: 'Second edition book cover — refined visual language maintaining brand consistency while introducing a fresh compositional approach.',
      colors: ['#1a1a1a', '#6b4a2a', '#d4a870', '#f0e8d8', '#ffffff'],
      colorRoles: ['Ink', 'Brown', 'Warm Tan', 'Parchment', 'White'],
      tags: ['Book Design', 'Print', 'Editorial']
    },
    {
      src: 'assets/images/print/5x3.jpg',
      alt: '5x3 flyer or card print design',
      title: '5×3 Flyer', type: 'print',
      subtitle: 'Flyer / Card Design',
      description: 'Compact 5×3 promotional material — bold layout optimised for high-impact messaging in a small print format.',
      colors: ['#1a1a1a', '#c84a14', '#f5a800', '#f5f0e8', '#ffffff'],
      colorRoles: ['Black', 'Red', 'Amber', 'Cream', 'White'],
      tags: ['Flyer', 'Card', 'Print']
    },
    {
      src: 'assets/images/print/flash.jpg',
      alt: 'Flash poster print design',
      title: 'Flash Poster', type: 'print',
      subtitle: 'Poster Design',
      description: 'High-voltage flash poster — energetic layout with bold type and striking contrast built to command attention at any size.',
      colors: ['#1a1a1a', '#f5c800', '#e83c14', '#ffffff', '#f5f0d8'],
      colorRoles: ['Black', 'Flash Yellow', 'Red', 'White', 'Cream'],
      tags: ['Poster', 'Event', 'Print']
    },
    {
      src: 'assets/images/print/CLOTHING TARP.jpg',
      alt: 'Clothing tarpaulin print design',
      title: 'Clothing Tarp', type: 'print',
      subtitle: 'Tarpaulin Design',
      description: 'Large-format clothing store tarpaulin — promotional layout engineered for outdoor visibility with vivid brand presence.',
      colors: ['#1a1a1a', '#e83c3c', '#f5f0e8', '#c8c8c8', '#ffffff'],
      colorRoles: ['Black', 'Brand Red', 'Cream', 'Silver', 'White'],
      tags: ['Tarpaulin', 'Retail', 'Large Format']
    },
    {
      src: 'assets/images/print/mockup_tshirt white.jpg',
      alt: 'White t-shirt print mockup',
      title: 'T-Shirt Mockup', type: 'print',
      subtitle: 'Apparel Design',
      description: 'White t-shirt apparel mockup — clean product presentation showing the print design in context for client approval and marketing.',
      colors: ['#ffffff', '#1a1a1a', '#d4d4d4', '#f5f5f5', '#888888'],
      colorRoles: ['White', 'Ink', 'Light Grey', 'Off-White', 'Mid Grey'],
      tags: ['Apparel', 'T-Shirt', 'Mockup']
    },
    {
      src: 'assets/images/print/bannerArtboard 1 copy.jpg',
      alt: 'Banner artboard print design',
      title: 'Banner Design', type: 'print',
      subtitle: 'Banner / Signage',
      description: 'Vertical banner artboard — structured signage layout with strong visual hierarchy designed for print and display production.',
      colors: ['#1a1a1a', '#1a4d80', '#f5a800', '#ffffff', '#e8f0f8'],
      colorRoles: ['Black', 'Navy', 'Amber', 'White', 'Ice Blue'],
      tags: ['Banner', 'Signage', 'Print']
    },
    {
      src: 'assets/images/print/mavs.jpg',
      alt: 'Mavs basketball team print design',
      title: 'Mavs Print', type: 'print',
      subtitle: 'Sports Design',
      description: 'Basketball team print collateral for Mavs — dynamic sports typography and bold team colors built for fan merchandise and promotions.',
      colors: ['#0050b3', '#00bcd4', '#1a1a1a', '#ffffff', '#f5a800'],
      colorRoles: ['Team Blue', 'Cyan', 'Black', 'White', 'Gold'],
      tags: ['Sports', 'Basketball', 'Team Branding']
    },
    {
      src: 'assets/images/print/jersey.jpg',
      alt: 'Sports jersey print design',
      title: 'Jersey Design', type: 'print',
      subtitle: 'Apparel / Sports',
      description: 'Custom jersey design for competitive sports — sharp numbering, team identity, and sublimation-ready artwork built for the field.',
      colors: ['#1a1a1a', '#c81414', '#ffffff', '#d4d4d4', '#f5a800'],
      colorRoles: ['Black', 'Team Red', 'White', 'Silver', 'Gold'],
      tags: ['Jersey', 'Apparel', 'Sports']
    },
    {
      src: 'assets/images/print/v1.jpg',
      alt: 'Version 1 print design layout',
      title: 'Design V1', type: 'print',
      subtitle: 'Print Design',
      description: 'Initial version print layout — concept-stage design capturing the core direction before refinement into final production artwork.',
      colors: ['#1a1a1a', '#4a8c1a', '#f5c800', '#f5f0e8', '#ffffff'],
      colorRoles: ['Black', 'Green', 'Yellow', 'Cream', 'White'],
      tags: ['Print', 'Layout', 'Concept']
    }
  ],
  deck: [
    {
      src: 'assets/images/design/cool-deck-liquid.svg',
      alt: 'Liquid style deck and print artwork',
      title: 'Liquid Deck'
    },
    {
      src: 'assets/images/design/deck-print-2.svg',
      alt: 'Deck and print slide set artwork',
      title: 'Slide Set'
    },
    {
      src: 'assets/images/design/deck-print-3.svg',
      alt: 'Print poster variants artwork',
      title: 'Poster Variants'
    }
  ],
  editorial: [
    {
      src: 'assets/images/design/cool-editorial-glass.svg',
      alt: 'Glass editorial layout artwork',
      title: 'Glass Editorial'
    },
    {
      src: 'assets/images/design/editorial-layout-2.svg',
      alt: 'Editorial spread concept artwork',
      title: 'Editorial Spread'
    },
    {
      src: 'assets/images/design/editorial-layout-3.svg',
      alt: 'Editorial grid system artwork',
      title: 'Grid System'
    }
  ]
};

const defaultGalleryKey = 'brand';
let activeGalleryKey = defaultGalleryKey;
let activeGalleryItems = galleryCollections[defaultGalleryKey];

let activeGalleryIndex = 0;

function resolveGalleryItems(setKey) {
  return galleryCollections[setKey] && galleryCollections[setKey].length
    ? galleryCollections[setKey]
    : galleryCollections[defaultGalleryKey];
}

function openResumeModal() {
  if (!resumeModal) {
    return;
  }

  resumeModal.classList.add('open');
  resumeModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeResumeModal() {
  if (!resumeModal) {
    return;
  }

  resumeModal.classList.remove('open');
  resumeModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderGallerySlide(index) {
  if (!galleryModalImage || !galleryModalTitle || !activeGalleryItems.length) {
    return;
  }

  const safeIndex = ((index % activeGalleryItems.length) + activeGalleryItems.length) % activeGalleryItems.length;
  const item = activeGalleryItems[safeIndex];
  activeGalleryIndex = safeIndex;

  const moodboardEl = document.querySelector('[data-gallery-moodboard]');
  const figureEl = document.querySelector('.gallery-modal-figure');

  const isMoodboard = item.moodboard || item.type === 'social' || item.type === 'illustration' || item.type === 'print';

  if (isMoodboard && moodboardEl) {
    galleryModalImage.src = '';
    galleryModalImage.alt = '';
    galleryModalTitle.textContent = '';
    if (figureEl) figureEl.hidden = true;
    moodboardEl.hidden = false;

    const roles = item.colorRoles || ['Primary', 'Secondary', 'Tertiary', 'Neutral'];
    const swatchColsHtml = (item.colors || []).map((c, i) =>
      `<div class="mb-swatch-col" style="--sw:${c}">
        <div class="mb-swatch-fill"></div>
        <div class="mb-swatch-info">
          <span class="mb-swatch-role">${roles[i] || ''}</span>
          <span class="mb-swatch-hex">${c}</span>
        </div>
      </div>`
    ).join('');

    const tagsHtml = (item.tags || []).map(t =>
      `<span class="mb-tag">${t}</span>`
    ).join('');

    const accentColor = (item.colors && item.colors[item.type === 'social' ? 0 : 1]) || '#1a1a1a';
    moodboardEl.style.setProperty('--mb-accent', accentColor);

    if (item.type === 'print') {
      const c = item.colors || ['#c8b8a8', '#a09080', '#d8d0c8', '#e8e4de', '#f7f4ee'];
      const r = item.colorRoles || c;

      const ptSwatchHtml = c.map((col, i) => {
        const hex = col.replace('#', '');
        const r2 = parseInt(hex.slice(0,2), 16);
        const g2 = parseInt(hex.slice(2,4), 16);
        const b2 = parseInt(hex.slice(4,6), 16);
        const luminance = (0.299 * r2 + 0.587 * g2 + 0.114 * b2) / 255;
        const textCol = luminance > 0.55 ? '#1a1a1a' : 'rgba(255,255,255,0.85)';
        return `<div class="pt-bento-swatch" style="background:${col}">
          <span class="pt-bento-swatch-name" style="color:${textCol}">${r[i] || ''}</span>
          <span class="pt-bento-swatch-hex" style="color:${luminance > 0.55 ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.5)'}">${col}</span>
        </div>`;
      }).join('');

      const ptTagsHtml = (item.tags || []).map(t =>
        `<span class="pt-bento-tag">${t}</span>`
      ).join('');

      moodboardEl.innerHTML = `
        <div class="pt-board">
          <div class="pt-bento-info">
            <span class="pt-bento-eyebrow">Print Design</span>
            <h2 class="pt-bento-title">${item.title}</h2>
            <p class="pt-bento-sub">${item.subtitle || ''}</p>
          </div>
          <div class="pt-bento-poster" style="background:${item.bg || '#f0ece4'}">
            <img src="${item.src}" alt="${item.alt}" />
          </div>
          <div class="pt-bento-palette">
            <span class="pt-bento-eyebrow">Palette</span>
            <div class="pt-bento-swatches">${ptSwatchHtml}</div>
          </div>
          <div class="pt-bento-tags">
            ${ptTagsHtml}
          </div>
          <div class="pt-bento-desc">
            <p>${item.description || ''}</p>
          </div>
        </div>
      `;
    } else if (item.type === 'illustration') {
      const ilSwatchesHtml = (item.colors || []).map((c, i) =>
        `<div class="il-swatch" style="--sw:${c}">
          <div class="il-swatch-fill"></div>
          <span class="il-swatch-label">${item.colorRoles?.[i] || c}</span>
          <span class="il-swatch-hex">${c}</span>
        </div>`
      ).join('');

      const ilTagsHtml = (item.tags || []).map(t =>
        `<span class="il-tag">${t}</span>`
      ).join('');

      moodboardEl.innerHTML = `
        <div class="il-board">
          <div class="il-header-bar">
            <div class="il-header-left">
              <span class="il-label">Illustration</span>
              <h2 class="il-title">${item.title}</h2>
              <p class="il-subtitle">${item.subtitle || 'Character Design'}</p>
            </div>
            <div class="il-header-right">
              <p class="il-desc">${item.description || ''}</p>
              <div class="il-tags">${ilTagsHtml}</div>
            </div>
          </div>
          <div class="il-canvas">
            <img src="${item.src}" alt="" class="il-canvas-bg" aria-hidden="true" />
            <img src="${item.src}" alt="${item.alt}" class="il-img" />
          </div>
          <div class="il-palette">
            ${ilSwatchesHtml}
          </div>
        </div>
      `;
    } else if (item.type === 'social') {
      const circlesHtml = (item.colors || []).map(c =>
        `<span class="sm-circle" style="--sw:${c}" title="${c}"></span>`
      ).join('');

      const hashtagsHtml = (item.tags || []).map(t =>
        `<span class="sm-hashtag">#${t.replace(/\s+/g, '')}</span>`
      ).join('');

      moodboardEl.innerHTML = `
        <div class="sm-board">
          <div class="sm-board-header">
            <span class="sm-board-label">Social Campaign</span>
            <span class="sm-board-platform">${item.platform || 'Social Media'}</span>
          </div>
          <div class="sm-board-body">
            <div class="sm-phone-wrap">
              <img src="${item.src}" alt="" class="sm-phone-bg-img" aria-hidden="true" />
              <div class="sm-bg-elements" aria-hidden="true">
                <span class="sm-bg-orb sm-bg-orb-1"></span>
                <span class="sm-bg-orb sm-bg-orb-2"></span>
                <span class="sm-bg-orb sm-bg-orb-3"></span>
                <span class="sm-bg-bubble sm-bg-bubble-likes">
                  <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  1,284
                </span>
                <span class="sm-bg-bubble sm-bg-bubble-comments">
                  <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  347
                </span>
                <span class="sm-bg-bubble sm-bg-bubble-shares">
                  <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  89
                </span>
                <span class="sm-bg-tag">#${(item.tags && item.tags[0] || 'Design').replace(/\s+/g,'')}</span>
                <span class="sm-bg-tag sm-bg-tag-2">#${(item.tags && item.tags[1] || 'Creative').replace(/\s+/g,'')}</span>
              </div>
              <div class="sm-phone">
                <div class="sm-phone-screen">
                  <div class="sm-phone-island"></div>
                  <div class="sm-ig-statusbar">
                    <span class="sm-ig-time">9:41</span>
                    <div class="sm-ig-signal">
                      <span></span><span></span><span></span><span></span>
                    </div>
                  </div>
                  <div class="sm-ig-appbar">
                    <span class="sm-ig-appbar-logo">Instagram</span>
                    <div class="sm-ig-appbar-icons">
                      <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </div>
                  </div>
                  <div class="sm-ig-post-header">
                    <div class="sm-ig-avatar-wrap">
                      <div class="sm-ig-avatar">
                        <div class="sm-ig-avatar-inner"></div>
                      </div>
                    </div>
                    <div class="sm-ig-post-user">
                      <span class="sm-ig-post-username">aedrian.guiriba</span>
                      <span class="sm-ig-post-location">${item.subtitle || 'Social Media'}</span>
                    </div>
                    <span class="sm-ig-post-more">•••</span>
                  </div>
                  <div class="sm-ig-post-image">
                    <img src="${item.src}" alt="${item.alt}" />
                  </div>
                  <div class="sm-ig-actions">
                    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    <svg class="sm-ig-bookmark-btn" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div class="sm-ig-likes">1,284 likes</div>
                  <div class="sm-ig-caption">
                    <span class="sm-ig-cap-user">aedrian.guiriba </span>${item.description ? item.description.slice(0, 80) + '…' : ''}
                  </div>
                </div>
              </div>
            </div>
            <div class="sm-board-info">
              <p class="sm-board-type">${item.subtitle || 'Social Media'}</p>
              <h2 class="sm-board-title">${item.title}</h2>
              <div class="sm-board-rule"></div>
              <p class="sm-board-desc">${item.description || ''}</p>
              <div>
                <p class="sm-palette-heading">Color Palette</p>
                <div class="sm-palette-circles">${circlesHtml}</div>
              </div>
              <div class="sm-hashtags">${hashtagsHtml}</div>
            </div>
          </div>
          <div class="sm-board-footer">
            <div class="sm-footer-item">
              <span class="sm-footer-label">Post Format</span>
              <span class="sm-footer-value">${item.format || '1080 × 1080 · Square'}</span>
            </div>
            <div class="sm-footer-item right">
              <span class="sm-footer-label">Campaign Type</span>
              <span class="sm-footer-value">${item.subtitle || 'Social Media'}</span>
            </div>
          </div>
        </div>
      `;
    } else {
      moodboardEl.innerHTML = `
        <div class="mb-header-strip">
          <span class="mb-header-label">Brand Identity</span>
          <span class="mb-category-pill">${item.subtitle || 'Visual Identity'}</span>
        </div>
        <div class="mb-main">
          <div class="mb-logo-panel">
            <img src="${item.src}" alt="${item.alt}" class="mb-logo-img" />
          </div>
          <div class="mb-brand-info">
            <h2 class="mb-brand-name">${item.title}</h2>
            <div class="mb-accent-rule"></div>
            <p class="mb-brand-desc">${item.description || ''}</p>
            <div class="mb-tags">${tagsHtml}</div>
          </div>
        </div>
        <div class="mb-palette-header">
          <span class="mb-palette-label">Color Palette</span>
          <span class="mb-palette-count">${(item.colors || []).length} brand colors</span>
        </div>
        <div class="mb-palette">${swatchColsHtml}</div>
        <div class="mb-dark-bar">
          <img src="${item.src}" alt="${item.alt} inverted" class="mb-dark-logo" />
          <div class="mb-dark-meta">
            <span class="mb-dark-label">Brand Identity System</span>
            <span class="mb-dark-name">${item.title}</span>
          </div>
        </div>
      `;
    }
  } else {
    if (moodboardEl) { moodboardEl.hidden = true; moodboardEl.innerHTML = ''; }
    if (figureEl) figureEl.hidden = false;
    galleryModalImage.src = item.src;
    galleryModalImage.alt = item.alt;
    galleryModalTitle.textContent = item.title;
  }

  if (galleryModalCount) {
    galleryModalCount.textContent = `${safeIndex + 1} / ${activeGalleryItems.length}`;
  }
}

function openGalleryModal(setKey = defaultGalleryKey, startIndex = 0) {
  if (!galleryModal || !galleryModalImage || !galleryModalTitle) {
    return;
  }

  activeGalleryKey = setKey;
  activeGalleryItems = resolveGalleryItems(activeGalleryKey);

  renderGallerySlide(startIndex);
  galleryModal.classList.add('open');
  galleryModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function showNextGallerySlide() {
  renderGallerySlide(activeGalleryIndex + 1);
}

function showPreviousGallerySlide() {
  renderGallerySlide(activeGalleryIndex - 1);
}

function closeGalleryModal() {
  if (!galleryModal || !galleryModalImage || !galleryModalTitle) {
    return;
  }

  galleryModal.classList.remove('open');
  galleryModal.setAttribute('aria-hidden', 'true');
  galleryModalImage.src = '';
  galleryModalImage.alt = '';
  galleryModalTitle.textContent = '';
  if (galleryModalCount) {
    galleryModalCount.textContent = '';
  }
  const moodboardEl = document.querySelector('[data-gallery-moodboard]');
  const figureEl = document.querySelector('.gallery-modal-figure');
  if (moodboardEl) { moodboardEl.hidden = true; moodboardEl.innerHTML = ''; }
  if (figureEl) figureEl.hidden = false;
  document.body.style.overflow = '';
}

resumeModalOpenButtons.forEach((button) => {
  button.addEventListener('click', openResumeModal);
});

resumeModalCloseButtons.forEach((button) => {
  button.addEventListener('click', closeResumeModal);
});

galleryOpenButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const setKey = button.getAttribute('data-gallery-set') || defaultGalleryKey;
    openGalleryModal(setKey, 0);
  });
});

if (galleryPrevButton) {
  galleryPrevButton.addEventListener('click', showPreviousGallerySlide);
}

if (galleryNextButton) {
  galleryNextButton.addEventListener('click', showNextGallerySlide);
}

galleryCloseButtons.forEach((button) => {
  button.addEventListener('click', closeGalleryModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeResumeModal();
    closeGalleryModal();
  }

  if (galleryModal && galleryModal.classList.contains('open')) {
    if (event.key === 'ArrowRight') {
      showNextGallerySlide();
    }

    if (event.key === 'ArrowLeft') {
      showPreviousGallerySlide();
    }
  }
});

// Tools categories as boxes
const toolsModal = document.querySelector('[data-tools-modal]');
const toolsModalClose = document.querySelector('.tools-modal-close');
const toolsModalBackdrop = document.querySelector('.tools-modal-backdrop');
const toolsModalGrid = document.querySelector('[data-tools-modal-grid]');
const toolsModalTitle = document.querySelector('[data-tools-modal-title]');

const toolsCategories = document.querySelectorAll('.tools-category');
toolsCategories.forEach((category) => {
  const header = category.querySelector('.tools-category-header');
  const toolCards = category.querySelectorAll('.tool-card');
  toolCards.forEach((card) => attachToolCardListener(card));
  
  if (header) {
    header.addEventListener('click', () => {
      const categoryName = category.querySelector('.tools-category-name').textContent;
      const cards = Array.from(category.querySelectorAll('.tool-card'));
      
      if (toolsModalTitle) toolsModalTitle.textContent = categoryName;
      if (toolsModalGrid) {
        toolsModalGrid.innerHTML = '';
        cards.forEach((card) => {
          const clone = card.cloneNode(true);
          toolsModalGrid.appendChild(clone);
          attachToolCardListener(clone);
        });
      }
      if (toolsModal) toolsModal.classList.add('open');
    });
  }
});

const closeToolsModal = () => {
  if (toolsModal) toolsModal.classList.remove('open');
};

if (toolsModalClose) {
  toolsModalClose.addEventListener('click', (e) => {
    e.stopPropagation();
    closeToolsModal();
  });
}

if (toolsModalBackdrop) {
  toolsModalBackdrop.addEventListener('click', closeToolsModal);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && toolsModal && toolsModal.classList.contains('open')) {
    closeToolsModal();
  }
});
