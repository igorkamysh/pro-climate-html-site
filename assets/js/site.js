document.addEventListener("DOMContentLoaded", async () => {

    // --- 1. ЗАГРУЗКА PARTIALS (Header, Footer, CTA) ---
    async function loadPart(id, path) {
        const el = document.getElementById(id);
        if (!el) return;
        try {
            const res = await fetch(path);
            if (!res.ok) throw new Error("Error loading " + path);
            el.innerHTML = await res.text();
            
            // Re-execute Scripts (AmoCRM fix)
            el.querySelectorAll("script").forEach(old => {
                const n = document.createElement("script");
                Array.from(old.attributes).forEach(a => n.setAttribute(a.name, a.value));
                n.appendChild(document.createTextNode(old.innerHTML));
                old.parentNode.replaceChild(n, old);
            });
        } catch (err) { console.error(err); }
    }

    await Promise.all([
        loadPart("header-inj", "particles/header.html"),
        loadPart("footer-inj", "particles/footer.html"),
        loadPart("cta-inj", "particles/cta.html")
    ]);

    // --- 2. ACTIVE MENU ---
    const path = window.location.pathname;
    // Delay to ensure header is loaded
    setTimeout(() => {
        document.querySelectorAll('.nav a').forEach(link => {
            if(link.getAttribute('href') === path) link.classList.add('active');
        });
    }, 100);

    // --- 3. SCROLL SPY (Сайдбар) ---
    const sections = document.querySelectorAll("section");
    const navLi = document.querySelectorAll(".side-menu a");
    if(sections.length && navLi.length) {
        window.addEventListener("scroll", () => {
            let current = "";
            sections.forEach(sec => {
                if(pageYOffset >= sec.offsetTop - 300) current = sec.getAttribute("id");
            });
            navLi.forEach(a => {
                a.classList.remove("active");
                if(a.getAttribute("href").includes(current)) a.classList.add("active");
            });
        });
    }

    // --- 4. АНИМАЦИИ (Intersection Observer) ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');

                const counter = document.getElementById('ebitda-num');
                if(counter && entry.target.contains(counter) && !counter.dataset.done) {
                    let c = 5;
                    const t = setInterval(() => {
                        c++; counter.innerText = c + 'x';
                        if(c >= 12) clearInterval(t);
                    }, 120);
                    counter.dataset.done = true;
                }

                document.querySelectorAll('.gwp-bar').forEach(bar => { bar.style.width = bar.dataset.width; });

                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Live Sensor Animation
    const sensorBox = document.getElementById('sensor-viz');
    if(sensorBox) {
        for(let i=0; i<40; i++) {
            let b = document.createElement('div');
            b.className = 'sc-bar';
            b.style.height = Math.random() * 50 + 20 + '%';
            sensorBox.appendChild(b);
        }
        setInterval(() => {
            const bars = sensorBox.querySelectorAll('.sc-bar');
            for(let i=0; i<bars.length-1; i++) {
                bars[i].style.height = bars[i+1].style.height;
                bars[i].className = bars[i+1].className;
            }
            let last = bars[bars.length-1];
            if(Math.random() > 0.9) {
                last.style.height = '90%'; last.className = 'sc-bar alert';
            } else {
                last.style.height = Math.random() * 50 + 20 + '%'; last.className = 'sc-bar';
            }
        }, 150);
    }

    // --- 5. Аккордеоны ---
    document.querySelectorAll('[data-accordion]').forEach(acc => {
        acc.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const expanded = btn.getAttribute('aria-expanded') === 'true';
                acc.querySelectorAll('button').forEach(b => b.setAttribute('aria-expanded', 'false'));
                acc.querySelectorAll('.accordion-panel').forEach(p => p.classList.remove('open'));
                if(!expanded) {
                    btn.setAttribute('aria-expanded', 'true');
                    btn.nextElementSibling.classList.add('open');
                }
            });
        });
    });

    // --- 6. Табы ---
    document.querySelectorAll('.tab-buttons').forEach(group => {
        group.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const controls = btn.getAttribute('aria-controls');
                group.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', 'false'));
                btn.setAttribute('aria-selected', 'true');
                const panels = group.parentElement.querySelectorAll('.tab-panel');
                panels.forEach(p => p.classList.remove('active'));
                const activePanel = group.parentElement.querySelector('#' + controls);
                if(activePanel) activePanel.classList.add('active');
            });
        });
    });

    // --- 7. Калькуляторы ---
    const format = (val) => new Intl.NumberFormat('ru-RU').format(Math.round(val));
    document.querySelectorAll('[data-calculator]').forEach(calc => {
        const output = calc.querySelector('.calc-output');
        const type = calc.dataset.calculator;
        const handler = () => {
            let message = '';
            if(type === 'home') {
                const area = Number(calc.querySelector('#area')?.value || 0);
                const tariff = Number(calc.querySelector('#tariff')?.value || 0);
                const saving = Number(calc.querySelector('#saving')?.value || 0);
                const baseKwh = area * 1.1;
                const savedKwh = baseKwh * (saving/100);
                const savedRub = savedKwh * tariff;
                message = `Экономия: ${format(savedRub)} ₽ в месяц при снижении ${saving}% (≈ ${format(savedKwh)} кВт·ч).`;
            }
            if(type === 'vrf') {
                const area = Number(calc.querySelector('#vrf-area')?.value || 0);
                const tariff = Number(calc.querySelector('#vrf-tariff')?.value || 0);
                const split = Number(calc.querySelector('#vrf-split')?.value || 0);
                const baseKwh = area * 0.9;
                const savedKwh = baseKwh * (split/100) * 0.25;
                const savedRub = savedKwh * tariff;
                message = `Оценка экономии: ${format(savedRub)} ₽ в месяц за счет зонирования и точной автоматики.`;
            }
            if(type === 'chiller') {
                const load = Number(calc.querySelector('#ch-load')?.value || 0);
                const tariff = Number(calc.querySelector('#ch-tariff')?.value || 0);
                const hrs = Number(calc.querySelector('#ch-hrs')?.value || 0);
                const energy = load * hrs;
                const effect = energy * 0.08;
                const savedRub = effect * tariff;
                message = `Балансировка может дать экономию до ${format(savedRub)} ₽ (≈ ${format(effect)} кВт·ч) в месяц.`;
            }
            if(output && message) output.textContent = message;
        };
        calc.querySelectorAll('input, select').forEach(inp => inp.addEventListener('input', handler));
        handler();
    });

    // --- 8. Copy to clipboard ---
    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const text = btn.dataset.copy;
            try {
                await navigator.clipboard.writeText(text);
                btn.textContent = 'Скопировано';
                setTimeout(() => btn.textContent = text.includes('@') ? 'Скопировать e-mail' : 'Скопировать телефон', 1500);
            } catch(e) {
                btn.textContent = text;
            }
        });
    });
});
