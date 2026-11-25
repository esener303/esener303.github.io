/* ==========================================================================
   Playground: worker bots, hanging/painter/sitter bots, interactive shell,
   big marquee, matrix rain and confetti.
   ========================================================================== */
(function () {
    'use strict';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (sel) => document.querySelector(sel);
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));

    const COLORS = ['#7CF29A', '#5CC8FF', '#C4A1FF', '#FFB86B', '#FF7A7A', '#7FE0D0'];
    const NAMES = ['kube', 'terra', 'bicep', 'helm', 'argo', 'flux', 'yaml', 'pipe', 'grafa', 'az', 'docker', 'ansi', 'aks', 'entra'];

    /* ---------- Bot artwork ---------- */
    function botSVG(opts) {
        opts = opts || {};
        const w = opts.w || 40;
        const roller = opts.roller
            ? '<g class="i-roller"><line x1="30" y1="34" x2="36" y2="44" stroke="#C9D1DB" stroke-width="1.6"/><rect x="32" y="43" width="10" height="5" rx="2" fill="var(--bot)"/></g>'
            : '';
        return '<svg class="bot-svg" viewBox="0 0 44 52" width="' + w + '" height="' + Math.round(w * 52 / 44) + '" aria-hidden="true" style="--bd:' + rand(0, 4).toFixed(2) + 's">' +
            '<g class="b-body">' +
                '<line x1="20" y1="8" x2="20" y2="3" stroke="#C9D1DB" stroke-width="1.6"/>' +
                '<circle class="b-ant" cx="20" cy="2.6" r="2.4"/>' +
                '<rect x="9" y="28" width="4" height="9" rx="2" class="b-limb b-arm b-arm-l"/>' +
                '<rect x="27" y="28" width="4" height="9" rx="2" class="b-limb b-arm b-arm-r"/>' +
                '<circle cx="20" cy="16" r="10" class="b-shell"/>' +
                '<rect x="12" y="11" width="16" height="9.5" rx="4.75" class="b-visor"/>' +
                '<g class="b-eyes"><rect class="b-eye" x="14.8" y="13.2" width="3" height="5" rx="1.2"/><rect class="b-eye" x="22.2" y="13.2" width="3" height="5" rx="1.2"/></g>' +
                '<rect x="13" y="27" width="14" height="12" rx="4" class="b-shell"/>' +
                '<circle cx="20" cy="33" r="1.8" class="b-led"/>' +
            '</g>' +
            '<rect x="15" y="38.5" width="4" height="9" rx="2" class="b-limb b-leg"/>' +
            '<rect x="21" y="38.5" width="4" height="9" rx="2" class="b-limb b-leg b-leg-2"/>' +
            '<g class="i-box"><rect x="27" y="29" width="12" height="10" rx="1.5" fill="#C9955B"/><rect x="32" y="29" width="2" height="10" fill="#E8C48F"/></g>' +
            '<g class="i-mug"><path class="steam" d="M31 28c0-2 2-2 2-4M34 28c0-2 2-2 2-4" fill="none" stroke="#8B95A3" stroke-width="1" stroke-linecap="round"/><rect x="29" y="30" width="8" height="8" rx="1.5" fill="#E7ECF2"/><path d="M37 32h1.5a2 2 0 0 1 0 4H37" fill="none" stroke="#E7ECF2" stroke-width="1.5"/></g>' +
            roller +
            '</svg>';
    }
    const CHUTE = '<svg class="chute" viewBox="0 0 44 30" width="44" height="30" aria-hidden="true"><path d="M2 15 Q22 -9 42 15 Q32 11 22 15 Q12 11 2 15Z" fill="var(--bot)" opacity=".9"/><path d="M3 15 L17 30 M41 15 L27 30 M22 15 L22 30" stroke="#C9D1DB" stroke-width="1" fill="none"/></svg>';

    // Fill static placeholders
    document.querySelectorAll('[data-bot="hang"]').forEach((el) => { el.outerHTML = botSVG({ w: 28 }); });
    document.querySelectorAll('[data-bot="sit"]').forEach((el) => { el.outerHTML = botSVG({ w: 38 }); });

    /* ---------- Speech bubbles ---------- */
    function sayOn(el, text, ms) {
        const bubble = el.querySelector('.bubble');
        if (!bubble) return;
        bubble.textContent = text;
        bubble.classList.add('show');
        clearTimeout(bubble._t);
        bubble._t = setTimeout(() => bubble.classList.remove('show'), ms || 2200);
    }

    /* ---------- Confetti ---------- */
    function party() {
        if (reduced) return;
        const box = document.createElement('div');
        box.className = 'confetti';
        for (let i = 0; i < 90; i++) {
            const s = document.createElement('span');
            s.style.left = rand(0, 100) + 'vw';
            s.style.background = pick(COLORS);
            s.style.animationDuration = rand(1.8, 3.2) + 's';
            s.style.animationDelay = rand(0, 0.5) + 's';
            s.style.transform = 'rotate(' + rand(0, 360) + 'deg)';
            box.appendChild(s);
        }
        document.body.appendChild(box);
        setTimeout(() => box.remove(), 4200);
    }

    /* ======================================================================
       Worker bots (crew)
       ====================================================================== */
    const layer = $('#bots');
    const countEl = $('#crew-count');
    const BOT_W = 40, BOT_H = 47;
    const MAX = () => (window.innerWidth < 640 ? 6 : 12);
    const LINES = [
        'deploying to prod…', 'who pushed to main?', 'terraform apply ✔', 'it works on my cluster',
        'rollback? never heard of it', 'LGTM', 'yaml all the way down', 'az login… again',
        'pipeline green ✔', 'coffee?', '0 manual deploys', 'kubectl get vibes', 'is it Friday? no deploys',
        'scaling to zero…', 'who touched the state file?', 'helm upgrade --install', 'drink water, ship code'
    ];
    const GRAB = ['put me down!', 'whoa!', "I'm a pod, not a ball!", 'rescheduling…', 'hey!', 'node drain?!'];
    const OUCH = ['ouch', "I'm fine!", 'was that a rollback?', 'self-healing…', 'CrashLoopBackOff', '10/10 landing'];

    const bots = [];
    let W = window.innerWidth, H = window.innerHeight;
    let coffeeUntil = 0, panicUntil = 0;
    const born = Date.now();

    function floorY() { return H - BOT_H - 4; }

    function setMode(b, m) {
        if (b.mode === m) return;
        b.mode = m;
        b.el.dataset.mode = m;
    }
    function setDir(b, d) {
        if (b.dir === d) return;
        b.dir = d;
        b.el.classList.toggle('flip', d < 0);
    }
    function say(b, text, ms) {
        const bub = b.el.querySelector('.bubble');
        bub.classList.toggle('edge-l', b.x < 90);
        bub.classList.toggle('edge-r', b.x > W - 130);
        sayOn(b.el, text, ms);
    }
    function jump(b) {
        const inner = b.el.querySelector('.bot-in');
        inner.classList.remove('jump');
        void inner.offsetWidth;
        inner.classList.add('jump');
    }

    function render(b) {
        b.el.style.transform = 'translate3d(' + b.x.toFixed(1) + 'px,' + b.y.toFixed(1) + 'px,0)';
    }

    function makeBot(opts) {
        const color = opts.color || pick(COLORS);
        const el = document.createElement('div');
        el.className = 'bot';
        el.style.setProperty('--bot', color);
        const carry = Math.random();
        if (carry < 0.3) el.classList.add('carry-box');
        else if (carry < 0.45) el.classList.add('carry-mug');
        el.innerHTML = '<span class="bubble mono"></span><div class="bot-in">' + CHUTE + botSVG() + '</div>';
        layer.appendChild(el);

        const used = bots.map((x) => x.name);
        const name = NAMES.find((n) => !used.includes(n)) || ('w' + bots.length);
        const b = {
            el, name, color,
            x: opts.x != null ? opts.x : rand(10, W - 60),
            y: opts.y != null ? opts.y : floorY(),
            vx: 0, vy: 0, dir: 0, mode: '',
            speed: rand(22, 42),
            timer: rand(2, 8),
            born: Date.now()
        };
        setDir(b, Math.random() < 0.5 ? -1 : 1);
        setMode(b, opts.mode || 'walk');
        bots.push(b);
        render(b);
        attachDrag(b);
        updateCount();
        return b;
    }

    function updateCount() { if (countEl) countEl.textContent = bots.length; }

    /* --- drag & throw --- */
    function attachDrag(b) {
        let start = null, last = null, offX = 0, offY = 0, moved = false;
        b.el.addEventListener('pointerdown', (e) => {
            if (reduced) { say(b, pick(LINES)); return; }
            e.preventDefault();
            b.el.setPointerCapture(e.pointerId);
            start = { x: e.clientX, y: e.clientY };
            last = { x: e.clientX, y: e.clientY, t: performance.now() };
            offX = e.clientX - b.x;
            offY = e.clientY - b.y;
            moved = false;
            b.prevMode = b.mode;
        });
        b.el.addEventListener('pointermove', (e) => {
            if (!start) return;
            if (!moved && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 5) return;
            if (!moved) { moved = true; setMode(b, 'drag'); say(b, pick(GRAB), 1400); }
            const now = performance.now();
            const dt = Math.max(1, now - last.t) / 1000;
            b.vx = b.vx * 0.5 + ((e.clientX - last.x) / dt) * 0.5;
            b.vy = b.vy * 0.5 + ((e.clientY - last.y) / dt) * 0.5;
            last = { x: e.clientX, y: e.clientY, t: now };
            b.x = e.clientX - offX;
            b.y = e.clientY - offY;
            render(b);
        });
        const up = () => {
            if (!start) return;
            start = null;
            if (moved) {
                b.vx = Math.max(-1600, Math.min(1600, b.vx));
                b.vy = Math.max(-1600, Math.min(1600, b.vy));
                setMode(b, 'fall');
            } else {
                b.vx = b.vy = 0;
                jump(b);
                say(b, pick(LINES));
            }
        };
        b.el.addEventListener('pointerup', up);
        b.el.addEventListener('pointercancel', up);
    }

    /* --- simulation --- */
    function stepBot(b, dt, now) {
        const floor = floorY();
        const panicking = now < panicUntil;
        switch (b.mode) {
            case 'walk': {
                const sp = panicking ? b.speed * 5 : b.speed;
                b.x += b.dir * sp * dt;
                if (b.x < 4) { b.x = 4; setDir(b, 1); }
                if (b.x > W - BOT_W - 4) { b.x = W - BOT_W - 4; setDir(b, -1); }
                b.y = floor;
                b.timer -= dt;
                if (b.timer <= 0 && !panicking) { setMode(b, 'idle'); b.timer = rand(1, 4); }
                break;
            }
            case 'idle':
                b.y = floor;
                b.timer -= dt;
                if (b.timer <= 0) {
                    setMode(b, 'walk');
                    setDir(b, Math.random() < 0.5 ? -1 : 1);
                    b.timer = rand(3, 10);
                }
                break;
            case 'coffee':
                b.y = floor;
                if (now > coffeeUntil) {
                    b.el.classList.remove('coffee');
                    setMode(b, 'walk');
                    if (Math.random() < 0.4) say(b, 'back to work!', 1600);
                }
                break;
            case 'para':
                b.vy = Math.min(b.vy + 300 * dt, 75);
                b.sway = (b.sway || 0) + dt;
                b.x += Math.sin(b.sway * 1.6) * 22 * dt;
                b.y += b.vy * dt;
                if (b.y >= floor) {
                    b.y = floor;
                    b.vy = 0;
                    setMode(b, 'walk');
                    say(b, pick(['reporting for duty!', 'hello, cluster!', 'where do I sign?', 'ready to ship']));
                }
                break;
            case 'fall':
                b.vy += 2200 * dt;
                b.vx *= Math.pow(0.6, dt);
                b.x += b.vx * dt;
                b.y += b.vy * dt;
                if (b.x < 0) { b.x = 0; b.vx = -b.vx * 0.5; }
                if (b.x > W - BOT_W) { b.x = W - BOT_W; b.vx = -b.vx * 0.5; }
                if (b.y >= floor) {
                    b.y = floor;
                    if (b.vy > 520) {
                        b.vy = -b.vy * 0.32;
                        b.vx *= 0.6;
                    } else {
                        b.vy = 0;
                        b.vx = 0;
                        setMode(b, now < coffeeUntil ? 'coffee' : 'walk');
                        b.timer = rand(2, 6);
                        if (Math.random() < 0.8) say(b, pick(OUCH), 1600);
                    }
                }
                break;
            default:
                break; // drag: positioned by pointer
        }
    }

    let rafId = null, lastT = 0, chatterT = rand(4, 7);
    function loop(t) {
        const dt = Math.min(0.05, (t - (lastT || t)) / 1000);
        lastT = t;
        const now = Date.now();
        for (const b of bots) {
            stepBot(b, dt, now);
            if (b.mode !== 'drag') render(b);
        }
        chatterT -= dt;
        if (chatterT <= 0) {
            chatterT = rand(6, 11);
            const walkers = bots.filter((b) => b.mode === 'walk' || b.mode === 'idle');
            if (walkers.length) say(pick(walkers), pick(LINES));
        }
        rafId = requestAnimationFrame(loop);
    }
    function start() { if (rafId === null && !reduced) { lastT = 0; rafId = requestAnimationFrame(loop); } }
    function stop() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } }

    function hire() {
        if (bots.length >= MAX()) return false;
        if (reduced) { makeBot({}); return true; }
        const b = makeBot({ x: rand(20, W - 80), y: -70, mode: 'para' });
        b.vy = 20;
        return true;
    }
    function coffee() {
        coffeeUntil = Date.now() + 7000;
        bots.forEach((b, i) => {
            if (b.mode === 'drag' || b.mode === 'fall' || b.mode === 'para') return;
            b.el.classList.add('coffee');
            setMode(b, 'coffee');
            if (i % 2 === 0) setTimeout(() => say(b, pick(['☕ ahh', 'brb', 'standup at 10?', 'decaf? never'])), i * 200);
        });
    }
    function cheer() {
        bots.forEach((b, i) => setTimeout(() => {
            jump(b);
            if (i % 2 === 0) say(b, pick(['shipped! 🚀', 'all green!', 'woohoo!', 'prod is happy']), 1800);
        }, i * 90));
    }
    function panic(ms) {
        panicUntil = Date.now() + ms;
        document.body.classList.add('panic');
        bots.forEach((b) => {
            if (b.mode === 'idle' || b.mode === 'coffee') { b.el.classList.remove('coffee'); setMode(b, 'walk'); }
            say(b, pick(['AAAAA', 'not prod!!', 'evacuate!', 'who ran that?!', 'save the state file!']), ms);
        });
        setTimeout(() => document.body.classList.remove('panic'), ms);
    }

    window.Crew = {
        hire, coffee, cheer, panic, party,
        count: () => bots.length,
        list: () => bots.map((b) => ({
            name: b.name,
            status: b.mode === 'coffee' ? 'OnBreak' : b.mode === 'drag' ? 'Evicting' : b.mode === 'fall' ? 'Pending' : b.mode === 'para' ? 'ContainerCreating' : 'Running',
            age: Math.max(1, Math.round((Date.now() - b.born) / 1000))
        }))
    };

    if (layer) {
        const initial = window.innerWidth < 640 ? 3 : 6;
        for (let i = 0; i < initial; i++) makeBot({ x: ((i + 0.5) / initial) * (W - 60) + rand(-20, 20) });
        start();

        let resizeT;
        window.addEventListener('resize', () => {
            clearTimeout(resizeT);
            resizeT = setTimeout(() => {
                W = window.innerWidth;
                H = window.innerHeight;
                bots.forEach((b) => { b.x = Math.min(b.x, W - BOT_W - 4); if (b.mode !== 'para') b.y = Math.min(b.y, floorY()); render(b); });
            }, 120);
        });
        document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

        const hireBtn = $('#crew-hire');
        const coffeeBtn = $('#crew-coffee');
        if (hireBtn) hireBtn.addEventListener('click', () => {
            if (!hire()) {
                hireBtn.textContent = 'quota reached';
                setTimeout(() => { hireBtn.textContent = '+ hire'; }, 1500);
            }
        });
        if (coffeeBtn) coffeeBtn.addEventListener('click', coffee);
    }

    /* ======================================================================
       Hanging bot (on the dot) & terminal sitter
       ====================================================================== */
    const hang = $('.hang');
    if (hang) {
        hang.addEventListener('click', () => {
            hang.classList.remove('swing');
            void hang.offsetWidth;
            hang.classList.add('swing');
            sayOn(hang, pick(['wheee!', 'hanging in there', 'zero-downtime swing', 'cable management!']), 1800);
        });
    }

    const sitter = $('.sitter');
    if (sitter) {
        sitter.addEventListener('click', () => {
            sitter.classList.remove('hop');
            void sitter.offsetWidth;
            sitter.classList.add('hop');
            sayOn(sitter, pick(["hi! type 'help'", 'I guard this terminal', "try 'deploy'", "psst… try 'sudo'", 'nice cursor']), 2200);
        });
        if (!reduced) {
            let pending = false, mx = 0, my = 0;
            window.addEventListener('pointermove', (e) => {
                mx = e.clientX; my = e.clientY;
                if (pending) return;
                pending = true;
                requestAnimationFrame(() => {
                    pending = false;
                    const r = sitter.getBoundingClientRect();
                    const dx = mx - (r.left + r.width / 2);
                    const dy = my - (r.top + r.height * 0.3);
                    const d = Math.hypot(dx, dy) || 1;
                    sitter.style.setProperty('--ex', (dx / d * 1.8).toFixed(2) + 'px');
                    sitter.style.setProperty('--ey', (dy / d * 1.4).toFixed(2) + 'px');
                });
            }, { passive: true });
        }
    }

    /* ======================================================================
       Painter bots under section titles
       ====================================================================== */
    const painterColors = ['#7CF29A', '#5CC8FF', '#C4A1FF', '#FFB86B', '#FF7A7A'];
    const painters = [];
    document.querySelectorAll('.sec-title').forEach((h, i) => {
        const p = document.createElement('span');
        p.className = 'painter';
        p.setAttribute('aria-hidden', 'true');
        p.style.setProperty('--bot', painterColors[i % painterColors.length]);
        p.innerHTML = '<span class="paint-line"></span><span class="roller">' + botSVG({ w: 26, roller: true }) + '</span>';
        h.insertAdjacentElement('afterend', p);
        painters.push(p);
    });
    if ('IntersectionObserver' in window && !reduced) {
        const pio = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) { e.target.classList.add('go'); pio.unobserve(e.target); }
            });
        }, { threshold: 1, rootMargin: '0px 0px -15% 0px' });
        painters.forEach((p) => pio.observe(p));
    } else {
        painters.forEach((p) => p.classList.add('go', 'instant'));
    }

    /* ======================================================================
       Big marquee
       ====================================================================== */
    const vmTrack = $('#vm-track');
    if (vmTrack) {
        const words = [
            ['Splunk', '#FF9AD5'], ['SentinelOne', '#C4A1FF'], ['Fluent Bit', '#7FE0D0'], ['Azure Arc', '#5CC8FF'],
            ['Azure', '#5CC8FF'], ['Terraform', '#C4A1FF'], ['Kubernetes', '#5CC8FF'], ['Bicep', '#FFB86B'],
            ['GitHub Actions', '#7CF29A'], ['ArgoCD', '#FF7A7A'], ['Docker', '#5CC8FF'], ['Helm', '#7FE0D0'],
            ['Grafana', '#FFB86B'], ['PowerShell', '#5CC8FF'], ['Python', '#FFB86B'], ['Ansible', '#FF7A7A'],
            ['Azure DevOps', '#7CF29A'], ['Prometheus', '#FF7A7A'], ['Datadog', '#C4A1FF'], ['SonarQube', '#5CC8FF'],
            ['Keycloak', '#FFB86B'], ['Swift', '#FF7A7A'], ['Bash', '#7CF29A'], ['YAML', '#C4A1FF']
        ];
        const html = words.map(([w, c]) => '<span class="vm-word" style="--c:' + c + '">' + w + '</span><span class="vm-sep">/</span>').join('');
        vmTrack.innerHTML = html + html;
        const els = Array.from(vmTrack.querySelectorAll('.vm-word'));
        let lit = null, visible = false;
        const light = () => {
            if (!visible) return;
            const cx = window.innerWidth / 2;
            let best = null, bestD = Infinity;
            for (const el of els) {
                const r = el.getBoundingClientRect();
                const d = Math.abs(r.left + r.width / 2 - cx);
                if (d < bestD) { bestD = d; best = el; }
            }
            if (best !== lit) {
                if (lit) lit.classList.remove('lit');
                best.classList.add('lit');
                lit = best;
            }
        };
        if ('IntersectionObserver' in window) {
            new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) light(); }).observe(vmTrack);
        } else {
            visible = true;
        }
        setInterval(light, reduced ? 100000 : 700);
    }

    /* ======================================================================
       Matrix rain (toggled from the shell)
       ====================================================================== */
    const matrix = (function () {
        const canvas = $('#matrix-bg');
        if (!canvas) return { toggle: () => false };
        const ctx = canvas.getContext('2d');
        const chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01{}<>/[]()=+-*$#@'.split('');
        const FS = 14;
        let drops = [], prev = [], raf = null, on = false;
        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctx.font = FS + 'px JetBrains Mono, monospace';
            const cols = Math.floor(canvas.width / FS);
            drops = new Array(cols).fill(0).map(() => Math.random() * -50);
            prev = new Array(cols).fill('');
        }
        function draw() {
            ctx.fillStyle = 'rgba(10, 12, 15, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < drops.length; i++) {
                const ch = chars[(Math.random() * chars.length) | 0];
                const x = i * FS, y = drops[i] * FS;
                if (prev[i]) { ctx.fillStyle = '#16a34a'; ctx.fillText(prev[i], x, y - FS); }
                ctx.fillStyle = '#dcfce7';
                ctx.fillText(ch, x, y);
                prev[i] = ch;
                if (y > canvas.height && Math.random() > 0.975) { drops[i] = 0; prev[i] = ''; }
                drops[i] += 1;
            }
            raf = requestAnimationFrame(draw);
        }
        window.addEventListener('resize', () => { if (on) resize(); });
        document.addEventListener('visibilitychange', () => {
            if (!on) return;
            if (document.hidden) { cancelAnimationFrame(raf); raf = null; } else if (raf === null) draw();
        });
        return {
            toggle() {
                on = !on;
                canvas.hidden = !on;
                if (on) { resize(); if (!reduced) draw(); }
                else { cancelAnimationFrame(raf); raf = null; }
                return on;
            }
        };
    })();

    /* ======================================================================
       Interactive shell
       ====================================================================== */
    const out = $('#shell-out');
    const form = $('#shell-form');
    const input = $('#shell-in');
    const body = $('#shell-body');
    if (!out || !form || !input || !body) return;

    let busy = false;
    const history = [];
    let hIdx = 0;

    function print(text, cls) {
        const d = document.createElement('div');
        d.className = 'tl new ' + (cls || 'out');
        d.textContent = text;
        out.appendChild(d);
        body.scrollTop = body.scrollHeight;
    }
    async function slow(lines, ms) {
        for (const [t, c] of lines) { print(t, c); await wait(ms); }
    }
    const fmtUp = () => {
        const s = Math.round((Date.now() - born) / 1000);
        return s < 60 ? s + 's' : Math.floor(s / 60) + 'm ' + (s % 60) + 's';
    };
    const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); };

    const HELP = [
        ['available commands:', 'ok'],
        ['  whoami            who is this guy', 'out'],
        ['  neofetch          system info, but it is me', 'out'],
        ['  cat profile.json  the structured version', 'out'],
        ['  projects          things I shipped', 'out'],
        ['  deploy            run the pipeline', 'out'],
        ['  kubectl get pods  inspect the worker bots', 'out'],
        ['  hire / coffee     manage the crew', 'out'],
        ['  matrix            toggle the rain', 'out'],
        ['  contact           how to reach me', 'out'],
        ['  cd <section>      jump to about, projects, experience, stack, certs, contact', 'out'],
        ['  clear             clean slate', 'out'],
        ['tip: drag a worker bot and throw it. they love that.', 'warn']
    ];
    const PROFILE = [
        '{',
        '  "name": "Michał",',
        '  "role": "Security Engineer — Detection & Response",',
        '  "base": "Zürich, CH",',
        '  "experience": "10+ years · FINMA-regulated financial services",',
        '  "detection": ["Splunk SIEM", "SentinelOne XDR", "Fluent Bit", "Azure Arc", "Log Analytics"],',
        '  "focus": ["Security Logging", "Incident Response", "Kubernetes Security", "IAM & Secrets", "IaC"],',
        '  "certs": ["AZ-400", "AZ-104", "Cyber & Information Security", "ITIL v3"],',
        '  "approach": "Bridging technical delivery with business outcomes",',
        '  "coffee": true',
        '}'
    ];

    const commands = {
        help: () => slow(HELP, 25),
        whoami: () => print('Michał Demczyszak — Security Engineer, Detection & Response (Zürich)', 'ok'),
        'cat profile.json': () => slow(PROFILE.map((l) => [l, 'ok']), 40),
        neofetch: () => slow([
            ['visitor@michaldemczyszak.com', 'ok'],
            ['----------------------------', 'out'],
            ['role     Security Engineer · Detection & Response', 'out'],
            ['base     Zürich, Switzerland', 'out'],
            ['siem     Splunk · SentinelOne XDR', 'out'],
            ['logs     Fluentd, Fluent Bit, Azure Arc, Log Analytics', 'out'],
            ['cloud    Azure (mostly), AKS, Entra ID', 'out'],
            ['iac      Terraform, Bicep, Ansible', 'out'],
            ['ci/cd    GitHub Actions, Azure DevOps, ArgoCD', 'out'],
            ['apps     Alps Summits, Abfahrtli (iOS)', 'out'],
            ['agency   Helvetia Pixel', 'out'],
            ['shell    zsh (simulated, lovingly)', 'out'],
            ['uptime   ' + fmtUp(), 'out'],
            ['crew     ' + window.Crew.count() + ' worker bots', 'out']
        ], 35),
        projects: () => slow([
            ['alps-summits/    iOS app for exploring the Alps', 'out'],
            ['abfahrtli/       live Swiss departures + widgets', 'out'],
            ['helvetia-pixel/  digital agency, Lenzburg CH', 'out'],
            ["→ cd projects to see them", 'ok']
        ], 40),
        ls: () => print('about/  projects/  experience/  stack/  certs/  contact/  profile.json', 'out'),
        deploy: async () => {
            print('triggering pipeline on main…', 'warn');
            await wait(400);
            const stages = [['build', '12s'], ['test', '31s'], ['security scan', '8s'], ['terraform plan', '6s'], ['deploy → production', '19s']];
            for (const [s, t] of stages) {
                print('  ▸ ' + s.padEnd(22, '.') + ' running', 'out');
                await wait(420);
                out.lastChild.textContent = '  ✓ ' + s.padEnd(22, '.') + ' ' + t;
                out.lastChild.className = 'tl ok';
            }
            print('all green. zero downtime. crew is celebrating.', 'ok');
            window.Crew.cheer();
            party();
        },
        'kubectl get pods': () => {
            const rows = window.Crew.list();
            print('NAME            READY   STATUS              AGE', 'cmd');
            rows.forEach((r) => print(('worker-' + r.name).padEnd(16) + '1/1     ' + r.status.padEnd(20) + r.age + 's', r.status === 'Running' ? 'ok' : 'warn'));
            if (!rows.length) print('No resources found in default namespace.', 'warn');
        },
        hire: () => {
            const ok = window.Crew.hire();
            print(ok ? 'worker incoming — look up!' : 'quota reached: the cluster is full', ok ? 'ok' : 'err');
        },
        'kubectl scale workers --replicas=+1': () => commands.hire(),
        coffee: () => { window.Crew.coffee(); print('coffee break started for all workers ☕', 'ok'); },
        matrix: () => print(matrix.toggle() ? 'wake up, visitor… the matrix has you. (type matrix again to exit)' : 'back to reality.', 'ok'),
        contact: () => slow([
            ['email    → esener303@gmail.com', 'out'],
            ['linkedin → linkedin.com/in/michaldemczyszak', 'out'],
            ['github   → github.com/esener303', 'out'],
            ['or: cd contact', 'ok']
        ], 40),
        date: () => print(new Date().toLocaleString('en-GB', { timeZone: 'Europe/Zurich' }) + ' (Europe/Zurich)', 'out'),
        uptime: () => print('up ' + fmtUp() + ', 1 visitor, ' + window.Crew.count() + ' workers, load average: chill', 'out'),
        clear: () => { out.textContent = ''; },
        history: () => history.forEach((h, i) => print(String(i + 1).padStart(4) + '  ' + h, 'out')),
        exit: () => print("there is no escape. (try 'contact')", 'warn'),
        'git log': () => { print('opening 03 / experience…', 'ok'); scrollTo('experience'); },
        'self-destruct': async () => {
            print('⚠ self-destruct sequence initiated', 'err');
            for (const n of ['3', '2', '1']) { await wait(600); print('  ' + n + '…', 'err'); }
            window.Crew.panic(3200);
            await wait(3300);
            print('just kidding. immutable infra — nothing was harmed.', 'ok');
        }
    };
    commands['./self-destruct.sh'] = commands['self-destruct'];
    commands['terraform destroy'] = commands['self-destruct'];

    async function run(raw) {
        const cmd = raw.trim().replace(/\s+/g, ' ');
        if (!cmd || busy) return;
        busy = true;
        history.push(cmd);
        hIdx = history.length;
        print('visitor@prod:~$ ' + cmd, 'cmd');
        const lower = cmd.toLowerCase();
        try {
            if (commands[lower]) {
                await commands[lower]();
            } else if (lower.startsWith('sudo')) {
                await slow([['[sudo] password for visitor: ********', 'out'], ['✓ access granted. hiring michał… see 05 / contact', 'ok']], 500);
                party();
                window.Crew.cheer();
            } else if (lower.startsWith('rm -rf')) {
                print('nice try. root filesystem is read-only — immutable infra, remember?', 'err');
            } else if (lower.startsWith('cd ')) {
                const target = lower.slice(3).replace(/[./~]/g, '');
                if (['about', 'projects', 'experience', 'stack', 'certs', 'contact'].includes(target)) { print('→ ' + target, 'ok'); scrollTo(target); }
                else print('cd: no such file or directory: ' + target, 'err');
            } else if (lower.startsWith('echo ')) {
                print(cmd.slice(5), 'out');
            } else if (lower.startsWith('kubectl')) {
                print("try 'kubectl get pods'", 'warn');
            } else {
                print('zsh: command not found: ' + cmd + ". try 'help'", 'err');
            }
        } finally {
            busy = false;
            body.scrollTop = body.scrollHeight;
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = input.value;
        input.value = '';
        run(v);
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' && history.length) {
            e.preventDefault();
            hIdx = Math.max(0, hIdx - 1);
            input.value = history[hIdx];
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            hIdx = Math.min(history.length, hIdx + 1);
            input.value = history[hIdx] || '';
        }
    });
    body.addEventListener('click', () => {
        if (!window.getSelection().toString()) input.focus({ preventScroll: true });
    });
    document.querySelectorAll('[data-cmd]').forEach((btn) => btn.addEventListener('click', () => run(btn.dataset.cmd)));

    // Boot sequence
    (async function boot() {
        busy = true;
        const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Europe/Zurich' }).format(new Date()));
        const greet = hour < 12 ? 'good morning' : hour < 18 ? 'good afternoon' : 'good evening';
        await wait(700);
        await slow([
            ['$ ssh visitor@michaldemczyszak.com', 'cmd'],
            ['authenticating with key "curiosity"… ok', 'out'],
            [greet + '. no deploys on a Friday… unless?', 'out'],
            ['✓ az account show: subscription "production"', 'ok'],
            ['✓ pipeline green · ' + window.Crew.count() + ' tiny workers on shift', 'ok'],
            ["type 'help', tap a command below — or grab a worker bot and throw it.", 'warn']
        ], 260);
        busy = false;
    })();
})();
