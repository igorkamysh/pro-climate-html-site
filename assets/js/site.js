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
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                
                // EBITDA Counter
                const counter = document.getElementById('ebitda-num');
                if(counter && !counter.dataset.done) {
                    let c = 4;
                    const t = setInterval(() => {
                        c++; counter.innerText = c + 'x';
                        if(c >= 15) clearInterval(t);
                    }, 80);
                    counter.dataset.done = true;
                }

                // GWP Bars
                document.querySelectorAll('.gwp-bar').forEach(bar => {
                    bar.style.width = bar.dataset.width;
                });

                observer.unobserve(entry.target);
            }
        });
    });

    const darkBlock = document.querySelector('.dark-section');
    if(darkBlock) observer.observe(darkBlock);

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
});