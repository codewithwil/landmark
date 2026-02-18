const wrapper = document.getElementById("parallaxContainer");
        const sections = document.querySelectorAll("section");
        const dots = document.querySelectorAll(".nav-dot");
        document.documentElement.classList.add("js-enabled");

        let statsPlayed = false;
        let isTouch = window.matchMedia("(pointer: coarse)").matches;

        /* =========================
           SET VH VARIABLE
        ========================= */
        function setVH() {
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }

        setVH();
        window.addEventListener('resize', setVH);

        /* =========================
           INTERSECTION REVEAL
        ========================= */
        const observerOptions = {
            root: wrapper,
            threshold: isTouch ? 0.1 : 0.15,
            rootMargin: isTouch ? "0px 0px -5% 0px" : "0px 0px -10% 0px"
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
                    // Keep hero text visible once shown
                    if (!entry.target.classList.contains("char-reveal") &&
                        !entry.target.classList.contains("brand-fullname") &&
                        !entry.target.classList.contains("stat-number")) {
                        entry.target.classList.remove("visible");
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
            
            // Trigger hero animations immediately
            setTimeout(() => {
                document.querySelectorAll(".char-reveal, .brand-fullname").forEach(el => {
                    el.classList.add("visible");
                });
            }, 300);

            observeElements();
        });

        /* =========================
           NAV DOT ACTIVE UPDATE
        ========================= */
        let currentSection = 0;
        let isScrolling = false;
        let scrollTimeout;

        wrapper.addEventListener("scroll", () => {
            if (isScrolling) return;
            
            isScrolling = true;
            
            window.requestAnimationFrame(() => {
                const scrollPos = wrapper.scrollTop;
                const windowHeight = window.innerHeight;
                const index = Math.round(scrollPos / windowHeight);

                if (index !== currentSection && index >= 0 && index < sections.length) {
                    currentSection = index;
                    dots.forEach(dot => dot.classList.remove("active"));
                    dots[index]?.classList.add("active");
                }

                // Throttle parallax updates
                handleParallax(scrollPos);
                
                isScrolling = false;
            });
        }, { passive: true });

        /* =========================
           PARALLAX SMOOTH
        ========================= */
        function handleParallax(scrollPos) {
            if (isTouch) return; // Disable parallax on touch devices for performance

            const backLayers = document.querySelectorAll(".layer-back");
            const midLayers = document.querySelectorAll(".layer-mid");

            backLayers.forEach(el => {
                el.style.transform = `translateY(${scrollPos * 0.4}px) translateZ(-2px) scale(3)`;
            });

            midLayers.forEach(el => {
                el.style.transform = `translateY(${scrollPos * 0.2}px) translateZ(-1px) scale(2)`;
            });
        }

        /* =========================
           NAV DOT CLICK
        ========================= */
        dots.forEach((dot, i) => {
            dot.addEventListener("click", () => {
                sections[i].scrollIntoView({ behavior: "smooth" });
            });
        });

        /* =========================
           STATS COUNTER
        ========================= */
        function animateStat(el) {
            const target = +el.dataset.target;
            const duration = isTouch ? 1000 : 1500;
            const start = performance.now();

            function update(time) {
                const progress = Math.min((time - start) / duration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                el.textContent = Math.floor(easeProgress * target);

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
           TOUCH HANDLING
        ========================= */
        let touchStartY = 0;
        let touchEndY = 0;

        wrapper.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        wrapper.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const threshold = 50;
            const diff = touchStartY - touchEndY;

            if (Math.abs(diff) > threshold) {
                if (diff > 0 && currentSection < sections.length - 1) {
                    // Swipe up - next section
                    sections[currentSection + 1].scrollIntoView({ behavior: "smooth" });
                } else if (diff < 0 && currentSection > 0) {
                    // Swipe down - previous section
                    sections[currentSection - 1].scrollIntoView({ behavior: "smooth" });
                }
            }
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
           VISIBILITY API - Pause when hidden
        ========================= */
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause expensive animations
                document.querySelectorAll('.pulse-glow, .float-anim, .float-anim-reverse').forEach(el => {
                    el.style.animationPlayState = 'paused';
                });
            } else {
                document.querySelectorAll('.pulse-glow, .float-anim, .float-anim-reverse').forEach(el => {
                    el.style.animationPlayState = 'running';
                });
            }
        });