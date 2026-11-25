(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Typed role rotation ---------- */
    const roles = [
        'Security Engineer — Detection & Response',
        'SIEM & XDR: Splunk · SentinelOne',
        'Security Logging Pipelines',
        'Kubernetes & Cloud Security',
        'DevSecOps & Azure Engineer',
        'GitOps & IaC Advocate',
        'Kubernetes Enthusiast',
        'iOS App Builder'
    ];
    const typedEl = document.getElementById('typed-role');
    if (typedEl && prefersReduced) {
        typedEl.textContent = roles[0];
    } else if (typedEl) {
        let roleIdx = 0;
        let charIdx = 0;
        let deleting = false;
        const TYPE_SPEED = 70;
        const DELETE_SPEED = 35;
        const HOLD = 1600;

        const tick = () => {
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
        };
        tick();
    }

    /* ---------- Swiss local time in the hero pill ---------- */
    const chTime = document.getElementById('ch-time');
    if (chTime) {
        const fmt = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich'
        });
        const updateTime = () => { chTime.textContent = fmt.format(new Date()); };
        updateTime();
        setInterval(updateTime, 30000);
    }

    /* ---------- Mobile menu ---------- */
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggle && navLinks) {
        const close = () => {
            navLinks.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        };
        toggle.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
        navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    }

    /* ---------- Scroll reveal ---------- */
    const revealTargets = document.querySelectorAll('[data-reveal]');
    // Stagger siblings within the same parent a little.
    const groups = new Map();
    revealTargets.forEach((el) => {
        const n = groups.get(el.parentElement) || 0;
        if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', (n * 80) + 'ms');
        groups.set(el.parentElement, n + 1);
    });

    if ('IntersectionObserver' in window && !prefersReduced) {
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

    /* ---------- Scroll-spy: highlight the nav link for the section in view ---------- */
    const spyLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
    if (spyLinks.length && 'IntersectionObserver' in window) {
        const linkFor = (id) => spyLinks.find((a) => a.getAttribute('href') === '#' + id);
        const spyIo = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const link = linkFor(entry.target.id);
                if (!link) return;
                spyLinks.forEach((a) => a.classList.remove('active'));
                link.classList.add('active');
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
        document.querySelectorAll('main section[id]').forEach((s) => spyIo.observe(s));
    }

    /* ---------- Stat counters ---------- */
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

    /* ---------- Stack filter ---------- */
    const tabs = document.querySelectorAll('.tabs .tab');
    const chips = document.querySelectorAll('.chips .chip');
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const filter = tab.dataset.filter;
            tabs.forEach((t) => {
                const on = t === tab;
                t.classList.toggle('on', on);
                t.setAttribute('aria-pressed', String(on));
            });
            let i = 0;
            chips.forEach((chip) => {
                const show = filter === 'all' || chip.dataset.group === filter;
                chip.classList.toggle('hide', !show);
                chip.classList.remove('pop');
                if (show && !prefersReduced) {
                    // Restart the entrance animation with a small stagger.
                    void chip.offsetWidth;
                    chip.style.animationDelay = (i++ * 30) + 'ms';
                    chip.classList.add('pop');
                }
            });
        });
    });

    /* ---------- Copy email ---------- */
    document.querySelectorAll('[data-copy]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(btn.dataset.copy);
                btn.textContent = 'copied';
            } catch (_) {
                btn.textContent = 'failed';
            }
            setTimeout(() => { btn.textContent = 'copy'; }, 1600);
        });
    });

    /* ---------- terraform apply (contact) ---------- */
    const tfForm = document.getElementById('tf-form');
    if (tfForm) {
        const input = document.getElementById('tf-input');
        const ask = document.getElementById('tf-ask');
        const err = document.getElementById('tf-err');
        const out = document.getElementById('tf-out');
        const done = document.getElementById('tf-done');
        const reset = document.getElementById('tf-reset');
        const timers = [];

        const line = (text, kind) => {
            const div = document.createElement('div');
            div.className = 'tl new ' + kind;
            div.textContent = text;
            out.appendChild(div);
        };

        const apply = () => {
            ask.hidden = true;
            const steps = [
                ['  Enter a value: yes', 'cmd'],
                [' ', 'out'],
                ['team.cloud_engineer["michal"]: Creating...', 'out'],
                ['team.cloud_engineer["michal"]: Still creating... [2s elapsed]', 'warn'],
                ['team.cloud_engineer["michal"]: Creation complete after 3s [id=hello]', 'ok'],
                [' ', 'out'],
                ['Apply complete! Resources: 1 added, 0 changed, 0 destroyed.', 'ok'],
                [' ', 'out'],
                ['Outputs:', 'out'],
                ['next_step = "send me an email"', 'cmd']
            ];
            steps.forEach(([text, kind], i) => {
                timers.push(setTimeout(() => line(text, kind), prefersReduced ? 0 : i * 260));
            });
            timers.push(setTimeout(() => { done.hidden = false; }, prefersReduced ? 0 : steps.length * 260));
        };

        tfForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // An empty field counts as accepting the "yes" placeholder.
            const val = input.value.trim().toLowerCase();
            if (val === 'yes' || val === '') {
                err.hidden = true;
                apply();
            } else {
                err.hidden = false;
                input.value = '';
            }
        });

        reset.addEventListener('click', () => {
            timers.splice(0).forEach(clearTimeout);
            out.textContent = '';
            done.hidden = true;
            err.hidden = true;
            input.value = '';
            ask.hidden = false;
        });
    }

    /* ---------- Year ---------- */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

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
