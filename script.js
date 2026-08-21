/* ======================================================
   Antigravity-Style Portfolio — Priya Pareek
   Interactive Features & Clean Motion System
   ====================================================== */

// ─── Live GitHub Stats ───────────
const GITHUB_USERNAME = 'Priya-Pareekk';

(async function fetchGithubStats() {
    const repoEl = document.getElementById('githubRepoCount');
    const heroRepoEl = document.getElementById('heroGithubRepoCount');
    const followersEl = document.getElementById('githubFollowers');
    const starsEl = document.getElementById('githubStars');
    const topLangEl = document.getElementById('githubTopLang');
    if (!repoEl && !heroRepoEl) return;

    const cacheKey = 'github_stats_cache';
    const cacheTimeKey = 'github_stats_cache_time';
    const oneHour = 60 * 60 * 1000;

    // Show cached values instantly while we refresh in the background
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const c = JSON.parse(cached);
            if (repoEl) repoEl.textContent = c.repos;
            if (heroRepoEl) {
                heroRepoEl.dataset.target = c.repos;
                heroRepoEl.textContent = c.repos;
            }
            if (followersEl) followersEl.textContent = c.followers;
            if (starsEl) starsEl.textContent = c.stars;
            if (topLangEl) topLangEl.textContent = c.topLang;
        } catch (e) { /* ignore corrupt cache */ }
    }

    const cachedTime = parseInt(localStorage.getItem(cacheTimeKey) || '0');
    if (Date.now() - cachedTime < oneHour && cached) return; // cache still fresh, skip refetch

    try {
        const userRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        if (!userRes.ok) throw new Error('GitHub user fetch failed');
        const user = await userRes.json();

        const reposRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`);
        if (!reposRes.ok) throw new Error('GitHub repos fetch failed');
        const repos = await reposRes.json();

        const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

        // Find most common language across repos
        const langCounts = {};
        repos.forEach(r => {
            if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1;
        });
        const topLang = Object.keys(langCounts).length
            ? Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0][0]
            : '—';

        const stats = {
            repos: user.public_repos,
            followers: user.followers,
            stars: totalStars,
            topLang: topLang
        };

        if (repoEl) repoEl.textContent = stats.repos;
        if (heroRepoEl) {
            heroRepoEl.dataset.target = stats.repos;
            heroRepoEl.textContent = stats.repos;
        }
        if (followersEl) followersEl.textContent = stats.followers;
        if (starsEl) starsEl.textContent = stats.stars;
        if (topLangEl) topLangEl.textContent = stats.topLang;

        localStorage.setItem(cacheKey, JSON.stringify(stats));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
    } catch (err) {
        console.warn('GitHub live stats unavailable, using fallback values.', err);
        // Fallback values shown only if there's no cache AND the API call fails
        if (!cached) {
            if (repoEl) repoEl.textContent = '3';
            if (heroRepoEl) heroRepoEl.textContent = '3';
            if (followersEl) followersEl.textContent = '—';
            if (starsEl) starsEl.textContent = '—';
            if (topLangEl) topLangEl.textContent = 'JavaScript';
        }
    }
})();

// ─── Live LeetCode Solved Count ───────────
const LEETCODE_USERNAME = 'Priya_pareek';

(async function fetchLeetCodeSolved() {
    const statEl = document.getElementById('leetcodeStat');
    const heroTotal = document.getElementById('heroLeetcodeTotal');
    const heroStat = document.getElementById('heroLeetcodeStat');
    const strengthCount = document.getElementById('strengthLeetcodeCount');
    const barEasy = document.getElementById('barEasy');
    const barMedium = document.getElementById('barMedium');
    const barHard = document.getElementById('barHard');
    const countEasy = document.getElementById('countEasy');
    const countMedium = document.getElementById('countMedium');
    const countHard = document.getElementById('countHard');

    const cacheKey = 'leetcode_solved_data_v2';

    function updateUI(solved, easy, medium, hard) {
        const total = solved || (easy + medium + hard);
        if (statEl) {
            statEl.dataset.target = total;
            statEl.textContent = total;
        }
        if (heroTotal) heroTotal.textContent = total;
        if (heroStat) heroStat.textContent = total;
        if (strengthCount) strengthCount.textContent = total;

        const maxCount = Math.max(easy, medium, hard, 1);
        if (barEasy) { barEasy.style.width = `${(easy / maxCount) * 100}%`; }
        if (barMedium) { barMedium.style.width = `${(medium / maxCount) * 100}%`; }
        if (barHard) { barHard.style.width = `${(hard / maxCount) * 100}%`; }

        if (countEasy) countEasy.textContent = easy;
        if (countMedium) countMedium.textContent = medium;
        if (countHard) countHard.textContent = hard;
    }

    // Restore cached breakdown instantly if available
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const data = JSON.parse(cached);
            updateUI(data.solved, data.easy, data.medium, data.hard);
        } catch (e) { /* ignore corrupt cache */ }
    } else {
        // Initial defaults
        updateUI(67, 38, 26, 3);
    }

    try {
        let data = null;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(`https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/solved`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) data = await res.json();
        } catch (e) {
            console.warn('Primary LeetCode API failed or timed out, trying secondary endpoint...');
        }

        if (!data || (!data.solvedProblem && !data.totalSolved)) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${LEETCODE_USERNAME}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) data = await res.json();
        }

        if (data) {
            const solved = data.solvedProblem ?? data.totalSolved ?? data.solved ?? 67;
            const easy = data.easySolved ?? 38;
            const medium = data.mediumSolved ?? 26;
            const hard = data.hardSolved ?? 3;

            updateUI(solved, easy, medium, hard);
            localStorage.setItem(cacheKey, JSON.stringify({ solved, easy, medium, hard }));
        }
    } catch (err) {
        console.warn('LeetCode live stat unavailable, using fallback values.', err);
    }
})();

(() => {
    'use strict';

    // ─── Navigation (top nav + mobile panel) ─────────────────
    const topNav = document.getElementById('topNav');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileNavPanel = document.getElementById('mobileNavPanel');
    const navLinkEls = document.querySelectorAll('.top-nav a[href^="#"], .mobile-nav-panel a[href^="#"]');

    function syncTopNavState() {
        topNav?.classList.toggle('scrolled', window.scrollY > 40);
    }

    syncTopNavState();
    window.addEventListener('scroll', syncTopNavState);

    mobileMenuToggle?.addEventListener('click', () => {
        mobileNavPanel?.classList.toggle('open');
    });

    navLinkEls.forEach(link => {
        link.addEventListener('click', () => {
            mobileNavPanel?.classList.remove('open');
        });
    });

    // Active link highlighting using IntersectionObserver for better accuracy
    const sections = document.querySelectorAll('section[id]');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinkEls.forEach(link => {
                    const href = link.getAttribute('href');
                    link.classList.toggle('active', href === `#${entry.target.id}`);
                });
            }
        });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0.15 });

    sections.forEach(s => sectionObserver.observe(s));

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                const offset = topNav ? topNav.offsetHeight + 12 : 80;
                window.scrollTo({
                    top: target.offsetTop - offset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ─── Stats Counter Animation ─────────────────────────
    const statNumbers = document.querySelectorAll('.stat-number, .hero-stat-number');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;
        statsAnimated = true;

        statNumbers.forEach(num => {
            num.classList.add('counting');
            const target = parseInt(num.dataset.target || '0', 10);
            const duration = 1800;
            const start = performance.now();

            function step(timestamp) {
                const elapsed = timestamp - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                num.textContent = Math.floor(target * eased).toString();
                if (progress < 1) {
                    requestAnimationFrame(step);
                } else {
                    num.textContent = target.toString();
                    num.classList.remove('counting');
                }
            }
            requestAnimationFrame(step);
        });
    }

    // ─── Scroll Reveal & Stagger Animations ──────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (entry.target.closest('.stats-bar')) {
                    animateStats();
                }
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    // Observe reveal elements
    document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up, .section-header, .glass-card, .project-card, .cert-card').forEach(el => {
        revealObserver.observe(el);
    });

    // Stagger reveal for sibling elements inside grids and rows
    document.querySelectorAll('.feature-row, .skills-grid, .projects-grid, .certs-scroll-track, .about-highlights, .card-info-grid').forEach(container => {
        const children = container.querySelectorAll('.glass-card, .project-card, .cert-card, .highlight-card, .reveal-left, .reveal-right, .card-info');
        children.forEach((child, index) => {
            child.style.transitionDelay = `${index * 0.08}s`;
        });
    });

    // Stats bar standalone observer fallback
    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) animateStats();
            });
        }, { threshold: 0.25 });
        statsObserver.observe(statsBar);
    }

    if (document.querySelector('.hero-minimal .hero-stat-number')) {
        animateStats();
    }

    const graphDividers = document.querySelectorAll('.graph-divider');
    if (graphDividers.length) {
        const graphObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    graphObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        graphDividers.forEach(div => graphObserver.observe(div));
    }

    // ─── Icon Wave Marquee Hover Pause ───────────────────
    document.querySelectorAll('.icon-wave').forEach(wave => {
        const track = wave.querySelector('.icon-wave-track');
        if (!track) return;
        wave.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });
        wave.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
    });

    // ─── Dashboard Card Tabs ───────────
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.dashboard-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`panel-${tab.dataset.tab}`)?.classList.add('active');
        });
    });

    // ─── Resume Preview Modal ───────────
    const resumeModal = document.getElementById('resumeModal');
    const resumePreviewBtn = document.getElementById('resumePreviewBtn');
    const resumeModalClose = document.getElementById('resumeModalClose');
    const resumeModalBackdrop = document.getElementById('resumeModalBackdrop');

    function openResumeModal() {
        if (!resumeModal) return;
        resumeModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeResumeModal() {
        if (!resumeModal) return;
        resumeModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (resumePreviewBtn) resumePreviewBtn.addEventListener('click', openResumeModal);
    document.getElementById('heroResumeBtn')?.addEventListener('click', openResumeModal);
    document.getElementById('navResumeBtn')?.addEventListener('click', openResumeModal);
    if (resumeModalClose) resumeModalClose.addEventListener('click', closeResumeModal);
    if (resumeModalBackdrop) resumeModalBackdrop.addEventListener('click', closeResumeModal);

    // ─── Command Palette ───────────
    const cmdModal = document.getElementById('cmdModal');
    const cmdModalBackdrop = document.getElementById('cmdModalBackdrop');
    const cmdPaletteBtn = document.getElementById('cmdPaletteBtn');
    const cmdSearchInput = document.getElementById('cmdSearchInput');
    const cmdResultsList = document.getElementById('cmdResultsList');
    const cmdKbdHint = document.getElementById('cmdKbdHint');

    // Display correct OS shortcut hint (Cmd K vs Ctrl K)
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.userAgent.toUpperCase().indexOf('MAC') >= 0;
    if (cmdKbdHint) {
        cmdKbdHint.textContent = isMac ? '⌘K' : 'Ctrl K';
    }

    function openCmdModal() {
        if (!cmdModal) return;
        cmdModal.classList.add('open');
        cmdModal.setAttribute('aria-hidden', 'false');
        if (cmdSearchInput) {
            cmdSearchInput.value = '';
            filterCmdItems('');
            setTimeout(() => cmdSearchInput.focus(), 50);
        }
        document.body.style.overflow = 'hidden';
    }

    function closeCmdModal() {
        if (!cmdModal) return;
        cmdModal.classList.remove('open');
        cmdModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function getVisibleCmdItems() {
        if (!cmdResultsList) return [];
        return Array.from(cmdResultsList.querySelectorAll('.cmd-item')).filter(el => el.style.display !== 'none');
    }

    function setSelectedCmdItem(index) {
        const visibleItems = getVisibleCmdItems();
        if (visibleItems.length === 0) return;

        visibleItems.forEach(item => item.classList.remove('selected'));
        const safeIndex = Math.max(0, Math.min(index, visibleItems.length - 1));
        visibleItems[safeIndex].classList.add('selected');
        visibleItems[safeIndex].scrollIntoView({ block: 'nearest' });
    }

    function getSelectedIndex() {
        const visibleItems = getVisibleCmdItems();
        return visibleItems.findIndex(item => item.classList.contains('selected'));
    }

    function filterCmdItems(query) {
        if (!cmdResultsList) return;
        const q = query.trim().toLowerCase();
        const items = Array.from(cmdResultsList.querySelectorAll('.cmd-item'));
        let visibleCount = 0;

        items.forEach(item => {
            const title = item.querySelector('.cmd-item-title')?.textContent.toLowerCase() || '';
            const desc = item.querySelector('.cmd-item-desc')?.textContent.toLowerCase() || '';
            const matches = !q || title.includes(q) || desc.includes(q);

            item.style.display = matches ? 'flex' : 'none';
            if (matches) visibleCount++;
        });

        let noResEl = cmdResultsList.querySelector('.cmd-no-results');
        if (visibleCount === 0) {
            if (!noResEl) {
                noResEl = document.createElement('div');
                noResEl.className = 'cmd-no-results';
                noResEl.textContent = 'No matching commands found.';
                cmdResultsList.appendChild(noResEl);
            }
            noResEl.style.display = 'block';
        } else if (noResEl) {
            noResEl.style.display = 'none';
        }

        setSelectedCmdItem(0);
    }

    function executeCmdItem(item) {
        if (!item) return;
        const type = item.getAttribute('data-type');
        const url = item.getAttribute('data-url');
        const action = item.getAttribute('data-action');

        closeCmdModal();

        if (type === 'nav' && url) {
            const targetEl = document.querySelector(url);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.location.hash = url;
            }
        } else if (type === 'action' && action === 'resume') {
            openResumeModal();
        } else if (type === 'ext' && url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    if (cmdPaletteBtn) cmdPaletteBtn.addEventListener('click', openCmdModal);
    if (cmdModalBackdrop) cmdModalBackdrop.addEventListener('click', closeCmdModal);

    if (cmdSearchInput) {
        cmdSearchInput.addEventListener('input', (e) => {
            filterCmdItems(e.target.value);
        });

        cmdSearchInput.addEventListener('keydown', (e) => {
            const visibleItems = getVisibleCmdItems();
            const currentIndex = getSelectedIndex();

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedCmdItem(currentIndex + 1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedCmdItem(currentIndex - 1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (visibleItems[currentIndex]) {
                    executeCmdItem(visibleItems[currentIndex]);
                }
            }
        });
    }

    if (cmdResultsList) {
        cmdResultsList.addEventListener('click', (e) => {
            const item = e.target.closest('.cmd-item');
            if (item) {
                executeCmdItem(item);
            }
        });
    }

    // Global Keydown Handler (Ctrl+K / Cmd+K and ESC)
    document.addEventListener('keydown', (e) => {
        const isK = e.key && e.key.toLowerCase() === 'k';
        if (isK && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            if (cmdModal && cmdModal.classList.contains('open')) {
                closeCmdModal();
            } else {
                openCmdModal();
            }
        } else if (e.key === 'Escape') {
            if (cmdModal && cmdModal.classList.contains('open')) {
                closeCmdModal();
            } else if (resumeModal && resumeModal.classList.contains('open')) {
                closeResumeModal();
            } else if (projectModal && projectModal.classList.contains('open')) {
                closeProjectModal();
            }
        }
    });

    // ─── Project Case Study Modal ───────────
    const projectsData = {
        alphaguard: {
            title: 'Alpha-Guard — Forensic Credit Risk Platform',
            problem: 'Institutional-grade financial auditing tools are locked behind expensive enterprise terminals, leaving individual investors to rely on stock price hype instead of fundamentals — and manually reading hundreds of pages of regulatory filings isn\'t realistic.',
            approach: 'Built a dual-engine system that unites deterministic math (Altman Z-Score risk classification) with an LLM layer that scans executive narratives for evasive language and policy shifts. Added a Monte Carlo simulation engine running 1,000 statistical paths for revenue stress-testing, backed by a resilient async data pipeline (SEC EDGAR with Yahoo Finance fallback) covering both US and Indian exchanges.',
            stack: 'Next.js, TypeScript, Tailwind CSS, FastAPI, Pandas, NumPy, Scikit-learn, Google Gemini API, Playwright/BeautifulSoup, deployed on Vercel + Render.',
            outcome: 'Processes full corporate disclosures like 10-K filings into actionable risk intelligence — combining quantitative and qualitative signals — in under 2.4 seconds.',
            github: 'https://github.com/Priya-Pareekk/Alpha-Guard',
            demo: 'https://alphaguard.netlify.app'
        },
        tuberadar: {
            title: 'TubeRadar — YouTube Sentiment Analysis',
            problem: 'Brands and creators need to gauge audience sentiment across hundreds of YouTube comments without reading each one manually.',
            approach: 'Built a dashboard that scrapes comments via the Google API and runs TextBlob NLP for polarity scoring, visualized with Plotly — including a "Competitor Battle" mode for side-by-side brand comparison.',
            stack: 'Python, Streamlit, TextBlob, Google API, Plotly.',
            outcome: 'A real-time sentiment analysis suite usable for both single-channel monitoring and competitor benchmarking.',
            github: 'https://github.com/Priya-Pareekk/youtube_radar',
            demo: 'https://youtube-radar-ten.vercel.app/'
        }
    };

    const projectModal = document.getElementById('projectModal');
    const projectModalTitle = document.getElementById('projectModalTitle');
    const projectModalBody = document.getElementById('projectModalBody');
    const projectModalClose = document.getElementById('projectModalClose');
    const projectModalBackdrop = document.getElementById('projectModalBackdrop');

    function openProjectModal(key) {
        const data = projectsData[key];
        if (!data || !projectModal || !projectModalTitle || !projectModalBody) return;

        projectModalTitle.textContent = data.title;
        projectModalBody.innerHTML = `
            <p><strong>Problem:</strong> ${data.problem}</p>
            <p><strong>Approach:</strong> ${data.approach}</p>
            <p><strong>Stack:</strong> ${data.stack}</p>
            <p><strong>Outcome:</strong> ${data.outcome}</p>
            <div class="project-modal-links">
                <a href="${data.github}" target="_blank" rel="noopener noreferrer">
                    <span class="material-symbols-outlined">code</span> View Code
                </a>
                ${data.demo ? `<a href="${data.demo}" target="_blank" rel="noopener noreferrer">
                    <span class="material-symbols-outlined">open_in_new</span> Live Demo
                </a>` : ''}
            </div>
        `;

        projectModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeProjectModal() {
        if (!projectModal) return;
        projectModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.btn-case-study').forEach(btn => {
        btn.addEventListener('click', () => openProjectModal(btn.dataset.project));
    });

    if (projectModalClose) projectModalClose.addEventListener('click', closeProjectModal);
    if (projectModalBackdrop) projectModalBackdrop.addEventListener('click', closeProjectModal);

    // ─── Contact: Copy Email ───────────
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const copyHint = document.getElementById('copyHint');

    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', async () => {
            const email = document.getElementById('emailDisplay')?.textContent || 'priyapareeek29@gmail.com';
            try {
                await navigator.clipboard.writeText(email);
                if (copyHint) {
                    copyHint.textContent = 'Copied!';
                    copyHint.style.opacity = '1';
                }
                setTimeout(() => {
                    if (copyHint) {
                        copyHint.textContent = 'Click to copy';
                        copyHint.style.opacity = '';
                    }
                }, 1800);
            } catch (err) {
                window.location.href = `mailto:${email}`;
            }
        });
    }

    // ─── Hero Terminal (Step 9 interactive prompt) ───────────
    (function initTerminal() {
        const body = document.getElementById('terminalBody');
        const input = document.getElementById('terminalInput');
        const quickBtns = document.querySelectorAll('.terminal-quick-commands button');
        if (!body || !input) return;

        let introRunning = true;

        function appendLine(html, cls = 'output') {
            const line = document.createElement('div');
            line.className = `terminal-line ${cls}`;
            line.innerHTML = html;
            body.appendChild(line);
            body.scrollTop = body.scrollHeight;
            return line;
        }

        function typeIntoLine(prefix, text, cls, speed = 22) {
            return new Promise(resolve => {
                const line = appendLine(prefix, cls);
                let i = 0;
                function step() {
                    line.innerHTML = prefix + text.slice(0, i);
                    body.scrollTop = body.scrollHeight;
                    if (i < text.length) {
                        i++;
                        setTimeout(step, speed);
                    } else {
                        resolve();
                    }
                }
                step();
            });
        }

        function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

        async function runIntro() {
            await typeIntoLine('<span class="prompt-echo">guest@priya:~$ </span>', 'whoami', 'output');
            appendLine('<strong>Priya Pareek</strong> — Backend Developer & CS Student', 'output');
            await sleep(300);

            await typeIntoLine('<span class="prompt-echo">guest@priya:~$ </span>', 'cat focus.txt', 'output');
            appendLine('System Design · DSA · Backend Development · currently prepping for SDE placements', 'output');
            await sleep(300);

            appendLine('Type <strong>help</strong> to see available commands, or use the buttons below.', 'output');
            introRunning = false;
            input.focus();
        }

        let commandHistory = [];
        let historyIndex = -1;

        const commands = {
            help: () => appendLine('Commands: <strong>about</strong>, <strong>skills</strong>, <strong>projects</strong>, <strong>certifications</strong>, <strong>resume</strong>, <strong>contact</strong>, <strong>github</strong>, <strong>leetcode</strong>, <strong>clear</strong>'),
            about: () => { scrollToSection('about'); appendLine('Opening About section →'); },
            skills: () => { scrollToSection('skills'); appendLine('Opening Skills section →'); },
            projects: () => { scrollToSection('projects'); appendLine('Opening Projects section →'); },
            certifications: () => { scrollToSection('certifications'); appendLine('Opening Certifications section →'); },
            contact: () => { scrollToSection('contact'); appendLine('Opening Contact section →'); },
            live: () => { scrollToSection('live'); appendLine('Opening Live section →'); },
            email: () => {
                try {
                    navigator.clipboard.writeText('priyapareeek29@gmail.com');
                    appendLine('Email copied to clipboard: priyapareeek29@gmail.com');
                } catch (e) {
                    appendLine('Email: priyapareeek29@gmail.com');
                }
            },
            coffee: () => appendLine('☕ Brewing... — this is what powers most of my commits.'),
            resume: () => { appendLine('Opening resume preview →'); if (typeof openResumeModal === 'function') openResumeModal(); },
            github: () => { appendLine('Switching dashboard to GitHub →'); document.querySelector('.dashboard-tab[data-tab="github"]')?.click(); },
            leetcode: () => { appendLine('Switching dashboard to LeetCode →'); document.querySelector('.dashboard-tab[data-tab="leetcode"]')?.click(); },
            whoami: () => appendLine('<strong>Priya Pareek</strong> — Backend Developer & CS Student @ VIT-AP University'),
            clear: () => { body.innerHTML = ''; },
            'sudo hire-me': () => appendLine('Permission granted. Scroll down and see for yourself. 😄'),
        };

        function scrollToSection(id) { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }

        function runCommand(raw) {
            const cmd = raw.trim().toLowerCase();
            appendLine(`<span class="prompt-echo">guest@priya:~$ </span>${raw}`, 'output');
            if (!cmd) return;
            if (commands[cmd]) { commands[cmd](); }
            else { appendLine(`command not found: ${cmd} — type <strong>help</strong> for options`, 'error'); }
        }

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !introRunning) {
                const val = input.value;
                input.value = '';
                if (val.trim()) {
                    commandHistory.push(val);
                    historyIndex = commandHistory.length;
                }
                runCommand(val);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    input.value = commandHistory[historyIndex] || '';
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    input.value = commandHistory[historyIndex] || '';
                } else {
                    historyIndex = commandHistory.length;
                    input.value = '';
                }
            }
        });

        quickBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (introRunning) return;
                runCommand(btn.dataset.cmd);
                input.focus();
            });
        });

        document.querySelector('.terminal-window')?.addEventListener('click', () => input.focus());

        runIntro();
    })();

        // ─── Subtle Network Background (hero)
        (function initNetworkBackground() {
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const canvas = document.getElementById('networkCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            let width = 0, height = 0, nodes = [];

            function resize() {
                const hero = canvas.closest('.hero-minimal, .hero');
                if (!hero) return;
                width = canvas.width = hero.offsetWidth;
                height = canvas.height = hero.offsetHeight;
            }

            function createNodes() {
                    const count = Math.floor((width * height) / 45000);
                    const cap = width < 600 ? 10 : 22;
                    nodes = Array.from({ length: Math.min(count, cap) }, () => ({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        vx: (Math.random() - 0.5) * 0.15,
                        vy: (Math.random() - 0.5) * 0.15
                    }));
                }

            function step() {
                ctx.clearRect(0, 0, width, height);

                nodes.forEach(n => {
                    n.x += n.vx;
                    n.y += n.vy;
                    if (n.x < 0 || n.x > width) n.vx *= -1;
                    if (n.y < 0 || n.y > height) n.vy *= -1;
                });

                for (let i = 0; i < nodes.length; i++) {
                    for (let j = i + 1; j < nodes.length; j++) {
                        const dx = nodes[i].x - nodes[j].x;
                        const dy = nodes[i].y - nodes[j].y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 180) {
                            ctx.strokeStyle = `rgba(107, 122, 82, ${1 - dist / 180})`;
                            ctx.lineWidth = 0.6;
                            ctx.beginPath();
                            ctx.moveTo(nodes[i].x, nodes[i].y);
                            ctx.lineTo(nodes[j].x, nodes[j].y);
                            ctx.stroke();
                        }
                    }
                }

                nodes.forEach(n => {
                    ctx.fillStyle = 'rgba(217, 168, 103, 0.6)';
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
                    ctx.fill();
                });

                requestAnimationFrame(step);
            }

            resize();
            createNodes();
            step();

            let resizeTimer;
            function onResizeDebounced() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    resize();
                    createNodes();
                }, 120);
            }

            window.addEventListener('resize', onResizeDebounced);
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    resize();
                    createNodes();
                }, 200);
            });
        })();
})();
