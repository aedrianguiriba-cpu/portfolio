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

async function loadGitHubRepos() {
  const repoContainers = document.querySelectorAll('[data-github-repos]');

  repoContainers.forEach((container) => {
    const username = container.getAttribute('data-github-username');
    if (!username) {
      return;
    }

    container.innerHTML = '<p class="github-note">Loading repositories...</p>';

    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6&direction=desc`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to load repositories');
        }

        return response.json();
      })
      .then((repos) => {
        const visibleRepos = repos.filter((repo) => !repo.fork).slice(0, 3);

        if (!visibleRepos.length) {
          container.innerHTML = '<p class="github-note">No public repositories found.</p>';
          return;
        }

        container.innerHTML = visibleRepos
          .map((repo) => {
            const description = repo.description || 'No description provided.';
            const language = repo.language || 'Code';
            const stars = repo.stargazers_count || 0;

            return `
              <a class="repo-card" href="${repo.html_url}" target="_blank" rel="noreferrer">
                <strong>${repo.name}</strong>
                <span>${description}</span>
                <small>${language} · ${stars} star${stars === 1 ? '' : 's'}</small>
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
