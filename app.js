document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 1.b Theme: Dark/Light mode toggle
    const storageKey = 'prefers-dark';
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIconId = 'theme-icon';
    const themeLabelId = 'theme-label';

    function applyTheme(isDark) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        if (themeToggleBtn) {
            themeToggleBtn.setAttribute('aria-pressed', String(isDark));
            themeToggleBtn.setAttribute('aria-label', isDark ? 'Désactiver le mode sombre' : 'Activer le mode sombre');
            const iconEl = document.getElementById(themeIconId);
            const labelEl = document.getElementById(themeLabelId);
            if (iconEl) iconEl.textContent = isDark ? '🌙' : '☀️';
            if (labelEl) labelEl.textContent = isDark ? 'Sombre' : 'Clair';
        }
    }

    function readSystemPref() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    (function initTheme() {
        try {
            const stored = localStorage.getItem(storageKey);
            let isDark;
            if (stored === 'true' || stored === 'false') {
                isDark = stored === 'true';
            } else {
                isDark = readSystemPref();
            }
            applyTheme(isDark);

            if (themeToggleBtn) {
                themeToggleBtn.addEventListener('click', () => {
                    const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
                    const newIsDark = !currentlyDark;
                    applyTheme(newIsDark);
                    try { localStorage.setItem(storageKey, String(newIsDark)); } catch(e){}
                });
            }

            if (window.matchMedia) {
                const mq = window.matchMedia('(prefers-color-scheme: dark)');
                const onChange = e => {
                    const stored = localStorage.getItem(storageKey);
                    if (stored === null) {
                        applyTheme(e.matches);
                    }
                };
                if (typeof mq.addEventListener === 'function') {
                    mq.addEventListener('change', onChange);
                } else if (typeof mq.addListener === 'function') {
                    mq.addListener(onChange);
                }
            }
        } catch (e) {}
    })();

    // 2. Navbar Scroll Effects
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const menuIcon = document.getElementById('menu-icon');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('mobile-open');
            const isOpen = navMenu.classList.contains('mobile-open');
            
            // Toggle menu/close icon
            if (isOpen) {
                menuIcon.setAttribute('data-lucide', 'x');
            } else {
                menuIcon.setAttribute('data-lucide', 'menu');
            }
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });

        // Close menu when a link is clicked
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('mobile-open');
                menuIcon.setAttribute('data-lucide', 'menu');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        });
    }

    // 4. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animates only once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Triggers slightly before element enters view
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });

    // 5. Active Link Highlighting on Scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const activeLinkObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.4, // Section is considered active when 40% of it is visible
        rootMargin: '-80px 0px -20% 0px' // Adjust for navbar height
    });

    sections.forEach(section => {
        activeLinkObserver.observe(section);
    });

    // 6. Interactive 3D Card Tilt Effect
    const tiltCards = document.querySelectorAll('[data-tilt]');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            
            // Mouse position relative to the card
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Normalized values (-1 to 1)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const percentX = (x - centerX) / centerX;
            const percentY = (y - centerY) / centerY;
            
            // Rotation configuration (max 10 degrees)
            const maxRotate = 10;
            const rotateX = (-percentY * maxRotate).toFixed(2);
            const rotateY = (percentX * maxRotate).toFixed(2);
            
            // Apply 3D rotation transform and slight scale-up
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
            
            // Inner lighting glow effect (optional visual detail)
            const borderGlowColor = 'rgba(6, 182, 212, 0.25)';
            card.style.borderColor = borderGlowColor;
            card.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.4), 0 0 25px rgba(124, 58, 237, 0.15)`;
        });
        
        card.addEventListener('mouseleave', () => {
            // Reset transition style smooth restoration
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
            card.style.borderColor = 'var(--glass-border)';
            card.style.boxShadow = 'var(--glass-shadow)';
        });
    });

    // 7. Contact Form Submission (Web3Forms API integration)
    const contactForm = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');

    if (contactForm && successMessage) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Capture elements to animate submit button state
            const submitBtn = contactForm.querySelector('.btn-submit');
            const submitText = submitBtn.querySelector('span');
            const submitIcon = document.getElementById('submit-icon');
            
            // Save original button state
            const originalText = submitText.textContent;
            
            // Loading state
            submitBtn.style.pointerEvents = 'none';
            submitText.textContent = 'Envoi en cours...';
            submitIcon.setAttribute('data-lucide', 'loader-2');
            submitIcon.classList.add('animate-spin');
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
            // Gather form data
            const formData = new FormData(contactForm);
            
            // Fallback key if user forgot to enter theirs (Web3Forms test key)
            if (formData.get('access_key') === 'YOUR_ACCESS_KEY_HERE') {
                // If they haven't set their key yet, we notify them
                alert("Pour activer le formulaire, veuillez d'abord créer votre clé d'accès gratuite sur web3forms.com et la remplacer à la ligne 219 de index.html.");
                // Reset button
                submitBtn.style.pointerEvents = 'auto';
                submitText.textContent = originalText;
                submitIcon.setAttribute('data-lucide', 'send');
                submitIcon.classList.remove('animate-spin');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                return;
            }

            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            // Fetch request to Web3Forms API
            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
            .then(async (response) => {
                const res = await response.json();
                if (response.status === 200) {
                    // Fade out form
                    contactForm.style.opacity = '0';
                    contactForm.style.transform = 'translateY(10px)';
                    
                    setTimeout(() => {
                        contactForm.style.display = 'none';
                        // Reveal success message
                        successMessage.style.display = 'flex';
                        // Trigger success animation fade in
                        setTimeout(() => {
                            successMessage.style.opacity = '1';
                            successMessage.style.transform = 'translateY(0)';
                        }, 50);
                    }, 400);
                } else {
                    console.error(res);
                    alert("Erreur lors de l'envoi : " + (res.message || "Une erreur est survenue."));
                    
                    // Reset button
                    submitBtn.style.pointerEvents = 'auto';
                    submitText.textContent = originalText;
                    submitIcon.setAttribute('data-lucide', 'send');
                    submitIcon.classList.remove('animate-spin');
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                }
            })
            .catch((error) => {
                console.error(error);
                alert("Une erreur de connexion est survenue. Veuillez vérifier votre connexion internet.");
                
                // Reset button
                submitBtn.style.pointerEvents = 'auto';
                submitText.textContent = originalText;
                submitIcon.setAttribute('data-lucide', 'send');
                submitIcon.classList.remove('animate-spin');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            });
        });
    }
});

// Inline helper css addition for loader spinner animation
const styleEl = document.createElement('style');
styleEl.innerHTML = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    #success-message {
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
`;
document.head.appendChild(styleEl);
