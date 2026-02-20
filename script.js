const wrapper   = document.getElementById("parallaxContainer");
const sections  = document.querySelectorAll("section");
const dots      = document.querySelectorAll(".nav-dot");
document.documentElement.classList.add("js-enabled");

let statsPlayed     = false;
let isTouch         = window.matchMedia("(pointer: coarse)").matches;
let currentSection  = 0;
let isScrolling     = false;

/* =========================
    SET VH VARIABLE
========================= */
function setVH() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', () => {
    setVH();
    updateCurrentSection();
});

/* =========================
    UPDATE CURRENT SECTION
========================= */
function updateCurrentSection() {
    const scrollPos = wrapper.scrollTop;
    const sectionHeight = window.innerHeight;
    const index = Math.round(scrollPos / sectionHeight);
        
    if (index >= 0 && index < sections.length && index !== currentSection) {
        currentSection = index;
        dots.forEach(dot => dot.classList.remove("active"));
        dots[index]?.classList.add("active");
    }
}

/* =========================
    INTERSECTION REVEAL
========================= */
const observerOptions = {
    root: wrapper,
    threshold: 0.2,
    rootMargin: "0px 0px 0px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            if (entry.target.classList.contains("stat-number") && !entry.target.classList.contains("counted")) {
                entry.target.classList.add("counted");
                animateStat(entry.target);
            }
        } else {
            entry.target.classList.remove("visible");
            if (entry.target.classList.contains("stat-number")) {
                entry.target.classList.remove("counted");
                entry.target.textContent = "0";
            }
        }
    });
}, observerOptions);

// Observe elements
const observeElements = () => {
    document.querySelectorAll(`
    .reveal-text, .fade-in-up, .word-split, 
    .line-reveal, .stagger-children, 
    .stat-number, .char-reveal, .brand-fullname
    `).forEach(el => observer.observe(el));
};

/* =========================
INITIAL ANIMATIONS
========================= */
window.addEventListener("load", () => {
    setVH();    
    setTimeout(() => {
        document.querySelectorAll(".char-reveal, .brand-fullname").forEach(el => {
        el.classList.add("visible");
        });
    }, 300);
    observeElements();
    updateCurrentSection();
    
    // Initialize button click handlers
    initButtonHandlers();
});

/* =========================
    SCROLL HANDLER
========================= */
function handleScroll() {
    if (isScrolling) return;        
        window.requestAnimationFrame(() => {
        updateCurrentSection();
    });
}

wrapper.addEventListener("scroll", handleScroll, { passive: true });

/* =========================
   NAV DOT CLICK
========================= */
dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
        sections[i].scrollIntoView({ behavior: "smooth" });
    });
});

/* =========================
   BUTTON HANDLERS
========================= */
function initButtonHandlers() {
    const exploreBtn = document.querySelector('#heroButtons .btn-liquid');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (sections[4]) {
                sections[4].scrollIntoView({ behavior: "smooth" });
            }
        });
    }
}

/* =========================
   STATS COUNTER
========================= */
function animateStat(el) {
    const target    = +el.dataset.target;
    const duration  = isTouch ? 1000 : 1500;
    const start     = performance.now();

    function update(time) {
        const progress      = Math.min((time - start) / duration, 1);
        const easeProgress  = 1 - Math.pow(1 - progress, 3);
        el.textContent      = Math.floor(easeProgress * target);
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

/* =========================
   MOUSE PARALLAX (HERO) - Desktop only
========================= */
if (!isTouch) {
    let mouseTimeout;
    document.addEventListener("mousemove", (e) => {
    if (mouseTimeout) return;
                
        mouseTimeout = setTimeout(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        document.querySelectorAll(".float-anim, .float-anim-reverse").forEach((el) => {
            el.style.transform = `translate(${x}px, ${y}px)`;
        });
                    
        mouseTimeout = null;
    }, 16);
    });
}

/* =========================
   KEYBOARD NAV
========================= */
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && currentSection < sections.length - 1) {
        e.preventDefault();
        sections[currentSection + 1].scrollIntoView({ behavior: "smooth" });
    } else if (e.key === "ArrowUp" && currentSection > 0) {
        e.preventDefault();
        sections[currentSection - 1].scrollIntoView({ behavior: "smooth" });
    }
});

/* =========================
   VISIBILITY API
========================= */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.querySelectorAll('.pulse-glow, .float-anim, .float-anim-reverse').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        document.querySelectorAll('.pulse-glow, .float-anim, .float-anim-reverse').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});

// disable developer mode 
document.addEventListener('contextmenu', e => e.preventDefault());