/* ======================================================
   Antigravity-Style Portfolio — Priya Pareek
   Interactive Features & Clean Motion System
   ====================================================== */

// ─── Live GitHub Stats ───────────
const GITHUB_USERNAME = 'Priya-Pareekk';

(async function fetchGithubStats() {
    const repoEl = document.getElementById('githubRepoCount');
    const followersEl = document.getElementById('githubFollowers');
    const starsEl = document.getElementById('githubStars');
    const topLangEl = document.getElementById('githubTopLang');
    if (!repoEl) return;

    const cacheKey = 'github_stats_cache';
    const cacheTimeKey = 'github_stats_cache_time';
    const oneHour = 60 * 60 * 1000;

    // Show cached values instantly while we refresh in the background
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            const c = JSON.parse(cached);
            repoEl.textContent = c.repos;
            followersEl.textContent = c.followers;
            starsEl.textContent = c.stars;
            topLangEl.textContent = c.topLang;
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

        repoEl.textContent = stats.repos;
        followersEl.textContent = stats.followers;
        starsEl.textContent = stats.stars;
        topLangEl.textContent = stats.topLang;

        localStorage.setItem(cacheKey, JSON.stringify(stats));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
    } catch (err) {
        console.warn('GitHub live stats unavailable, using fallback values.', err);
        // Fallback values shown only if there's no cache AND the API call fails
        if (!cached) {
            repoEl.textContent = '3';
            followersEl.textContent = '—';
            starsEl.textContent = '—';
            topLangEl.textContent = 'JavaScript';
        }
    }
})();

// ─── Live LeetCode Solved Count ───────────
const LEETCODE_USERNAME = 'Priya_pareek';

(async function fetchLeetCodeSolved() {
    const statEl = document.getElementById('leetcodeStat');
    const heroTotal = document.getElementById('heroLeetcodeTotal');
    const barEasy = document.getElementById('barEasy');
    const barMedium = document.getElementById('barMedium');
    const barHard = document.getElementById('barHard');
    const countEasy = document.getElementById('countEasy');
    const countMedium = document.getElementById('countMedium');
    const countHard = document.getElementById('countHard');

    const cacheKey = 'leetcode_solved_count';
    const cached = localStorage.getItem(cacheKey);
    if (cached && statEl) statEl.dataset.target = cached;
    if (cached && heroTotal) heroTotal.textContent = cached;

    try {
        const res = await fetch(`https://alfa-leetcode-api.onrender.com/${LEETCODE_USERNAME}/solved`);
        if (!res.ok) throw new Error('LeetCode API request failed');
        const data = await res.json();
        const solved = data.solvedProblem ?? data.totalSolved ?? data.solved;
        const easy = data.easySolved ?? 0;
        const medium = data.mediumSolved ?? 0;
        const hard = data.hardSolved ?? 0;
        const maxCount = Math.max(easy, medium, hard, 1);

        if (solved) {
            if (statEl) {
                statEl.dataset.target = solved;
                if (statEl.textContent !== '0' && !statEl.classList.contains('counting')) {
                    statEl.textContent = solved;
                }
            }
            if (heroTotal) heroTotal.textContent = solved;
            localStorage.setItem(cacheKey, solved);
        }

        if (barEasy) { barEasy.style.width = `${(easy / maxCount) * 100}%`; countEasy.textContent = easy; }
        if (barMedium) { barMedium.style.width = `${(medium / maxCount) * 100}%`; countMedium.textContent = medium; }
        if (barHard) { barHard.style.width = `${(hard / maxCount) * 100}%`; countHard.textContent = hard; }
    } catch (err) {
        console.warn('LeetCode live stat unavailable, using fallback value.', err);
    }
})();

(() => {
    'use strict';

    // ─── Navigation ──────────────────────────────────────
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const navLinkEls = document.querySelectorAll('.nav-link');

    // Sticky nav
    window.addEventListener('scroll', () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 40);
    });

    // Mobile menu
    mobileMenuBtn?.addEventListener('click', () => {
        navLinks?.classList.toggle('open');
        mobileMenuBtn.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinkEls.forEach(link => {
        link.addEventListener('click', () => {
            navLinks?.classList.remove('open');
            mobileMenuBtn?.classList.remove('active');
        });
    });

    // Active link highlight on scroll
    const sections = document.querySelectorAll('section[id]');
    function updateActiveLink() {
        const scrollPos = window.scrollY + 180;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPos >= top && scrollPos < top + height) {
                navLinkEls.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }
    window.addEventListener('scroll', updateActiveLink);

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                const offset = 80;
                window.scrollTo({
                    top: target.offsetTop - offset,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ─── Stats Counter Animation ─────────────────────────
    const statNumbers = document.querySelectorAll('.stat-number');
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
            }
        }
    });

})();
