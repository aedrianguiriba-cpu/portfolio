// ========== Navigation ========== 
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.querySelector('.navbar');

// Hamburger menu toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close menu when link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');

    // Update navbar shadow on scroll
    if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Update active link based on scroll position
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ========== Portfolio Filter =========
const filterBtns = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

// Show all items initially
portfolioItems.forEach(item => {
    item.classList.add('show');
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        portfolioItems.forEach(item => {
            item.classList.remove('show');
            
            if (filterValue === 'all') {
                item.classList.add('show');
            } else if (item.getAttribute('data-category') === filterValue) {
                item.classList.add('show');
            }
        });
    });
});

// Set first filter button as active by default
if (filterBtns.length > 0) {
    filterBtns[0].classList.add('active');
}

// ========== Project Details Modal =========
const projectModal = document.getElementById('projectModal');
const closeProjectBtn = document.getElementById('closeProjectBtn');
const viewBtns = document.querySelectorAll('.view-btn');

const projectData = {
    'Brand Identity System': {
        images: [
            '/assets/4.jpg',
            '/assets/5.jpg',
            '/assets/6.jpg',
            '/assets/lanscape blue.png',
            '/assets/etiketa.jpg',
            '/assets/frontpage.jpg'
        ],
        description: 'Created a comprehensive brand identity package for a tech startup including logo design, color palette, typography guidelines, and complete brand applications across digital and print media.',
        technologies: ['Adobe Illustrator', 'Adobe Photoshop', 'Figma', 'Canva'],
        highlights: [
            'Logo design with multiple variations',
            'Complete color palette system',
            'Typography guidelines and font pairing',
            'Brand standards document',
            'Marketing collateral templates'
        ]
    },
    'Illustrations': {
        images: [
            'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=600&h=400&fit=crop'
        ],
        description: 'Crafted vibrant vector illustrations blending bold color blocking, expressive characters, and clean geometric forms for editorial, web, and social media use.',
        technologies: ['Illustrator', 'Procreate', 'Figma', 'Color Theory'],
        highlights: [
            'Character-driven spot and hero illustrations',
            'Scalable vector artwork optimized for web and print',
            'Layered source files for easy recolor and adaptation',
            'Consistent visual language across a multi-asset set',
            'Accessible palettes with strong contrast and clarity'
        ]
    },
    'Posters': {
        images: [
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&h=400&fit=crop'
        ],
        description: 'Designed vibrant and impactful posters for events, campaigns, and promotions featuring bold typography, strategic color use, and compelling visual hierarchy to grab attention and communicate messages effectively.',
        technologies: ['Adobe Photoshop', 'Adobe Illustrator', 'Typography', 'Print Design'],
        highlights: [
            'Event and concert posters with bold visual impact',
            'Promotional campaign posters for product launches',
            'Large-format print designs optimized for visibility',
            'Typography-driven layouts with strong hierarchy',
            'Color theory application for maximum engagement'
        ]
    },
    'E-commerce Platform': {
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
        description: 'Built a full-featured e-commerce platform with secure payment processing, inventory management, real-time analytics, and customer dashboard.',
        technologies: ['HTML/CSS', 'JavaScript', 'PHP', 'MySQL', 'Stripe'],
        github: 'https://github.com',
        highlights: [
            'Responsive product catalog',
            'Secure payment gateway integration',
            'Inventory management system',
            'Customer account management',
            'Analytics and reporting dashboard'
        ]
    },
    'Mobile Task Manager': {
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
        description: 'Developed a cross-platform mobile application for task management with real-time synchronization, push notifications, and cloud integration.',
        technologies: ['Flutter', 'Dart', 'Firebase', 'Cloud Storage'],
        github: 'https://github.com',
        highlights: [
            'Cross-platform iOS and Android support',
            'Real-time data synchronization',
            'Push notifications',
            'Offline support',
            'Cloud backup and sync'
        ]
    },
    'Analytics Dashboard': {
        image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=400&fit=crop',
        description: 'Created an interactive data visualization dashboard with real-time data updates, SQL database queries, and comprehensive reporting features.',
        technologies: ['JavaScript', 'SQL', 'Chart.js', 'Data Visualization'],
        github: 'https://github.com',
        highlights: [
            'Real-time data updates',
            'Interactive charts and graphs',
            'Custom report generation',
            'Data filtering and analysis',
            'Export to PDF and CSV'
        ]
    },
    'IT Course Curriculum': {
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
        description: 'Developed comprehensive Information Technology course curriculum with hands-on projects, assessments, and learning materials for college instruction.',
        technologies: ['Curriculum Design', 'Education', 'IT Instruction', 'Assessment'],
        highlights: [
            'Structured course modules',
            'Hands-on programming projects',
            'Practical lab exercises',
            'Assessment rubrics',
            'Student learning outcomes'
        ]
    },
    'Business Process Automation': {
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
        description: 'Streamlined administrative workflows and automated repetitive business processes improving operational efficiency by 60%.',
        technologies: ['Systems Analysis', 'Automation', 'Process Design', 'Python'],
        github: 'https://github.com',
        highlights: [
            'Process analysis and mapping',
            'Automation workflow design',
            'System integration',
            'Error handling and monitoring',
            '60% efficiency improvement'
        ]
    },
    'Database Management System': {
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
        description: 'Designed and implemented SQL database systems for enterprise clients with optimal data organization, security, and efficient querying.',
        technologies: ['SQL', 'Database Design', 'Data Management', 'Security'],
        highlights: [
            'Normalized database schema',
            'Optimized query performance',
            'Data security implementation',
            'Backup and recovery systems',
            'User access management'
        ]
    }
};

// GitHub Section Click Handler
const githubSection = document.querySelector('.github-section');
if (githubSection) {
    githubSection.addEventListener('click', () => {
        // Replace with your GitHub profile URL
        window.open('https://github.com/Aedrian-G', '_blank');
    });
}

// Open project modal
let currentImageIndex = 0;
let currentProjectImages = [];

viewBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const portfolioItem = btn.closest('.portfolio-item');
        const projectTitle = portfolioItem.querySelector('h3').textContent;
        const project = projectData[projectTitle];
        
        if (project) {
            currentImageIndex = 0;
            
            // Handle images (array for designs, single for dev)
            const imageContainer = document.getElementById('projectImage');
            if (project.images && project.images.length > 1) {
                // Design project with multiple images
                currentProjectImages = project.images;
                imageContainer.src = project.images[0];
                document.getElementById('imageCarouselControls').style.display = 'flex';
            } else {
                // Single image project
                currentProjectImages = [];
                imageContainer.src = project.image;
                document.getElementById('imageCarouselControls').style.display = 'none';
            }
            
            document.getElementById('projectTitle').textContent = projectTitle;
            document.getElementById('projectDescription').textContent = project.description;
            
            // Add technologies
            const techList = document.getElementById('projectTechs');
            techList.innerHTML = '';
            project.technologies.forEach(tech => {
                const techTag = document.createElement('span');
                techTag.className = 'tech-tag';
                techTag.textContent = tech;
                techList.appendChild(techTag);
            });
            
            // Add highlights
            const highlightsList = document.getElementById('projectHighlights');
            highlightsList.innerHTML = '';
            project.highlights.forEach(highlight => {
                const li = document.createElement('li');
                li.textContent = highlight;
                highlightsList.appendChild(li);
            });
            
            // Handle GitHub button
            const githubBtn = document.getElementById('githubBtn');
            if (project.github) {
                githubBtn.style.display = 'inline-block';
                githubBtn.href = project.github;
            } else {
                githubBtn.style.display = 'none';
            }
            
            projectModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
});

// Image carousel controls
const prevImageBtn = document.getElementById('prevImage');
const nextImageBtn = document.getElementById('nextImage');

prevImageBtn.addEventListener('click', () => {
    if (currentProjectImages.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + currentProjectImages.length) % currentProjectImages.length;
        document.getElementById('projectImage').src = currentProjectImages[currentImageIndex];
    }
});

nextImageBtn.addEventListener('click', () => {
    if (currentProjectImages.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % currentProjectImages.length;
        document.getElementById('projectImage').src = currentProjectImages[currentImageIndex];
    }
});

// Close modal
closeProjectBtn.addEventListener('click', () => {
    projectModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close modal when clicking overlay
document.querySelector('.project-modal-overlay').addEventListener('click', () => {
    projectModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && projectModal.classList.contains('active')) {
        projectModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// ========== Contact Form =========
// FormSubmit handles the form submission automatically
// No additional JavaScript needed

// ========== Scroll Animations =========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

const elementsToObserve = document.querySelectorAll('.role-card, .skill-category, .portfolio-item');
elementsToObserve.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// ========== Smooth Scroll for Anchor Links =========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========== Dynamic Year in Footer =========
const yearElement = document.querySelector('.footer p');
if (yearElement) {
    const currentYear = new Date().getFullYear();
    yearElement.textContent = `© ${currentYear} Your Portfolio. All rights reserved.`;
}

// ========== Add Modal Styles Dynamically =========
const style = document.createElement('style');
style.textContent = `
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .modal.show {
        opacity: 1;
    }

    .modal-content {
        background: white;
        padding: 40px;
        border-radius: 10px;
        max-width: 500px;
        width: 90%;
        position: relative;
        animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .modal-close {
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 28px;
        cursor: pointer;
        color: #64748b;
        transition: color 0.3s ease;
    }

    .modal-close:hover {
        color: #6366f1;
    }

    .modal-content h2 {
        margin-bottom: 10px;
        color: #1e293b;
    }

    .modal-category {
        color: #6366f1;
        font-weight: 600;
        margin-bottom: 15px;
    }

    .modal-description {
        color: #64748b;
        margin-bottom: 20px;
        line-height: 1.6;
    }

    .modal-tools h3 {
        margin-bottom: 10px;
        color: #1e293b;
    }

    .tool-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 20px;
    }

    .tool-tag {
        display: inline-block;
        padding: 6px 12px;
        background: #f1f5f9;
        color: #6366f1;
        border-radius: 15px;
        font-size: 13px;
        font-weight: 500;
    }

    .modal-year {
        color: #64748b;
        font-size: 14px;
    }

    .form-success {
        background: #10b981;
        color: white;
        padding: 15px;
        border-radius: 8px;
        margin-top: 15px;
        text-align: center;
        animation: slideUp 0.3s ease;
    }

    @media (max-width: 768px) {
        .modal-content {
            padding: 30px;
        }
    }
`;
document.head.appendChild(style);

// ========== Resume Modal ==========
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    const resumeBtn = document.getElementById('resumeBtn');
    const closeResumeBtn = document.getElementById('closeResumeBtn');
    const resumeModal = document.getElementById('resumeModal');
    const resumeModalOverlay = document.querySelector('.resume-modal-overlay');

    if (resumeBtn) {
        resumeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (resumeModal) {
                resumeModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    function closeResumeModal() {
        if (resumeModal) {
            resumeModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    if (closeResumeBtn) {
        closeResumeBtn.addEventListener('click', closeResumeModal);
    }

    if (resumeModalOverlay) {
        resumeModalOverlay.addEventListener('click', closeResumeModal);
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && resumeModal && resumeModal.classList.contains('active')) {
            closeResumeModal();
        }
    });
});

// ========== Skill Progress Animation ==========
const skillProgress = document.querySelectorAll('.skill-progress');
let skillsAnimated = false;

function animateSkills() {
    const skillsSection = document.querySelector('.skills');
    const sectionTop = skillsSection.offsetTop;
    const sectionHeight = skillsSection.clientHeight;
    const windowHeight = window.innerHeight;

    // Check if skills section is in viewport
    if (window.scrollY + windowHeight > sectionTop + 100 && !skillsAnimated) {
        skillsAnimated = true;
        skillProgress.forEach((progress, index) => {
            setTimeout(() => {
                // Get the width value from inline style
                const width = progress.style.width;
                // Set CSS custom property for animation
                progress.style.setProperty('--skill-width', width);
                progress.classList.add('animate');
            }, index * 100); // Stagger animation
        });
    }
}

window.addEventListener('scroll', animateSkills);
// Trigger animation on page load if skills section is visible
animateSkills();

// ========== Email Success Notification =========
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'email-success-notification';
        notification.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Email successfully sent!</span>
            <button class="close-notification">&times;</button>
        `;
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
            // Remove success parameter from URL
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        }, 5000);

        // Close button
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        });
    }
});
