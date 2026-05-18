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

async function loadGitHubRepos() {
  const repoContainers = document.querySelectorAll('[data-github-repos]');

  repoContainers.forEach((container) => {
    const username = container.getAttribute('data-github-username');
    if (!username) {
      return;
    }

    container.innerHTML = '<p class="github-note">Loading repositories...</p>';

    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100&direction=desc`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load repositories');
        }

        return response.json();
      })
      .then((repos) => {
        const visibleRepos = repos;

        if (!visibleRepos.length) {
          container.innerHTML = '<p class="github-note">No public repositories found.</p>';
          return;
        }

        container.innerHTML = visibleRepos
          .map((repo) => {
            const description = repo.description || 'No description provided.';
            const language = repo.language || 'Code';
            const stars = repo.stargazers_count || 0;
            const languageLogo = getRepoLanguageLogo(repo.language);

            return `
              <a class="repo-card" href="${repo.html_url}" target="_blank" rel="noreferrer">
                <strong>${repo.name}</strong>
                <span>${description}</span>
                <small class="repo-meta">
                  <span class="repo-language">
                    <img class="repo-language-logo" src="${languageLogo}" alt="${language} logo" loading="lazy" />${language}
                  </span>
                  <span>${stars} star${stars === 1 ? '' : 's'}</span>
                </small>
              </a>
            `;
          })
          .join('');
      })
      .catch(() => {
        container.innerHTML = '<p class="github-note">Repositories could not be loaded right now.</p>';
      });
  });
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
      src: 'assets/images/design/cool-brand-neon.svg',
      alt: 'Neon brand identity artwork',
      title: 'Neon Identity'
    },
    {
      src: 'assets/images/design/brand-identity-2.svg',
      alt: 'Brand identity moodboard artwork',
      title: 'Brand Moodboard'
    },
    {
      src: 'assets/images/design/brand-identity-3.svg',
      alt: 'Brand application mockup artwork',
      title: 'Brand Applications'
    }
  ],
  social: [
    {
      src: 'assets/images/design/cool-social-cyber.svg',
      alt: 'Cyber social campaign artwork',
      title: 'Cyber Campaign'
    },
    {
      src: 'assets/images/design/social-campaign-2.svg',
      alt: 'Social campaign carousel artwork',
      title: 'Carousel Concepts'
    },
    {
      src: 'assets/images/design/social-campaign-3.svg',
      alt: 'Social story frames artwork',
      title: 'Story Frames'
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

  galleryModalImage.src = item.src;
  galleryModalImage.alt = item.alt;
  galleryModalTitle.textContent = item.title;

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
