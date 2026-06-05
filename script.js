(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Typed role rotation ---------- */
    const roles = [
        'DevOps & Cloud Engineer',
        'Azure Cloud Solutions Architect',
        'Cloud Security Engineer',
        'GitOps & IaC Advocate',
        'Kubernetes Enthusiast'
    ];
    const typedEl = document.getElementById('typed-role');
    if (typedEl && prefersReduced) {
        typedEl.textContent = roles[0];
    } else if (typedEl) {
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
        if (Number.isNaN(target) || target === 0 || prefersReduced) {
            el.textContent = Number.isNaN(target) ? '0' : target;
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
    if (canvas && !prefersReduced) {
        const ctx = canvas.getContext('2d');
        const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01{}<>/[]()=+-*$#@'.split('');
        let columns = 0;
        let drops = [];
        let prevChar = [];
        const FONT_SIZE = 14;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = Math.floor(canvas.width / FONT_SIZE);
            drops = new Array(columns).fill(0).map(() => Math.random() * -50);
            prevChar = new Array(columns).fill('');
        }

        function draw() {
            ctx.fillStyle = 'rgba(5, 8, 5, 0.06)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = FONT_SIZE + 'px JetBrains Mono, monospace';
            for (let i = 0; i < drops.length; i++) {
                const ch = chars[Math.floor(Math.random() * chars.length)];
                const x = i * FONT_SIZE;
                const y = drops[i] * FONT_SIZE;
                if (prevChar[i]) {
                    ctx.fillStyle = '#16a34a';
                    ctx.fillText(prevChar[i], x, y - FONT_SIZE);
                }
                ctx.fillStyle = '#dcfce7';
                ctx.fillText(ch, x, y);
                prevChar[i] = ch;
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                    prevChar[i] = '';
                }
                drops[i] += 1;
            }
        }

        let raf = null;
        function loop() {
            draw();
            raf = requestAnimationFrame(loop);
        }
        function start() {
            if (raf === null) loop();
        }
        function stop() {
            if (raf !== null) {
                cancelAnimationFrame(raf);
                raf = null;
            }
        }

        resize();
        start();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resize();
                if (!document.hidden) start();
            }, 150);
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stop();
            else start();
        });
    }

    /* ---------- Background music (YouTube, lazy-loaded on first interaction) ----------
       The YouTube IFrame API is heavy third-party JS. We do NOT load it on page load;
       it is injected only after the visitor's first interaction, keeping initial load
       (and Lighthouse/PageSpeed) free of any YouTube payload. */
    const audioToggle = document.getElementById('audio-toggle');
    const playerHost = document.getElementById('yt-audio-player');
    if (audioToggle && playerHost) {
        const VIDEO_ID = 'JlDBqvc7Mw0';
        let ytPlayer = null;
        let apiReady = false;
        let apiRequested = false;
        let hasStarted = false;
        let isMuted = false;

        window.onYouTubeIframeAPIReady = function () {
            ytPlayer = new YT.Player('yt-audio-player', {
                host: 'https://www.youtube-nocookie.com',
                videoId: VIDEO_ID,
                playerVars: {
                    autoplay: 0,
                    loop: 1,
                    playlist: VIDEO_ID,
                    controls: 0,
                    disablekb: 1,
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0,
                },
                events: {
                    onReady: () => {
                        apiReady = true;
                        startMusic();
                    },
                },
            });
        };

        const loadApi = () => {
            if (apiRequested) return;
            apiRequested = true;
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
        };

        const startMusic = () => {
            if (hasStarted) return;
            // First gesture: kick off the (async) API load, then bail — we play on onReady.
            if (!apiReady || !ytPlayer) {
                loadApi();
                return;
            }
            hasStarted = true;
            ytPlayer.playVideo();
            audioToggle.classList.add('playing');
            document.removeEventListener('click', startMusic);
            document.removeEventListener('keydown', startMusic);
            document.removeEventListener('touchstart', startMusic);
        };
        document.addEventListener('click', startMusic);
        document.addEventListener('keydown', startMusic);
        document.addEventListener('touchstart', startMusic);

        audioToggle.addEventListener('click', () => {
            // Before playback has begun, the toggle simply starts the music.
            if (!hasStarted) { startMusic(); return; }
            if (!ytPlayer || typeof ytPlayer.mute !== 'function') return;
            isMuted = !isMuted;
            if (isMuted) ytPlayer.mute();
            else ytPlayer.unmute();
            audioToggle.setAttribute('aria-pressed', String(isMuted));
            audioToggle.classList.toggle('muted', isMuted);
        });
    }
})();
