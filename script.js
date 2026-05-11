(function () {
    'use strict';

    /* ---------- Typed role rotation ---------- */
    const roles = [
        'DevOps Engineer',
        'Azure Cloud Solutions Architect',
        'Infrastructure as Code Advocate',
        'Kubernetes Enthusiast',
        'CI/CD Automation Specialist'
    ];
    const typedEl = document.getElementById('typed-role');
    if (typedEl) {
        let roleIdx = 0;
        let charIdx = 0;
        let deleting = false;
        const TYPE_SPEED = 80;
        const DELETE_SPEED = 40;
        const HOLD = 1600;

        function tick() {
            const current = roles[roleIdx];
            if (!deleting) {
                charIdx++;
                typedEl.textContent = current.slice(0, charIdx);
                if (charIdx === current.length) {
                    deleting = true;
                    return setTimeout(tick, HOLD);
                }
                return setTimeout(tick, TYPE_SPEED);
            }
            charIdx--;
            typedEl.textContent = current.slice(0, charIdx);
            if (charIdx === 0) {
                deleting = false;
                roleIdx = (roleIdx + 1) % roles.length;
                return setTimeout(tick, 400);
            }
            setTimeout(tick, DELETE_SPEED);
        }
        tick();
    }

    /* ---------- Sticky nav state + scroll hide ---------- */
    const nav = document.querySelector('.nav');
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (!nav) return;
        nav.classList.toggle('scrolled', y > 20);
        if (y > 120 && y > lastY) nav.classList.add('hidden');
        else nav.classList.remove('hidden');
        lastY = y;
    }, { passive: true });

    /* ---------- Mobile menu ---------- */
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
        navLinks.querySelectorAll('a').forEach((a) => {
            a.addEventListener('click', () => {
                navLinks.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ---------- Scroll reveal ---------- */
    const revealTargets = document.querySelectorAll(
        '.section, .skill-card, .timeline-item, .about-card, .about-text, .contact-card'
    );
    revealTargets.forEach((el) => el.classList.add('reveal'));

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealTargets.forEach((el) => io.observe(el));
    } else {
        revealTargets.forEach((el) => el.classList.add('visible'));
    }

    /* ---------- Stat counter ---------- */
    const statNums = document.querySelectorAll('.stat-num');
    const animateCount = (el) => {
        const target = parseInt(el.dataset.target || '0', 10);
        if (Number.isNaN(target) || target === 0) {
            el.textContent = target;
            return;
        }
        const duration = 1400;
        const start = performance.now();
        const step = (now) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.floor(target * eased);
            if (t < 1) requestAnimationFrame(step);
            else el.textContent = target;
        };
        requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
        const statIo = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCount(entry.target);
                    statIo.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statNums.forEach((el) => statIo.observe(el));
    } else {
        statNums.forEach(animateCount);
    }

    /* ---------- Year ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- Matrix background ---------- */
    const canvas = document.getElementById('matrix-bg');
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (canvas && !prefersReduced) {
        const ctx = canvas.getContext('2d');
        const chars = '01{}<>/[]()=+-*&|!?;:_$#@AZUREDEVOPS'.split('');
        let columns = 0;
        let drops = [];
        const FONT_SIZE = 14;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = Math.floor(canvas.width / FONT_SIZE);
            drops = new Array(columns).fill(0).map(() => Math.random() * -50);
        }

        function draw() {
            ctx.fillStyle = 'rgba(6, 9, 18, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#64ffda';
            ctx.font = FONT_SIZE + 'px JetBrains Mono, monospace';
            for (let i = 0; i < drops.length; i++) {
                const ch = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(ch, i * FONT_SIZE, drops[i] * FONT_SIZE);
                if (drops[i] * FONT_SIZE > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += 0.5;
            }
        }

        let raf;
        function loop() {
            draw();
            raf = requestAnimationFrame(loop);
        }

        resize();
        loop();
        window.addEventListener('resize', () => {
            cancelAnimationFrame(raf);
            resize();
            loop();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) cancelAnimationFrame(raf);
            else loop();
        });
    }
})();
