document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Theme cycle configuration
    const themes = ['light', 'dark', 'amoled'];
    const icons = {
        light: '☀️',
        dark: '🌙',
        amoled: '🌑'
    };

    const updateThemeIcon = (theme) => {
        if (themeToggle) {
            themeToggle.textContent = icons[theme] || '🌓';
        }
    };

    // Check for saved theme (default dark according to guide)
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme') || 'light';
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
            e.stopPropagation(); // Prevent triggering outer actions
            
            // Mark manually set
            window.simThemeManuallySet = true;

            // Update active states
            simThemeBubbles.forEach(b => b.classList.remove('active'));
            bubble.classList.add('active');

            // Apply local theme
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
        // Temporarily clear active state on others
        simThemeBubbles.forEach(b => {
            if (b !== matchingBubble) b.classList.remove('active');
        });
        if (phoneScreen) {
            phoneScreen.setAttribute('data-theme', initialGlobalTheme);
        }
    }

    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // Simple reveal animation on scroll
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

    // Smooth scroll for nav links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
