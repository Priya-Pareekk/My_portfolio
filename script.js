/* ======================================================
   Antigravity-Style Portfolio — Priya Pareek
   Interactive Features & Animations
   ====================================================== */

(() => {
    'use strict';

    // ─── Custom Cursor ────────────────────────────────────
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });

    // Smooth lagging ring
    function animateCursorRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        requestAnimationFrame(animateCursorRing);
    }
    animateCursorRing();

    // Cursor hover state on interactive elements
    const interactiveEls = document.querySelectorAll('a, button, .magnetic-btn, .glass-card, .tilt-card, .icon-wave-item, .skill-tag, .nav-link');
    interactiveEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.classList.add('hovering');
            cursorRing.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.classList.remove('hovering');
            cursorRing.classList.remove('hovering');
        });
    });

    // Cursor click state
    document.addEventListener('mousedown', () => {
        cursorDot.classList.add('clicking');
        cursorRing.classList.add('clicking');
    });
    document.addEventListener('mouseup', () => {
        cursorDot.classList.remove('clicking');
        cursorRing.classList.remove('clicking');
    });

    // ─── Floating Particles (Hero background) ───────────
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleColors = [
        'rgba(66, 133, 244, 0.5)',   // Blue
        'rgba(234, 67, 53, 0.35)',    // Red
        'rgba(251, 188, 4, 0.35)',    // Yellow
        'rgba(52, 168, 83, 0.4)',     // Green
        'rgba(155, 89, 182, 0.35)',   // Purple
        'rgba(66, 133, 244, 0.25)',
        'rgba(234, 67, 53, 0.2)',
    ];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 4 + 1.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
            this.opacity = Math.random() * 0.6 + 0.2;
            // Some particles are dashes/rectangles (like Antigravity)
            this.shape = Math.random() > 0.6 ? 'dash' : 'dot';
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        }

        update(mx, my) {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;

            // Mouse repulsion
            const dx = this.x - mx;
            const dy = this.y - my;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150;
                this.x += (dx / dist) * force * 2;
                this.y += (dy / dist) * force * 2;
            }

            // Wrap around
            if (this.x < -10) this.x = canvas.width + 10;
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.y < -10) this.y = canvas.height + 10;
            if (this.y > canvas.height + 10) this.y = -10;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            if (this.shape === 'dash') {
                // Rectangular dash shape like Antigravity's particles
                ctx.fillRect(-this.size * 2, -this.size * 0.5, this.size * 4, this.size);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    // Create particles
    const particleCount = Math.min(Math.floor(window.innerWidth / 12), 110);
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    let canvasMouseX = -999, canvasMouseY = -999;
    document.addEventListener('mousemove', e => {
        canvasMouseX = e.clientX;
        canvasMouseY = e.clientY;
    });

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update(canvasMouseX, canvasMouseY);
            p.draw(ctx);
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ─── Dark Section Particles ──────────────────────────
    const darkCanvas = document.getElementById('dark-particles-canvas');
    if (darkCanvas) {
        const dCtx = darkCanvas.getContext('2d');
        let darkParticles = [];

        function resizeDarkCanvas() {
            const section = darkCanvas.parentElement;
            darkCanvas.width = section.offsetWidth;
            darkCanvas.height = section.offsetHeight;
        }
        resizeDarkCanvas();
        window.addEventListener('resize', resizeDarkCanvas);

        class DarkParticle {
            constructor(w, h) {
                this.w = w;
                this.h = h;
                this.reset();
            }

            reset() {
                this.x = Math.random() * this.w;
                this.y = Math.random() * this.h;
                this.size = Math.random() * 2.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.6 + 0.2;
                this.color = Math.random() > 0.5 ? 'rgba(66, 133, 244, 0.8)' : 'rgba(100, 150, 255, 0.5)';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.x < 0 || this.x > this.w) this.speedX *= -1;
                if (this.y < 0 || this.y > this.h) this.speedY *= -1;
            }

            draw(ctx) {
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const dpCount = 80;
        for (let i = 0; i < dpCount; i++) {
            darkParticles.push(new DarkParticle(darkCanvas.width, darkCanvas.height));
        }

        function animateDarkParticles() {
            dCtx.clearRect(0, 0, darkCanvas.width, darkCanvas.height);
            darkParticles.forEach(p => {
                p.update();
                p.draw(dCtx);
            });
            requestAnimationFrame(animateDarkParticles);
        }
        animateDarkParticles();
    }

    // ─── Navigation ──────────────────────────────────────
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const navLinkEls = document.querySelectorAll('.nav-link');

    // Sticky nav
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    });

    // Mobile menu
    mobileMenuBtn?.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        mobileMenuBtn.classList.toggle('active');
    });

    // Close mobile on link click
    navLinkEls.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            mobileMenuBtn?.classList.remove('active');
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    function updateActiveLink() {
        const scrollPos = window.scrollY + 200;
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

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
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
            const target = parseInt(num.dataset.target);
            const duration = 1800;
            const start = performance.now();

            function step(timestamp) {
                const elapsed = timestamp - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                num.textContent = Math.floor(target * eased);
                if (progress < 1) requestAnimationFrame(step);
                else num.textContent = target;
            }
            requestAnimationFrame(step);
        });
    }

    // ─── Scroll Reveal Animations ────────────────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Check if it's the stats section
                if (entry.target.closest('.stats-bar')) {
                    animateStats();
                }
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    // Observe reveal elements
    document.querySelectorAll('.reveal-left, .reveal-right').forEach(el => {
        revealObserver.observe(el);
    });

    // Observe stats bar
    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) animateStats();
            });
        }, { threshold: 0.3 });
        statsObserver.observe(statsBar);
    }

    // Generic fade-in-up for section headers and cards
    const fadeUpObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-header, .glass-card, .project-card, .cert-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        fadeUpObserver.observe(el);
    });

    // Stagger delays for grids
    document.querySelectorAll('.skills-grid .glass-card, .projects-grid .project-card, .certs-scroll-track .cert-card').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.1}s`;
    });

    // ─── Tilt Effect on Cards ───────────────────────────
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -4;
            const rotateY = (x - centerX) / centerX * 4;
            // Dynamic shadow depth based on tilt intensity
            const tiltIntensity = Math.sqrt(rotateX * rotateX + rotateY * rotateY);
            const shadowBlur = 20 + tiltIntensity * 3;
            const shadowOpacity = 0.04 + tiltIntensity * 0.006;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.01)`;
            card.style.boxShadow = `0 ${8 + tiltIntensity}px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity})`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
            card.style.boxShadow = '';
        });
    });

    // ─── Magnetic Button Effect ──────────────────────────
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.03)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0) scale(1)';
        });
    });

    // ─── Certifications Horizontal Scroll ────────────────
    const scrollTrack = document.querySelector('.certs-scroll-track');
    const scrollLeftBtn = document.getElementById('scrollLeft');
    const scrollRightBtn = document.getElementById('scrollRight');

    scrollLeftBtn?.addEventListener('click', () => {
        scrollTrack.scrollBy({ left: -310, behavior: 'smooth' });
    });

    scrollRightBtn?.addEventListener('click', () => {
        scrollTrack.scrollBy({ left: 310, behavior: 'smooth' });
    });

    // ─── Icon Wave pause on hover ────────────────────────
    document.querySelectorAll('.icon-wave').forEach(wave => {
        const track = wave.querySelector('.icon-wave-track');
        wave.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });
        wave.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
    });

})();
