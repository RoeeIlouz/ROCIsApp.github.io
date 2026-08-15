document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Theme cycle configuration
    const themes = ['light', 'dark', 'amoled'];
    const themeIcons = {
        light: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
        dark: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
        amoled: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor"></path></svg>`
    };

    const updateThemeIcon = (theme) => {
        if (themeToggle) {
            themeToggle.innerHTML = themeIcons[theme] || themeIcons.dark;
            const themeLabel = theme.charAt(0).toUpperCase() + theme.slice(1);
            themeToggle.setAttribute('aria-label', `Current theme: ${themeLabel}. Click to switch theme.`);
        }
    };

    // Check for saved theme (default dark according to guide)
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme') || 'dark';
            const currentIndex = themes.indexOf(currentTheme);
            const nextIndex = (currentIndex + 1) % themes.length;
            const newTheme = themes[nextIndex];
            
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);

            // Sync simulator preview with global theme if not manually changed
            const activeSimBubble = document.querySelector('.theme-bubble.active');
            if (activeSimBubble && !window.simThemeManuallySet) {
                const correspondingBubble = document.querySelector(`.theme-bubble.${newTheme}`);
                if (correspondingBubble) {
                    correspondingBubble.click();
                    window.simThemeManuallySet = false; // Reset flag since it was triggered programmatically
                }
            }
        });
    }

    // --- Interactive App Simulator Logic ---
    const simTaskList = document.getElementById('sim-task-list');
    const progressCircle = document.querySelector('.progress-ring__circle');
    const chartPercent = document.getElementById('chart-percent');
    const statCompleted = document.getElementById('stat-completed');
    const statPending = document.getElementById('stat-pending');
    
    // Initialise circular chart stroke attributes
    let circumference = 0;
    if (progressCircle) {
        const radius = progressCircle.r.baseVal.value;
        circumference = 2 * Math.PI * radius;
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    }

    const updateSimulatorProgress = () => {
        const tasks = document.querySelectorAll('.sim-task-item');
        const completedTasks = document.querySelectorAll('.sim-task-item.completed');
        
        const total = tasks.length;
        const completed = completedTasks.length;
        const pending = total - completed;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Update stats text
        if (statCompleted) statCompleted.textContent = completed;
        if (statPending) statPending.textContent = pending;
        if (chartPercent) chartPercent.textContent = percent;

        // Animate circular chart stroke
        if (progressCircle && circumference > 0) {
            const offset = circumference - (percent / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
    };

    // Task click toggles
    if (simTaskList) {
        simTaskList.addEventListener('click', (e) => {
            const taskItem = e.target.closest('.sim-task-item');
            if (taskItem) {
                taskItem.classList.toggle('completed');
                updateSimulatorProgress();
            }
        });
    }

    // Simulator local theme bubbles
    const simThemeBubbles = document.querySelectorAll('.theme-bubble');
    const phoneScreen = document.querySelector('.phone-screen');
    window.simThemeManuallySet = false;

    simThemeBubbles.forEach(bubble => {
        bubble.addEventListener('click', (e) => {
            e.stopPropagation();
            
            window.simThemeManuallySet = true;

            simThemeBubbles.forEach(b => b.classList.remove('active'));
            bubble.classList.add('active');

            const targetTheme = bubble.getAttribute('data-sim-theme');
            if (phoneScreen) {
                phoneScreen.setAttribute('data-theme', targetTheme);
            }
        });
    });

    // Run initial progress calculation
    updateSimulatorProgress();

    // Sync initial simulator theme bubble with current global theme
    const initialGlobalTheme = body.getAttribute('data-theme') || 'dark';
    const matchingBubble = document.querySelector(`.theme-bubble.${initialGlobalTheme}`);
    if (matchingBubble) {
        matchingBubble.classList.add('active');
        simThemeBubbles.forEach(b => {
            if (b !== matchingBubble) b.classList.remove('active');
        });
        if (phoneScreen) {
            phoneScreen.setAttribute('data-theme', initialGlobalTheme);
        }
    }

    // --- Mobile Hamburger Menu ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            hamburger.setAttribute('aria-expanded', isExpanded);
        });
        
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // --- Screenshots Lightbox Modal ---
    const screenshotCards = document.querySelectorAll('.screenshot-card');
    const lightbox = document.getElementById('screenshot-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let currentScreenshotIndex = 0;
    const screenshotData = [];

    screenshotCards.forEach((card, index) => {
        const img = card.querySelector('.screenshot-img');
        const title = card.querySelector('h3') ? card.querySelector('h3').textContent : '';
        const desc = card.querySelector('p') ? card.querySelector('p').textContent : '';

        if (img) {
            screenshotData.push({
                src: img.getAttribute('src'),
                alt: img.getAttribute('alt') || title,
                title: title,
                desc: desc
            });

            card.addEventListener('click', () => {
                openLightbox(index);
            });
        }
    });

    const updateLightboxContent = (index) => {
        if (!screenshotData[index]) return;
        const item = screenshotData[index];
        if (lightboxImg) {
            lightboxImg.src = item.src;
            lightboxImg.alt = item.alt;
        }
        if (lightboxCaption) {
            lightboxCaption.innerHTML = `<strong>${item.title}</strong> — ${item.desc}`;
        }
        currentScreenshotIndex = index;
    };

    const openLightbox = (index) => {
        if (!lightbox) return;
        updateLightboxContent(index);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (lightboxClose) {
        lightboxClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLightbox();
        });
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            const newIndex = (currentScreenshotIndex - 1 + screenshotData.length) % screenshotData.length;
            updateLightboxContent(newIndex);
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            const newIndex = (currentScreenshotIndex + 1) % screenshotData.length;
            updateLightboxContent(newIndex);
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-container')) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            const newIndex = (currentScreenshotIndex - 1 + screenshotData.length) % screenshotData.length;
            updateLightboxContent(newIndex);
        } else if (e.key === 'ArrowRight') {
            const newIndex = (currentScreenshotIndex + 1) % screenshotData.length;
            updateLightboxContent(newIndex);
        }
    });

    // --- Copy Email to Clipboard with Toast ---
    const copyEmailBtn = document.getElementById('copy-email-btn');
    const toast = document.getElementById('toast-notification');

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const email = 'support@rocisapps.com';
            navigator.clipboard.writeText(email).then(() => {
                if (toast) {
                    toast.classList.add('show');
                    setTimeout(() => {
                        toast.classList.remove('show');
                    }, 3000);
                }
            }).catch(() => {
                // Fallback for older browsers
                window.location.href = `mailto:${email}`;
            });
        });
    }

    // --- Scroll Animations ---
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate').forEach(el => {
        observer.observe(el);
    });

    // Smooth scroll for internal hash links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});
