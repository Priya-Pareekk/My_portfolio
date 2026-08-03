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
    const strengthCount = document.getElementById('strengthLeetcodeCount');
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
    if (cached && strengthCount) strengthCount.textContent = cached;

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
            if (strengthCount) strengthCount.textContent = solved;
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

    // Sticky nav + transparent state while hero visible
    (function setupNavbarHeroState() {
        const hero = document.getElementById('home');
        const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function setNavTransparent(on) {
            if (!navbar) return;
            navbar.classList.toggle('navbar--transparent', on);
            navbar.classList.toggle('scrolled', !on && window.scrollY > 40);
        }

        // Default based on scroll
        setNavTransparent(window.scrollY < 80 && !!hero);

        if (hero && 'IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    setNavTransparent(e.isIntersecting && e.intersectionRatio > 0.25);
                });
            }, { threshold: [0, 0.25, 0.5] });
            obs.observe(hero);
        } else {
            // fallback: simple scroll
            window.addEventListener('scroll', () => setNavTransparent(window.scrollY < 80));
        }

        if (!prefersReduce) {
            window.addEventListener('scroll', () => {
                navbar?.classList.toggle('scrolled', window.scrollY > 40);
            });
        }
    })();

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
                const target = entry.target;
                // Add visible class to the element (or its project parent)
                const projectParent = target.closest && target.closest('.project-case');
                if (projectParent) {
                    projectParent.classList.add('visible');
                    animateProjectMetrics(projectParent);
                } else {
                    target.classList.add('visible');
                }

                if (target.closest && target.closest('.stats-bar')) {
                    animateStats();
                }
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    // Observe reveal elements (include new project-case elements)
    document.querySelectorAll('.reveal-left, .reveal-right, .reveal-up, .section-header, .glass-card, .project-card, .cert-card, .project-case').forEach(el => {
        revealObserver.observe(el);
    });

    // Animate project metrics when a project becomes visible
    function animateProjectMetrics(projectEl) {
        if (!projectEl) return;
        const nums = projectEl.querySelectorAll('.metric-number');
        nums.forEach(num => {
            if (num.classList.contains('counting')) return;
            const target = parseInt(num.dataset.target || '0', 10);
            if (!target) { num.textContent = '0'; return; }
            num.classList.add('counting');
            const duration = 1200;
            const start = performance.now();
            function step(ts) {
                const elapsed = ts - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                num.textContent = Math.floor(target * eased).toString();
                if (progress < 1) requestAnimationFrame(step);
                else { num.textContent = target.toString(); num.classList.remove('counting'); }
            }
            requestAnimationFrame(step);
        });
    }

    // ---------- Engineering Dashboard Animations ----------
    let engAnimated = false;
    let engTerminalInterval = null;

    function animateEngineeringMetrics() {
        const nums = document.querySelectorAll('.eng-metric-number');
        nums.forEach(num => {
            if (num.classList.contains('counting')) return;
            const target = parseInt(num.dataset.target || '0', 10);
            num.classList.add('counting');
            const duration = 1400;
            const start = performance.now();
            function step(ts) {
                const elapsed = ts - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                num.textContent = Math.floor(target * eased).toString();
                if (progress < 1) requestAnimationFrame(step);
                else { num.textContent = target.toString(); num.classList.remove('counting'); }
            }
            requestAnimationFrame(step);
        });
    }

    function animateProgressBars() {
        const bars = document.querySelectorAll('.eng-progress-bar');
        bars.forEach(bar => {
            const p = parseFloat(bar.dataset.progress || '0');
            // Respect reduced motion
            const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReduce) {
                bar.style.transform = `scaleX(${p})`;
            } else {
                // trigger CSS transform
                requestAnimationFrame(() => { bar.style.transform = `scaleX(${p})`; });
            }
        });
    }

    function startTerminalLoop() {
        const term = document.querySelector('.eng-terminal .term-body');
        const termRoot = document.querySelector('.eng-terminal');
        if (!term || !termRoot) return;
        const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduce) {
            term.textContent = 'java --version\nopenjdk version "17.0.2"\n';
            return;
        }

        const raw = termRoot.dataset.commands;
        let commands = [];
        try { commands = JSON.parse(raw); } catch (e) { commands = ['java --version','git push origin main']; }

        let cmdIndex = 0;
        let charIdx = 0;
        let output = '';
        let typing = true;

        function clearAndNext() { term.textContent = ''; cmdIndex = (cmdIndex + 1) % commands.length; charIdx = 0; output = ''; typing = true; }

        function tick() {
            const cmd = commands[cmdIndex];
            if (typing) {
                // type one char
                term.textContent = `$ ${cmd.slice(0, charIdx + 1)}`;
                charIdx++;
                if (charIdx >= cmd.length) {
                    typing = false;
                    // simulate output after short delay
                    setTimeout(() => {
                        // realistic-ish outputs per command
                        const lower = cmd.toLowerCase();
                        if (lower.includes('java')) {
                            output = '\nopenjdk version "17.0.2" 2022-01-18\nOpenJDK Runtime Environment (build 17.0.2+8)';
                        } else if (lower.includes('spring')) {
                            output = '\nGenerating project: demo\nDependencies: web, lombok';
                        } else if (lower.includes('docker')) {
                            output = '\nCreating network "app_default" with the default driver\nStarting services...';
                        } else if (lower.includes('git push')) {
                            output = '\nEnumerating objects: 5, done.\nTo https://github.com/Priya-Pareekk/My_portfolio.git\n   73bb092..009f860  main -> main';
                        } else {
                            output = '\nCommand completed.';
                        }
                        term.textContent = `$ ${cmd}${output}`;
                        // hold for a moment and then clear
                        setTimeout(clearAndNext, 1600);
                    }, 350);
                }
            }
        }

        // Run loop using setInterval so it's easy to stop
        if (engTerminalInterval) clearInterval(engTerminalInterval);
        engTerminalInterval = setInterval(tick, 60);
    }

    function stopTerminalLoop() {
        if (engTerminalInterval) {
            clearInterval(engTerminalInterval);
            engTerminalInterval = null;
        }
    }

    function animateRequestFlow(flowRoot) {
        if (!flowRoot) return;
        const steps = Array.from(flowRoot.querySelectorAll('.flow-step'));
        const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReduce) return; // no sequential highlight

        let idx = 0;
        function stepHighlight() {
            steps.forEach(s => s.classList.remove('active'));
            steps[idx].classList.add('active');
            idx = (idx + 1) % steps.length;
            // schedule next
            flowRoot._flowTimer = setTimeout(stepHighlight, 700);
        }
        // clear existing
        if (flowRoot._flowTimer) clearTimeout(flowRoot._flowTimer);
        stepHighlight();
    }

    // Observe the engineering dashboard and trigger animations once visible
    const engRoot = document.querySelector('#skills');
    if (engRoot && 'IntersectionObserver' in window) {
        const engObs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.12) {
                    if (!engAnimated) {
                        engAnimated = true;
                        animateEngineeringMetrics();
                        animateProgressBars();
                        // start terminal loop
                        startTerminalLoop();
                        // animate request flow
                        const flow = engRoot.querySelector('.eng-flow');
                        animateRequestFlow(flow);
                    }
                } else {
                    // pause terminal when out of view
                    if (!entry.isIntersecting) stopTerminalLoop();
                }
            });
        }, { threshold: [0.12, 0.4], rootMargin: '0px 0px -40px 0px' });
        engObs.observe(engRoot);
    }

    // Stagger reveal for sibling elements inside grids and rows
    document.querySelectorAll('.feature-row, .skills-grid, .projects-grid, .certs-scroll-track, .about-highlights, .card-info-grid').forEach(container => {
        const children = container.querySelectorAll('.glass-card, .project-card, .cert-card, .highlight-card, .reveal-left, .reveal-right, .card-info');
        children.forEach((child, index) => {
            child.style.transitionDelay = `${index * 0.08}s`;
        });
    });

    // Hero headline reveal + small parallax
    (function heroAnimations() {
        const hero = document.getElementById('home');
        if (!hero) return;
        const lines = Array.from(document.querySelectorAll('.hero-headline-line'));
        const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        function revealLines() {
            lines.forEach((line, i) => {
                const delay = i * 80; // 80ms between lines
                line.style.animationDelay = `${delay}ms`;
                line.classList.add('revealed');
            });
        }

        if (!prefersReduce && 'IntersectionObserver' in window) {
            const hObs = new IntersectionObserver((entries, obs) => {
                entries.forEach(e => {
                    if (e.isIntersecting) {
                        revealLines();
                        obs.disconnect();
                    }
                });
            }, { threshold: 0.2 });
            hObs.observe(hero);
        } else {
            // Reduced motion or no observer: reveal immediately
            revealLines();
        }

        // Parallax (mouse) for hero content
        if (!prefersReduce) {
            const content = document.querySelector('.hero-content');
            if (!content) return;
            let clientX = 0, clientY = 0;
            let rafId = null;

            window.addEventListener('mousemove', (e) => {
                clientX = e.clientX;
                clientY = e.clientY;
                if (rafId) return;
                rafId = requestAnimationFrame(() => {
                    const rect = content.getBoundingClientRect();
                    const dx = (clientX - (rect.left + rect.width / 2)) / rect.width;
                    const dy = (clientY - (rect.top + rect.height / 2)) / rect.height;
                    const max = 7; // px
                    const tx = dx * max;
                    const ty = dy * max;
                    content.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
                    rafId = null;
                });
            });

            // reset on leave
            window.addEventListener('mouseleave', () => { if (content) content.style.transform = ''; });
        }
    })();

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
            } else if (document.getElementById('projectDrawer') && document.getElementById('projectDrawer').classList.contains('open')) {
                closeProjectDrawer();
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
            demo: ''
        }
    };

    // Project Drawer (reusable slide-over)
    const projectDrawer = document.getElementById('projectDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const drawerCloseBtn = document.getElementById('drawerCloseBtn');
    const drawerTitle = document.getElementById('drawerTitle');
    const drawerNumber = document.getElementById('drawerNumber');
    const drawerGithub = document.getElementById('drawerGithub');
    const drawerDemo = document.getElementById('drawerDemo');
    const drawerMockup = document.getElementById('drawerMockup');
    const drawerProblem = document.getElementById('drawerProblem');
    const drawerSolution = document.getElementById('drawerSolution');
    const drawerArchitecture = document.getElementById('drawerArchitecture');
    const drawerHighlights = document.getElementById('drawerHighlights');
    const drawerStack = document.getElementById('drawerStack');
    const drawerChallenges = document.getElementById('drawerChallenges');
    const drawerDeployment = document.getElementById('drawerDeployment');

    let _prevScrollY = 0;

    function openProjectDrawer(key) {
        const data = projectsData[key];
        if (!data || !projectDrawer) return;
        drawerTitle.textContent = data.title || '';
        drawerNumber.textContent = key === 'alphaguard' ? '01' : '02';
        drawerGithub.href = data.github || '#';
        drawerDemo.href = data.demo || '#';
        drawerDemo.style.display = data.demo ? 'inline-flex' : 'none';

        // Mockup image (placeholder if no demo)
        const img = document.createElement('img');
        img.alt = data.title;
        img.src = data.demo ? `${data.demo}/screenshot.png` : `https://via.placeholder.com/800x450?text=${encodeURIComponent(data.title)}`;
        drawerMockup.innerHTML = '';
        drawerMockup.appendChild(img);

        drawerProblem.textContent = data.problem || '';
        drawerSolution.textContent = data.approach || '';

        // architecture (simple reusable SVG)
        drawerArchitecture.innerHTML = `
            <svg viewBox="0 0 800 320" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="40" y="24" width="160" height="56" rx="8" class="arch-box" />
                    <rect x="300" y="24" width="160" height="56" rx="8" class="arch-box" />
                    <rect x="560" y="24" width="160" height="56" rx="8" class="arch-box" />
                    <path class="arch-line" d="M120 80 L120 140 L360 140 L360 80" />
                    <path class="arch-line" d="M440 80 L440 140 L600 140 L600 80" />
                    <rect x="300" y="160" width="160" height="56" rx="8" class="arch-box" />
                    <path class="arch-line" d="M360 216 L360 260" />
                    <rect x="520" y="260" width="160" height="40" rx="6" class="arch-box" />
                </g>
            </svg>`;

        // highlights and stack
        drawerHighlights.innerHTML = '';
        const highlights = ['REST APIs', 'Async Pipelines', 'DB Optimization', 'CI/CD'];
        highlights.forEach(h => {
            const el = document.createElement('div'); el.className = 'chip'; el.textContent = h; drawerHighlights.appendChild(el);
        });

        drawerStack.innerHTML = '';
        (data.stack || '').split(',').slice(0,6).forEach(s => {
            const sp = document.createElement('span'); sp.textContent = s.trim(); drawerStack.appendChild(sp);
        });

        drawerChallenges.textContent = data.outcome || '';
        drawerDeployment.textContent = data.demo ? `Deployed at ${data.demo}` : 'No live demo available.';

        // show drawer and backdrop, preserve scroll
        _prevScrollY = window.scrollY || document.documentElement.scrollTop;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${_prevScrollY}px`;
        projectDrawer.classList.add('open');
        drawerBackdrop.classList.add('open');
        projectDrawer.setAttribute('aria-hidden','false');

        // animate large architecture drawing (stroke dash)
        const svgLines = drawerArchitecture.querySelectorAll('.arch-line');
        svgLines.forEach((p, i) => {
            const len = p.getTotalLength ? p.getTotalLength() : 200;
            p.style.strokeDasharray = len;
            p.style.strokeDashoffset = len;
            p.style.transition = 'stroke-dashoffset 800ms cubic-bezier(0.2,0.9,0.12,1) ' + (i*120) + 'ms';
            requestAnimationFrame(()=> p.style.strokeDashoffset = '0');
        });
    }

    function closeProjectDrawer() {
        if (!projectDrawer) return;
        projectDrawer.classList.remove('open');
        drawerBackdrop.classList.remove('open');
        projectDrawer.setAttribute('aria-hidden','true');
        // restore scroll
        document.body.style.position = '';
        document.body.style.top = '';
        window.scrollTo(0, _prevScrollY || 0);
    }

    // click handlers
    document.querySelectorAll('.btn-open-case').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const key = btn.dataset.project;
            openProjectDrawer(key);
        });
    });

    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeProjectDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeProjectDrawer);

})();
